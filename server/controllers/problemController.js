const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Comment = require('../models/Comment');

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select('-testCases').lean();
    
    // Fetch all submissions for the current user
    const userSubmissions = await Submission.find({ userId: req.user.id }).select('problemId status').lean();
    
    // Create a map of problemId to their best status
    const statusMap = {};
    userSubmissions.forEach(sub => {
      const pid = sub.problemId.toString();
      if (sub.status === 'Accepted') {
        statusMap[pid] = 'Solved';
      } else if (statusMap[pid] !== 'Solved') {
        statusMap[pid] = 'Attempted';
      }
    });

    const problemsWithStatus = problems.map(p => ({
      ...p,
      status: statusMap[p._id.toString()] || 'Unsolved'
    }));

    res.json(problemsWithStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    const sanitizedProblem = problem.toObject();
    
    const user = await require('../models/User').findById(req.user.id);
    const isAdmin = user && user.role === 'admin';

    if (!isAdmin) {
      // Do not return hidden test cases to the client
      sanitizedProblem.testCases = sanitizedProblem.testCases.map(tc => {
        if (tc.isHidden) {
          return { _id: tc._id, isHidden: true };
        }
        return tc;
      });
    }

    // Check if user has solved this problem
    const acceptedSub = await Submission.findOne({ problemId: problem._id, userId: req.user.id, status: 'Accepted' });
    if (acceptedSub) {
      sanitizedProblem.status = 'Solved';
    }

    res.json(sanitizedProblem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Admin route to create problem
exports.createProblem = async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    const problem = await newProblem.save();
    res.status(201).json(problem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Admin route to update problem
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Admin route to delete problem
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    // Optionally delete all submissions for this problem
    await Submission.deleteMany({ problemId: req.params.id });
    res.json({ message: 'Problem deleted successfully' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(500).send('Server Error');
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ problemId: req.params.id })
      .populate('userId', 'name avatarUrl')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });
    
    const comment = new Comment({
      problemId: req.params.id,
      userId: req.user.id,
      content
    });
    await comment.save();
    
    const populatedComment = await comment.populate('userId', 'name avatarUrl');
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
