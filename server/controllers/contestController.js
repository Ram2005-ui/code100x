const Contest = require('../models/Contest');
const ContestParticipation = require('../models/ContestParticipation');
const Submission = require('../models/Submission');
const User = require('../models/User');

exports.getContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: -1 }).lean();
    
    // If user is authenticated, attach their participation status
    if (req.user) {
      const contestIds = contests.map(c => c._id);
      const participations = await ContestParticipation.find({ userId: req.user.id, contestId: { $in: contestIds } });
      const partMap = new Map();
      participations.forEach(p => partMap.set(p.contestId.toString(), p));
      
      contests.forEach(c => {
        const p = partMap.get(c._id.toString());
        if (p) {
          c.participation = { isStarted: true, isSubmitted: p.isSubmitted };
        }
      });
    }

    res.json(contests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('problems', 'title difficulty');
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.status(500).send('Server Error');
  }
};

exports.startContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });
    
    let participation = await ContestParticipation.findOne({ userId: req.user.id, contestId: contest._id });
    if (!participation) {
      participation = new ContestParticipation({
        userId: req.user.id,
        contestId: contest._id,
        startTime: new Date()
      });
      await participation.save();
    }
    res.json(participation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.submitContest = async (req, res) => {
  try {
    let participation = await ContestParticipation.findOne({ userId: req.user.id, contestId: req.params.id });
    if (!participation) return res.status(404).json({ message: 'Participation not found' });
    
    if (!participation.isSubmitted) {
      participation.isSubmitted = true;
      participation.submitTime = new Date();
      await participation.save();
    }
    res.json(participation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    // Find all participations for this contest
    const participations = await ContestParticipation.find({ contestId: contest._id }).populate('userId', 'name');
    const problemIds = contest.problems.map(p => p.toString());

    const leaderboardMap = new Map();

    for (let part of participations) {
      if (!part.userId) continue;
      
      const pStartTime = new Date(part.startTime);
      // Effective end time is either they submitted early, or the global contest duration (endTime - startTime) relative to their start
      // Note: we can use the global contest duration (e.g. 60 mins).
      const durationMs = new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime();
      let pEndTime = new Date(pStartTime.getTime() + durationMs);
      if (part.isSubmitted && part.submitTime < pEndTime) {
        pEndTime = new Date(part.submitTime);
      }

      // Fetch accepted submissions for this user for contest problems
      const submissions = await Submission.find({
        userId: part.userId._id,
        problemId: { $in: problemIds },
        status: 'Accepted',
        createdAt: { $gte: pStartTime, $lte: pEndTime }
      }).sort({ createdAt: 1 });

      // Calculate score (1 per unique problem) and penalty (time from start to submission)
      const solvedProblems = new Set();
      let lastSubmitTime = pStartTime;

      for (let sub of submissions) {
        if (!solvedProblems.has(sub.problemId.toString())) {
          solvedProblems.add(sub.problemId.toString());
          if (new Date(sub.createdAt) > lastSubmitTime) {
            lastSubmitTime = new Date(sub.createdAt);
          }
        }
      }

      leaderboardMap.set(part.userId._id.toString(), {
        userId: part.userId._id,
        name: part.userId.name,
        score: solvedProblems.size,
        lastSubmitTime: lastSubmitTime.getTime() - pStartTime.getTime() // Penalty in ms
      });
    }

    const leaderboard = Array.from(leaderboardMap.values());
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.lastSubmitTime - b.lastSubmitTime;
    });

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMyContestStatus = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    let participation = await ContestParticipation.findOne({ userId: req.user.id, contestId: contest._id });
    
    if (!participation) {
      return res.json({ solvedProblems: [] });
    }

    const problemIds = contest.problems.map(p => p.toString());
    
    // Effective end time
    const durationMs = new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime();
    let pEndTime = new Date(new Date(participation.startTime).getTime() + durationMs);
    if (participation.isSubmitted && participation.submitTime < pEndTime) {
      pEndTime = new Date(participation.submitTime);
    }

    const submissions = await Submission.find({
      userId: req.user.id,
      problemId: { $in: problemIds },
      status: 'Accepted',
      createdAt: { $gte: participation.startTime, $lte: pEndTime }
    });

    const solvedProblems = Array.from(new Set(submissions.map(s => s.problemId.toString())));
    
    res.json({ solvedProblems });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
