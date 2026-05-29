const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/code100x')
  .then(async () => {
    // Demote all users to 'user'
    await User.updateMany({}, { role: 'user' });
    
    // Promote the main account to 'admin'
    await User.updateOne({ email: 'ramanatangirala14@gmail.com' }, { role: 'admin' });
    
    console.log("Updated roles successfully.");
    process.exit(0);
  });
