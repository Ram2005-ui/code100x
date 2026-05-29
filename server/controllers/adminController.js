const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const User = require('../models/User');

const getNGrams = (text, n) => {
  const clean = text.replace(/\s+/g, ''); // Remove whitespace
  const ngrams = new Set();
  for (let i = 0; i <= clean.length - n; i++) {
    ngrams.add(clean.substring(i, i + n));
  }
  return ngrams;
};

const calculateJaccard = (setA, setB) => {
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

exports.createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, testCases, editorial } = req.body;
    const problem = new Problem({ title, description, difficulty, testCases, editorial });
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.createContest = async (req, res) => {
  try {
    const { title, description, startTime, endTime, problems } = req.body;
    const contest = new Contest({ title, description, startTime, endTime, problems });
    await contest.save();
    res.status(201).json(contest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json(contest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    res.json({ message: 'Contest deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.checkPlagiarism = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the contest to get problemIds and time window
    const contest = await Contest.findById(id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    const problemIds = contest.problems;

    // Fetch all Accepted submissions for this contest's problems within the contest duration
    const submissions = await Submission.find({ 
      problemId: { $in: problemIds },
      status: 'Accepted',
      createdAt: { $gte: contest.startTime, $lte: contest.endTime }
    }).populate('userId', 'name').populate('problemId', 'title');

    // Group by problem
    const subsByProblem = {};
    submissions.forEach(sub => {
      const pid = sub.problemId._id.toString();
      if (!subsByProblem[pid]) subsByProblem[pid] = [];
      subsByProblem[pid].push(sub);
    });

    const flaggedPairs = [];
    const THRESHOLD = 0.8; // 80% similarity threshold

    // Compare pairs within each problem
    for (const pid in subsByProblem) {
      const subs = subsByProblem[pid];
      
      for (let i = 0; i < subs.length; i++) {
        for (let j = i + 1; j < subs.length; j++) {
          const sub1 = subs[i];
          const sub2 = subs[j];
          
          // Don't compare a user with themselves
          if (sub1.userId._id.toString() === sub2.userId._id.toString()) continue;

          // Optimization: If they use different languages, logic might be similar but syntax very different
          // However, we can still run it. If it's same language, it's more accurate.
          
          const ngrams1 = getNGrams(sub1.code, 4);
          const ngrams2 = getNGrams(sub2.code, 4);
          
          const similarity = calculateJaccard(ngrams1, ngrams2);
          
          if (similarity >= THRESHOLD) {
            flaggedPairs.push({
              problemTitle: sub1.problemId.title,
              user1: sub1.userId.name,
              user2: sub2.userId.name,
              similarity: (similarity * 100).toFixed(2),
              sub1Id: sub1._id,
              sub2Id: sub2._id
            });
          }
        }
      }
    }

    res.json(flaggedPairs);
  } catch (err) {
    console.error('Plagiarism check error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.disqualifySubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findByIdAndUpdate(id, { status: 'Disqualified' }, { new: true });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    
    // Emit a leaderboard update so connected clients refresh
    const io = req.app.get('io');
    if (io) io.emit('leaderboard_update', { submissionId: id });
    
    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
