require('dotenv').config(); 
const mongoose = require('mongoose'); 
const Submission = require('./models/Submission'); 
mongoose.connect(process.env.MONGO_URI).then(async () => { 
  const sub = await Submission.findOne().sort({ createdAt: -1 }); 
  console.log('Language ID:', sub.languageId);
  console.log('Code:', sub.code);
  console.log('Status:', sub.status);
  process.exit(0); 
})
