const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code100x-'));
const filename = path.join(tmpDir, 'Main.java');
fs.writeFileSync(filename, 'public class Main { public static void main(String[] args) { System.out.println(5); } }');
const cmd = 'cd ' + tmpDir + ' && javac Main.java && java Main';
try {
  const stdout = execSync(cmd, { encoding: 'utf8' });
  console.log('stdout:', stdout);
} catch (e) {
  console.log('Error:', e.message);
}
