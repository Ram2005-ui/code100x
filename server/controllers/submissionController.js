const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const fs = require('fs');
const path = require('path');
const os = require('os');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

// Language configs: extension + run command template
const LANGUAGE_CONFIG = {
  71:  { ext: 'py',   run: (f) => `python3 "${f}"` },
  63:  { ext: 'js',   run: (f) => `node "${f}"` },
  54:  { ext: 'cpp',  compiler: 'gcc-head', useWandbox: true },
  62:  { ext: 'java', compiler: 'openjdk-jdk-22+36', useWandbox: true },
};

const normalize = (str) => (str || '').trim().replace(/\r\n/g, '\n');

const runCode = async (languageId, code, stdin, testCaseIndex = 0) => {
  const config = LANGUAGE_CONFIG[languageId];
  if (!config) throw new Error(`Unsupported language: ${languageId}`);

  // Use Wandbox API for C++ and Java
  if (config.useWandbox) {
    try {
      console.log(`[Test ${testCaseIndex}] Running via Wandbox API`);
      
      // Wandbox Java hack: class cannot be public if file is named prog.java
      let finalCode = code;
      if (languageId === 62) {
        finalCode = finalCode.replace(/public\s+class\s+Main/, 'class Main');
      }

      const res = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: config.compiler,
          code: finalCode,
          stdin: stdin || ''
        })
      });
      
      const data = await res.json();
      
      if (data.status !== '0' && data.compiler_error) {
        console.error(`[Test ${testCaseIndex}] Compilation error:`, data.compiler_error);
        return { stdout: '', error: data.compiler_error, isCompilation: true };
      }
      if (data.status !== '0' && data.program_error) {
        console.error(`[Test ${testCaseIndex}] Runtime error:`, data.program_error);
        return { stdout: '', error: data.program_error, isCompilation: false };
      }
      
      console.log(`[Test ${testCaseIndex}] stdout: ${data.program_output || '(empty)'}`);
      return { stdout: data.program_output || '', error: null };
      
    } catch (err) {
      console.error(`[Test ${testCaseIndex}] Wandbox API error:`, err);
      return { stdout: '', error: err.message, isCompilation: false };
    }
  }

  // Execute everything locally since Render supports g++ for C++, node for JS, and python3 for Python.

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code100x-'));

  try {
    let filename, cmd;

    if (config.java) {
      filename = path.join(tmpDir, 'Main.java');
      fs.writeFileSync(filename, code);
      cmd = config.run(filename, tmpDir);
    } else if (config.compiled) {
      filename = path.join(tmpDir, `solution.${config.ext}`);
      const binFile = path.join(tmpDir, 'solution');
      fs.writeFileSync(filename, code);
      cmd = config.run(filename, binFile);
    } else {
      filename = path.join(tmpDir, `solution.${config.ext}`);
      fs.writeFileSync(filename, code);
      cmd = config.run(filename);
    }

    console.log(`[Test ${testCaseIndex}] Running: ${cmd}`);
    console.log(`[Test ${testCaseIndex}] stdin: ${stdin || '(empty)'}`);

    // If there's stdin, we need to pass it to the command differently
    if (stdin) {
      const stdinFile = path.join(tmpDir, 'input.txt');
      fs.writeFileSync(stdinFile, stdin + '\n');
      cmd = `${cmd} < "${stdinFile}"`;
    }

    const { stdout, stderr } = await execPromise(cmd, {
      timeout: 10000,
      maxBuffer: 1024 * 1024,
      encoding: 'utf8',
    });

    console.log(`[Test ${testCaseIndex}] stdout: ${stdout || '(empty)'}`);
    return { stdout, error: null };
  } catch (err) {
    console.error(`[Test ${testCaseIndex}] Execution error:`, err);
    
    if (err.killed || err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
      console.log(`[Test ${testCaseIndex}] Error type: TLE (timeout)`);
      return { stdout: '', error: 'TLE' };
    }
    
    const errorMsg = err.stderr?.toString() || err.message || 'Unknown error';
    const errorLower = errorMsg.toLowerCase();
    
    // Detect compilation vs runtime errors more accurately
    const isCompilationError = errorLower.includes('error:') || 
                                errorLower.includes('undefined reference') ||
                                errorLower.includes('syntax error') ||
                                errorLower.includes('cannot find');
    
    console.log(`[Test ${testCaseIndex}] Error type: ${isCompilationError ? 'Compilation' : 'Runtime'}`);
    console.log(`[Test ${testCaseIndex}] Error message: ${errorMsg}`);
    
    return { stdout: '', error: errorMsg, isCompilation: isCompilationError };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
};

exports.submitCode = async (req, res) => {
  try {
    const { problemId, languageId, code, battleId } = req.body;
    const userId = req.user.id;

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    if (!LANGUAGE_CONFIG[languageId]) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const submission = new Submission({ problemId, userId, languageId, code, status: 'Pending' });
    await submission.save();
    const submissionId = submission._id.toString();

    // Respond immediately with the ID so the client can listen via socket
    res.status(201).json({ submissionId, status: 'Pending' });

    // Get io instance before starting async work
    const io = req.app.get('io');
    console.log(`[${submissionId}] New submission from user ${userId} for problem ${problemId}`);

    // Run test cases asynchronously
    setImmediate(async () => {
      try {
        console.log(`[${submissionId}] Starting test case execution...`);
        let overallStatus = 'Accepted';
        let passedCases = 0;

        if (!problem.testCases || problem.testCases.length === 0) {
          console.warn(`[${submissionId}] ⚠️  No test cases found for problem ${problemId}`);
          overallStatus = 'No test cases';
        } else {
          console.log(`[${submissionId}] Found ${problem.testCases.length} test cases`);
          console.log(`[${submissionId}] Test cases:`, JSON.stringify(problem.testCases.map((tc, i) => ({
            index: i,
            inputLength: tc.input?.length || 0,
            expectedOutputLength: tc.expectedOutput?.length || 0,
            isHidden: tc.isHidden
          })), null, 2));
          
          for (let i = 0; i < problem.testCases.length; i++) {
            const testCase = problem.testCases[i];
            console.log(`[${submissionId}] Running test case ${i + 1}/${problem.testCases.length}...`);
            
            try {
              const { stdout, error } = await runCode(languageId, code, testCase.input, i + 1);
              
              if (error === 'TLE') {
                console.log(`[${submissionId}] Test case ${i + 1}: Time Limit Exceeded`);
                overallStatus = 'Time Limit Exceeded';
                break;
              }
              if (error && error.includes('error')) {
                console.log(`[${submissionId}] Test case ${i + 1}: ${languageId === 54 || languageId === 62 ? 'Compilation' : 'Runtime'} Error`);
                overallStatus = languageId === 54 || languageId === 62
                  ? 'Compilation Error'
                  : 'Runtime Error';
                break;
              }
              if (error) {
                console.log(`[${submissionId}] Test case ${i + 1}: Runtime Error - ${error}`);
                overallStatus = 'Runtime Error';
                break;
              }
              
              const expected = normalize(testCase.expectedOutput);
              const actual = normalize(stdout);
              
              if (actual !== expected) {
                console.log(`[${submissionId}] Test case ${i + 1}: Wrong Answer`);
                console.log(`  Expected: ${expected.substring(0, 100)}`);
                console.log(`  Got:      ${actual.substring(0, 100)}`);
                overallStatus = 'Wrong Answer';
                break;
              }
              
              
              console.log(`[${submissionId}] Test case ${i + 1}: Passed`);
              passedCases++;
              
              if (io && battleId) {
                io.to(`battle_${battleId}`).emit('battle_progress', { 
                  userId, 
                  passedCases, 
                  totalCases: problem.testCases.length 
                });
              }
            } catch (testErr) {
              console.error(`[${submissionId}] Error in test case ${i + 1}:`, testErr.message);
              overallStatus = 'Runtime Error';
              break;
            }
          }
        }

        await Submission.findByIdAndUpdate(submissionId, { status: overallStatus });
        console.log(`[${submissionId}] Final status: ${overallStatus}`);

        if (io) {
          console.log(`[${submissionId}] Emitting status to room submission_${submissionId}`);
          io.to(`submission_${submissionId}`).emit('submission_status_changed', { submissionId, status: overallStatus });
          if (overallStatus === 'Accepted') {
            console.log(`[${submissionId}] Accepted! Emitting leaderboard update`);
            io.emit('leaderboard_update', { submissionId });
            
            // Emit Global Activity Feed
            try {
              const User = require('../models/User');
              const userObj = await User.findById(userId);
              if (userObj) {
                io.emit('global_activity', {
                  type: 'solve',
                  message: `🚀 ${userObj.name} just solved ${problem.title}!`,
                  timestamp: new Date()
                });
              }
            } catch (actErr) {
              console.error('Failed to emit global activity', actErr);
            }
            
            if (battleId) {
              const Battle = require('../models/Battle');
              const battle = await Battle.findById(battleId);
              if (battle && battle.status === 'active') {
                battle.status = 'finished';
                battle.winner = userId;
                const playerIndex = battle.players.findIndex(p => p.userId.toString() === userId);
                if (playerIndex !== -1) battle.players[playerIndex].status = 'Won';
                battle.endTime = new Date();
                await battle.save();
                io.to(`battle_${battleId}`).emit('battle_over', { winner: userId, reason: 'solved' });
              }
            }
          }
        } else {
          console.error(`[${submissionId}] io instance not available`);
        }
      } catch (asyncErr) {
        console.error(`[${submissionId}] Async execution error:`, asyncErr);
        await Submission.findByIdAndUpdate(submissionId, { status: 'Internal Error' });
        if (io) {
          io.to(`submission_${submissionId}`).emit('submission_status_changed', { submissionId, status: 'Internal Error' });
        }
      }
    });

  } catch (err) {
    console.error('Submission error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });
    res.json({ submission });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Submission not found' });
    res.status(500).send('Server Error');
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      userId: req.user.id, 
      problemId: req.params.problemId 
    }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.runCodeImmediate = async (req, res) => {
  try {
    const { problemId, languageId, code, customInput } = req.body;
    
    if (!LANGUAGE_CONFIG[languageId]) {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    let visibleTestCases = problem.testCases ? problem.testCases.filter(tc => !tc.isHidden) : [];
    
    if (customInput !== undefined && customInput !== null) {
      visibleTestCases = [{ input: customInput, expectedOutput: '' }];
    }

    if (visibleTestCases.length === 0) {
      return res.json({ results: [], overallStatus: 'No visible test cases' });
    }

    const results = [];
    let overallStatus = 'Accepted';

    for (let i = 0; i < visibleTestCases.length; i++) {
      const tc = visibleTestCases[i];
      let status = 'Passed';
      let actualOutput = '';
      let errorMsg = null;

      try {
        const { stdout, error, isCompilation } = await runCode(languageId, code, tc.input, i + 1);
        actualOutput = normalize(stdout);

        if (error === 'TLE') {
          status = 'Time Limit Exceeded';
          overallStatus = overallStatus === 'Accepted' ? 'Time Limit Exceeded' : overallStatus;
        } else if (error) {
          status = isCompilation ? 'Compilation Error' : 'Runtime Error';
          errorMsg = error;
          overallStatus = overallStatus === 'Accepted' ? status : overallStatus;
        } else {
          const expected = normalize(tc.expectedOutput);
          if (customInput === undefined || customInput === null) {
            if (actualOutput !== expected) {
              status = 'Wrong Answer';
              overallStatus = overallStatus === 'Accepted' ? 'Wrong Answer' : overallStatus;
            }
          }
        }
      } catch (err) {
        status = 'Runtime Error';
        errorMsg = err.message;
        overallStatus = overallStatus === 'Accepted' ? 'Runtime Error' : overallStatus;
      }

      results.push({
        index: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        status,
        error: errorMsg
      });
    }

    res.json({ results, overallStatus });
  } catch (err) {
    console.error('Run Code error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
