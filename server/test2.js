const { execSync } = require('child_process');
try {
  execSync('node -e "setTimeout(() => {}, 2000);"', { timeout: 1000, encoding: 'utf8' });
} catch(e) {
  console.log('code:', e.code, 'killed:', e.killed, 'signal:', e.signal);
}
