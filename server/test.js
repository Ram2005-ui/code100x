const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const LANGUAGE_CONFIG = {
  71:  { ext: 'py',   run: (f) => `python "${f}"` },
};

const runCode = (languageId, code, stdin) => {
  const config = LANGUAGE_CONFIG[languageId];
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code100x-'));

  try {
    const filename = path.join(tmpDir, `solution.${config.ext}`);
    fs.writeFileSync(filename, code);
    const cmd = config.run(filename);

    const stdinFile = path.join(tmpDir, 'stdin.txt');
    fs.writeFileSync(stdinFile, stdin || '');

    const start = Date.now();
    const stdout = execSync(`${cmd} < "${stdinFile}"`, {
      timeout: 10000,
      maxBuffer: 1024 * 1024,
      encoding: 'utf8',
    });
    console.log('Time:', Date.now() - start);

    return { stdout, error: null };
  } catch (err) {
    if (err.killed || err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
      return { stdout: '', error: 'TLE' };
    }
    return { stdout: '', error: err.stderr || err.message };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
  }
};

const pyCode = `
import sys
input_data = sys.stdin.read().split()
if len(input_data) >= 2:
    print(int(input_data[0]) + int(input_data[1]))
`;

console.log('Testing Python sys.stdin...');
console.log('Result:', runCode(71, pyCode, '3 4\n'));

const pyCode2 = `
a, b = map(int, input().split())
print(a+b)
`;

console.log('Testing Python input()...');
console.log('Result:', runCode(71, pyCode2, '3 4\n'));
