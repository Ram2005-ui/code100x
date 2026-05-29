const express = require('express');
const router = express.Router();
const { submitCode, getSubmission, getUserSubmissions, getProblemSubmissions, runCodeImmediate } = require('../controllers/submissionController');
const auth = require('../middleware/auth');

router.post('/', auth, submitCode);
router.post('/run', auth, runCodeImmediate);
router.get('/', auth, getUserSubmissions);
router.get('/problem/:problemId', auth, getProblemSubmissions);
router.get('/:id', auth, getSubmission);

module.exports = router;
