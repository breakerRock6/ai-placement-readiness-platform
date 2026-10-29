const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameType: {
        type: String,
        required: true,
        enum: ['mind', 'problem-solving', 'car', 'bike', 'puzzle']
    },
    score: {
        type: Number,
        required: true
    },
    bestScore: {
        type: Number,
        default: 0
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('GameScore', gameScoreSchema);
