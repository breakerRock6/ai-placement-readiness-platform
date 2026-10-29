const GameScore = require('../models/GameScore');

exports.saveScore = async (req, res) => {
    try {
        const { gameType, score } = req.body;
        const userId = req.user._id;

        let gameScore = await GameScore.findOne({ user: userId, gameType });

        if (!gameScore) {
            gameScore = new GameScore({
                user: userId,
                gameType,
                score,
                bestScore: score
            });
        } else {
            gameScore.score = score;
            if (score > gameScore.bestScore) {
                gameScore.bestScore = score;
            }
        }

        await gameScore.save();
        res.status(200).json({ message: 'Score saved successfully', gameScore });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getScores = async (req, res) => {
    try {
        const scores = await GameScore.find({ user: req.user._id });
        res.status(200).json(scores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { gameType } = req.params;
        const leaderboard = await GameScore.find({ gameType })
            .sort({ bestScore: -1 })
            .limit(10)
            .populate('user', 'name');
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
