const express = require('express');
const router = express.Router();
const { getContests, getContestById, startContest, submitContest, getLeaderboard, getMyContestStatus } = require('../controllers/contestController');
const auth = require('../middleware/auth');

router.get('/', auth, getContests);
router.get('/:id', auth, getContestById);
router.post('/:id/start', auth, startContest);
router.post('/:id/submit', auth, submitContest);
router.get('/:id/leaderboard', auth, getLeaderboard);
router.get('/:id/my-status', auth, getMyContestStatus);

module.exports = router;
