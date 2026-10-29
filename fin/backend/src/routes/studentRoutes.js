const express = require('express');
const router = express.Router();
const { getProfile, upsertProfile, uploadResume, getAllJobs, applyToJob } = require('../controllers/studentController');
const { saveScore, getScores, getLeaderboard } = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, authorize('student'), getProfile);
router.post('/profile', protect, authorize('student'), upsertProfile);

const upload = require('../middleware/uploadMiddleware');

router.post('/resume', protect, authorize('student'), upload.single('resume'), uploadResume);
router.get('/jobs', protect, authorize('student'), getAllJobs);
router.post('/apply/:jobId', protect, authorize('student'), applyToJob);

// Game Routes
router.post('/game/score', protect, authorize('student'), saveScore);
router.get('/game/scores', protect, authorize('student'), getScores);
router.get('/game/leaderboard/:gameType', protect, authorize('student'), getLeaderboard);

module.exports = router;
