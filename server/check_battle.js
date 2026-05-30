require('dotenv').config(); 
const mongoose = require('mongoose'); 
const Battle = require('./models/Battle'); 
mongoose.connect(process.env.MONGO_URI).then(async () => { 
  const battle = await Battle.findOne().sort({ createdAt: -1 }); 
  console.log('Battle ID:', battle._id);
  console.log('Status:', battle.status);
  console.log('Winner:', battle.winner);
  process.exit(0); 
})
