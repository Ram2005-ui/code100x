import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/code100x';

// ✏️  Change this to your registered email
const EMAIL = 'john@gmail.com';

const run = async () => {
  await mongoose.connect(MONGO_URI);

  // List all users first so you can see what emails exist
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  
  if (users.length === 0) {
    console.log('⚠️  No users found in DB at all. Please register on the website first.');
    process.exit(0);
  }

  console.log('📋 Users in database:');
  users.forEach(u => console.log(`  - ${u.email} (role: ${u.role || 'user'})`));
  console.log('');

  const result = await mongoose.connection.db
    .collection('users')
    .updateOne({ email: EMAIL }, { $set: { role: 'admin' } });

  if (result.matchedCount === 0) {
    console.log(`❌ No user found with email: ${EMAIL}`);
    console.log('👆 Pick an email from the list above and update the EMAIL variable in this script.');
  } else {
    console.log(`✅ Successfully made ${EMAIL} an admin!`);
  }

  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
