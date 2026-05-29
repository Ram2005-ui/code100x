const mongoose = require('mongoose');

const contestParticipationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  startTime: { type: Date, required: true },
  isSubmitted: { type: Boolean, default: false },
  submitTime: { type: Date }
}, { timestamps: true });

// Ensure a user can only participate in a contest once
contestParticipationSchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model('ContestParticipation', contestParticipationSchema);
