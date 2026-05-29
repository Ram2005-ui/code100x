const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  upvotes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
