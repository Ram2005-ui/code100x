const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  progress: { type: Number, default: 0 }, // percentage or number of passed test cases
  status: { type: String, enum: ['Playing', 'Won', 'Surrendered'], default: 'Playing' },
  languageId: { type: Number }
});

const battleSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  players: [playerSchema],
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'active' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);
