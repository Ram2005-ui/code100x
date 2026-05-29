const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/code100x');
    const result = await User.updateMany({}, { $set: { role: 'admin' } });
    console.log(`Updated ${result.modifiedCount} users to admin role.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

makeAdmin();
