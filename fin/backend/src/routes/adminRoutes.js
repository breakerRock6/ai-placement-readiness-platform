const express = require('express');
const router = express.Router();
const { getAnalytics, getAllUsers, getAllJobs, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/jobs', protect, authorize('admin'), getAllJobs);
router.delete('/user/:userId', protect, authorize('admin'), deleteUser);

module.exports = router;
