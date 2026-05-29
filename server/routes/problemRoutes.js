const express = require('express');
const router = express.Router();
const { getAllProblems, getProblemById, createProblem, updateProblem, deleteProblem, getComments, createComment } = require('../controllers/problemController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/', auth, getAllProblems);
router.get('/:id', auth, getProblemById);
router.get('/:id/comments', auth, getComments);
router.post('/:id/comments', auth, createComment);
router.post('/', auth, adminAuth, createProblem);
router.put('/:id', auth, adminAuth, updateProblem);
router.delete('/:id', auth, adminAuth, deleteProblem);

module.exports = router;
