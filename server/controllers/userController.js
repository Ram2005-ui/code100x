const User = require('../models/User');
const Submission = require('../models/Submission');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all submissions for this user
    const submissions = await Submission.find({ userId: user._id }).populate('problemId', 'title');
    
    const totalSubmissions = submissions.length;
    
    // Find unique problems solved (Status = 'Accepted')
    const solvedProblems = new Set();
    submissions.forEach(sub => {
      if (sub.status === 'Accepted' && sub.problemId) {
        solvedProblems.add(sub.problemId._id.toString());
      }
    });

    const stats = {
      totalSubmissions,
      problemsSolved: solvedProblems.size,
      recentSubmissions: submissions.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
    };

    // Calculate Heatmap Data (last 180 days)
    const heatmapData = [];
    const submissionsByDate = {};
    const today = new Date();
    
    // Initialize last 180 days with 0
    for (let i = 180; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      submissionsByDate[dateStr] = 0;
    }
    
    submissions.forEach(sub => {
      const dateStr = new Date(sub.createdAt).toISOString().split('T')[0];
      if (submissionsByDate[dateStr] !== undefined) {
        submissionsByDate[dateStr]++;
      }
    });
    
    for (const [date, count] of Object.entries(submissionsByDate)) {
      heatmapData.push({ date, count });
    }
    
    // Sort by date ascending
    heatmapData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ user, stats, heatmapData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      { $match: { status: 'Accepted' } },
      // Group by user and problem to get unique solved problems
      { $group: { _id: { userId: "$userId", problemId: "$problemId" } } },
      // Group by user to count solved problems
      { $group: { _id: "$_id.userId", problemsSolved: { $sum: 1 } } },
      // Sort by most solved
      { $sort: { problemsSolved: -1 } },
      { $limit: 50 },
      // Lookup user details
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, userId: "$_id", name: "$user.name", problemsSolved: 1 } }
    ]);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
