const express = require('express');
const router = express.Router();
const { getBattleById, surrenderBattle } = require('../controllers/battleController');
const auth = require('../middleware/auth');

router.get('/:id', auth, getBattleById);
router.post('/:id/surrender', auth, surrenderBattle);

module.exports = router;
