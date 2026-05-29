const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/code100x').then(async () => {
  await User.updateOne({ email: 'krishna@gmail.com' }, { $set: { isVerified: true } });
  console.log('Verified krishna@gmail.com');
  process.exit(0);
});
