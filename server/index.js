const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const Battle = require('./models/Battle');
const Problem = require('./models/Problem');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling']
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/code100x';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Matchmaking Queue
let matchmakingQueue = [];

// Handle Socket connections
io.on('connection', (socket) => {
  console.log('✓ New socket client connected:', socket.id);

  socket.on('join_submission_room', (submissionId) => {
    socket.join(`submission_${submissionId}`);
    console.log(`✓ Socket ${socket.id} joined room submission_${submissionId}`);
  });

  socket.on('join_matchmaking', async (user) => {
    // user = { id, name }
    if (!user || !user.id) return;
    
    // Check if already in queue
    if (matchmakingQueue.find(p => p.id === user.id)) return;
    
    matchmakingQueue.push({ ...user, socketId: socket.id });
    console.log(`[Matchmaking] ${user.name} joined queue. Size: ${matchmakingQueue.length}`);

    if (matchmakingQueue.length >= 2) {
      const p1 = matchmakingQueue.shift();
      const p2 = matchmakingQueue.shift();

      try {
        // Pick a random problem
        const count = await Problem.countDocuments();
        if (count === 0) {
          console.error('[Matchmaking] No problems available');
          io.to(p1.socketId).emit('matchmaking_error', 'No problems available to start a battle');
          io.to(p2.socketId).emit('matchmaking_error', 'No problems available to start a battle');
          return;
        }
        
        const random = Math.floor(Math.random() * count);
        const problem = await Problem.findOne().skip(random);

        // Create Battle
        const battle = new Battle({
          problemId: problem._id,
          players: [
            { userId: p1.id, name: p1.name },
            { userId: p2.id, name: p2.name }
          ]
        });
        await battle.save();

        console.log(`[Matchmaking] Match found! Battle ID: ${battle._id}`);
        
        io.to(p1.socketId).emit('match_found', { battleId: battle._id });
        io.to(p2.socketId).emit('match_found', { battleId: battle._id });
        
        io.emit('global_activity', {
          type: 'battle',
          message: `⚔️ A new battle started: ${p1.name} vs ${p2.name}!`,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('[Matchmaking] Error creating match:', err);
      }
    }
  });

  socket.on('leave_matchmaking', (userId) => {
    matchmakingQueue = matchmakingQueue.filter(p => p.id !== userId);
    console.log(`[Matchmaking] User ${userId} left queue. Size: ${matchmakingQueue.length}`);
  });

  socket.on('join_battle_room', (battleId) => {
    socket.join(`battle_${battleId}`);
    console.log(`✓ Socket ${socket.id} joined battle room battle_${battleId}`);
  });

  socket.on('error', (error) => {
    console.error(`✗ Socket error on ${socket.id}:`, error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`✗ Socket disconnected ${socket.id}:`, reason);
    // Remove from matchmaking if they disconnect
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'server' });
});

const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');
const contestRoutes = require('./routes/contestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const battleRoutes = require('./routes/battleRoutes');
const statsRoutes = require('./routes/statsRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
