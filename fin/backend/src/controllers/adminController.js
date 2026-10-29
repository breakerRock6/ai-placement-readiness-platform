const User = require('../models/User');
const Job = require('../models/Job');
const Profile = require('../models/Profile');

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const recruiterCount = await User.countDocuments({ role: 'recruiter' });
        const jobCount = await Job.countDocuments();
        const activeJobCount = await Job.countDocuments({ isActive: true });

        // Get recent activities
        const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(3).select('title company createdAt');
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3).select('name role createdAt');
        const recentProfiles = await Profile.find().sort({ createdAt: -1 }).limit(3).populate('user', 'name').select('user createdAt');

        const recentActivity = [];

        recentJobs.forEach(job => {
            recentActivity.push({
                id: `job-${job._id}`,
                action: 'New Job Posted',
                details: `${job.title} at ${job.company}`,
                time: job.createdAt
            });
        });

        recentUsers.forEach(user => {
            recentActivity.push({
                id: `user-${user._id}`,
                action: 'New User Joined',
                details: `${user.name} (${user.role})`,
                time: user.createdAt
            });
        });

        // Combine and sort by time
        recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json({
            users: {
                students: studentCount,
                recruiters: recruiterCount,
                total: studentCount + recruiterCount
            },
            jobs: {
                total: jobCount,
                active: activeJobCount
            },
            placements: {
                placed: Math.round(studentCount * 0.45), // Mock based on real count
                pending: studentCount - Math.round(studentCount * 0.45),
                avgPackage: '12 LPA'
            },
            recentActivity: recentActivity.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private/Admin
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('recruiter', 'name email').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/user/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'student') {
            await Profile.findOneAndDelete({ user: user._id });
        } else if (user.role === 'recruiter') {
            await Job.deleteMany({ recruiter: user._id });
        }

        await User.findByIdAndDelete(req.params.userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
