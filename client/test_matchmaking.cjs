const io = require('socket.io-client');

const socket1 = io('http://localhost:5000');
const socket2 = io('http://localhost:5000');

socket1.on('connect', () => {
  console.log('Socket 1 connected:', socket1.id);
  socket1.emit('join_matchmaking', { id: 'user1', name: 'User One' });
});

socket1.on('match_found', (data) => {
  console.log('Socket 1 match found!', data);
});

socket1.on('matchmaking_error', (msg) => {
  console.log('Socket 1 error:', msg);
});

socket2.on('connect', () => {
  console.log('Socket 2 connected:', socket2.id);
  setTimeout(() => {
    socket2.emit('join_matchmaking', { id: 'user2', name: 'User Two' });
  }, 1000);
});

socket2.on('match_found', (data) => {
  console.log('Socket 2 match found!', data);
  process.exit(0);
});

socket2.on('matchmaking_error', (msg) => {
  console.log('Socket 2 error:', msg);
  process.exit(1);
});

setTimeout(() => {
  console.log('Timeout. Exiting.');
  process.exit(1);
}, 5000);
