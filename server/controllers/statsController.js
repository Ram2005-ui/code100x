const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');

exports.getHomeStats = async (req, res) => {
  try {
    // 1. Platform Statistics
    const [userCount, problemCount, submissionCount] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments()
    ]);

    // 2. Upcoming Contest
    const now = new Date();
    const upcomingContest = await Contest.findOne({ startTime: { $gt: now } })
      .sort({ startTime: 1 })
      .select('title startTime endTime description')
      .lean();

    // 3. Top Coders (Simplified: users with most Accepted submissions, distinct by problem)
    // To make this efficient, we can aggregate Submissions
    const topUsersAggregation = await Submission.aggregate([
      { $match: { status: 'Accepted' } },
      { $group: { _id: { user: '$userId', problem: '$problemId' } } },
      { $group: { _id: '$_id.user', solvedCount: { $sum: 1 } } },
      { $sort: { solvedCount: -1 } },
      { $limit: 3 }
    ]);
    
    // Populate user names
    await User.populate(topUsersAggregation, { path: '_id', select: 'name avatarUrl' });
    
    const topUsers = topUsersAggregation
      .filter(t => t._id) // Filter out deleted users
      .map(t => ({
        id: t._id._id,
        name: t._id.name,
        avatarUrl: t._id.avatarUrl,
        solvedCount: t.solvedCount
      }));

    res.json({
      stats: {
        users: userCount,
        problems: problemCount,
        submissions: submissionCount
      },
      upcomingContest,
      topUsers
    });
  } catch (err) {
    console.error('Failed to get home stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
