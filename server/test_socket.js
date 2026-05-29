const io = require('socket.io-client');
const socket = io('http://localhost:5000');
socket.on('connect', () => {
  console.log('Connected');
  // Wait, I am a client here, I cannot emit 'global_activity' because the server doesn't broadcast 'global_activity' when a client sends it.
  // The server only emits 'global_activity' itself when a submission happens!
  process.exit(0);
});
