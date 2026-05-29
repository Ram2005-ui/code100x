const express = require('express');
const router = express.Router();
const { createProblem, updateProblem, deleteProblem, createContest, updateContest, deleteContest, checkPlagiarism, disqualifySubmission } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.post('/problems', auth, adminOnly, createProblem);
router.put('/problems/:id', auth, adminOnly, updateProblem);
router.delete('/problems/:id', auth, adminOnly, deleteProblem);

router.post('/contests', auth, adminOnly, createContest);
router.put('/contests/:id', auth, adminOnly, updateContest);
router.delete('/contests/:id', auth, adminOnly, deleteContest);
router.get('/contests/:id/plagiarism', auth, adminOnly, checkPlagiarism);
router.post('/submissions/:id/disqualify', auth, adminOnly, disqualifySubmission);

module.exports = router;
