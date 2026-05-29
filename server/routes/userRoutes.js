const express = require('express');
const router = express.Router();
const { getUserProfile, getLeaderboard, updateUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
