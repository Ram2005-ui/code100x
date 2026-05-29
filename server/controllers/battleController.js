const Battle = require('../models/Battle');

exports.getBattleById = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate('problemId', 'title description difficulty')
      .populate('players.userId', 'name');
      
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' });
    }

    // Verify user is part of the battle
    const isPlayer = battle.players.some(p => p.userId._id.toString() === req.user.id);
    if (!isPlayer) {
      return res.status(403).json({ message: 'You are not part of this battle' });
    }

    res.json(battle);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Battle not found' });
    }
    res.status(500).send('Server Error');
  }
};

exports.surrenderBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle || battle.status === 'finished') {
      return res.status(400).json({ message: 'Battle not active' });
    }

    const playerIndex = battle.players.findIndex(p => p.userId.toString() === req.user.id);
    if (playerIndex === -1) {
      return res.status(403).json({ message: 'Not part of battle' });
    }

    battle.players[playerIndex].status = 'Surrendered';
    battle.status = 'finished';
    
    // Find opponent to declare winner
    const opponent = battle.players.find(p => p.userId.toString() !== req.user.id);
    if (opponent) {
      opponent.status = 'Won';
      battle.winner = opponent.userId;
    }
    battle.endTime = new Date();
    await battle.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`battle_${battle._id}`).emit('battle_over', { winner: battle.winner, reason: 'surrender' });
    }

    res.json(battle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
