const express = require('express');
const router = express.Router();
const { register, login, getMe, googleAuth, verifyEmail } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', auth, getMe);

module.exports = router;
