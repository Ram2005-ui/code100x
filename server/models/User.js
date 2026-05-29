const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: 'Software Engineer and Competitive Programmer' },
  avatarUrl: { type: String, default: '' },
  passwordHash: { type: String }, // Optional for Google OAuth users
  googleId: { type: String }, // For Google OAuth users
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
