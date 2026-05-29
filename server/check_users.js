const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/code100x').then(async () => {
  const users = await User.find({}, { name: 1, email: 1, isVerified: 1, otp: 1, _id: 0 }).sort({ createdAt: -1 }).limit(3);
  console.log(users);
  process.exit(0);
});
