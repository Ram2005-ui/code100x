const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Contest = require('./models/Contest');
const Problem = require('./models/Problem');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/code100x';

const seedContests = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Seeding Contests');

    await Contest.deleteMany({});
    
    // Fetch some existing problems to attach to contests
    const problems = await Problem.find().limit(3);
    const problemIds = problems.map(p => p._id);

    const now = new Date();
    
    // Create an active contest
    const activeContest = new Contest({
      title: 'Weekly Orbit Challenge #42',
      description: 'Join our weekly algorithmic challenge. Solve 3 problems in 2 hours to rank up!',
      startTime: new Date(now.getTime() - 3600000), // started 1 hour ago
      endTime: new Date(now.getTime() + 3600000),   // ends in 1 hour
      problems: problemIds
    });

    // Create an upcoming contest
    const upcomingContest = new Contest({
      title: 'Beginner Friendly 100x Sprint',
      description: 'A special contest aimed at newcomers. Easy difficulty problems focused on arrays and strings.',
      startTime: new Date(now.getTime() + 86400000 * 2), // starts in 2 days
      endTime: new Date(now.getTime() + 86400000 * 2 + 7200000), // 2 hour duration
      problems: [problemIds[0]] // just attach one for testing
    });

    // Create a past contest
    const pastContest = new Contest({
      title: 'Monthly Hackathon May 2026',
      description: 'Our massive monthly event. See how you performed against top coders.',
      startTime: new Date(now.getTime() - 86400000 * 10), // 10 days ago
      endTime: new Date(now.getTime() - 86400000 * 10 + 10800000), // 3 hour duration
      problems: problemIds
    });

    await Contest.insertMany([activeContest, upcomingContest, pastContest]);
    console.log('Successfully seeded contests');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding Contests:', err);
    process.exit(1);
  }
};

seedContests();
