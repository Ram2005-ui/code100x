const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/code100x')
  .then(async () => {
    const users = await User.find({});
    users.forEach(u => console.log(u._id, u.email, u.role));
    process.exit(0);
  });
