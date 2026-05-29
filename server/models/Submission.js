const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  languageId: { type: Number, required: true },
  code: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error', 'Internal Error', 'Disqualified'],
    default: 'Pending'
  },
  judge0Tokens: [{ type: String }], // Array of tokens for each test case
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
