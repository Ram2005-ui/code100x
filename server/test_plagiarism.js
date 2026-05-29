const mongoose = require('mongoose');
const Contest = require('./models/Contest');
const Submission = require('./models/Submission');
const { checkPlagiarism } = require('./controllers/adminController');

mongoose.connect('mongodb://localhost:27017/code100x')
  .then(async () => {
    console.log('Connected');
    const contest = await Contest.findOne();
    if (!contest) {
      console.log('No contests found');
      process.exit(0);
    }
    console.log('Checking plagiarism for contest', contest.title, contest._id);
    
    // mock req, res
    const req = { params: { id: contest._id.toString() } };
    const res = {
      json: (data) => {
        console.log('Result:', data);
        process.exit(0);
      },
      status: (code) => {
        return {
          json: (data) => {
            console.log('Status', code, data);
            process.exit(code === 200 ? 0 : 1);
          }
        }
      }
    };
    
    await checkPlagiarism(req, res);
  });
