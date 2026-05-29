const mongoose = require('mongoose');
const Problem = require('./models/Problem');

mongoose.connect('mongodb://localhost:27017/code100x').then(async () => {
  const problems = await Problem.find({});
  problems.forEach(p => {
    console.log(`\n=== ${p.title} ===`);
    if (p.testCases && p.testCases.length > 0) {
      console.log('TC 1 Input:', JSON.stringify(p.testCases[0].input));
      console.log('TC 1 Output:', JSON.stringify(p.testCases[0].expectedOutput));
    }
  });
  process.exit(0);
});
