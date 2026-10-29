const Job = require('../models/Job');
const Profile = require('../models/Profile');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');

// @desc    Post a new job
// @route   POST /api/recruiter/job
// @access  Private/Recruiter
exports.postJob = async (req, res) => {
    try {
        const { title, company, description, skillsRequired, location, salaryRange, type } = req.body;

        const job = await Job.create({
            recruiter: req.user._id,
            title,
            company,
            description,
            skillsRequired,
            location,
            salaryRange,
            type
        });

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all jobs posted by recruiter
// @route   GET /api/recruiter/jobs
// @access  Private/Recruiter
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get job details with applicants
// @route   GET /api/recruiter/job/:jobId
// @access  Private/Recruiter
exports.getJobDetails = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id })
            .populate('applicants.student', 'name email');

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Filter out applicants where student data might legacy be missing/deleted
        const validApplicants = job.applicants.filter(a => a.student);

        // Populate profiles for valid applicants separately to get skills
        const applicantIds = validApplicants.map(a => a.student._id || a.student);
        const profiles = await Profile.find({ user: { $in: applicantIds } });

        const enrichedApplicants = validApplicants.map(app => {
            const studentId = app.student._id || app.student;
            const profile = profiles.find(p => p.user.toString() === studentId.toString());
            return {
                ...app._doc,
                student: app.student, // Keep the populated user data
                skills: profile?.skills || [],
                resumeUrl: profile?.resumeUrl || ''
            };
        });

        res.json({ ...job._doc, applicants: enrichedApplicants });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update applicant status
// @route   PUT /api/recruiter/job/:jobId/applicant/:studentId
// @access  Private/Recruiter
exports.updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });

        if (!job) return res.status(404).json({ message: 'Job not found' });

        const applicant = job.applicants.find(a => a.student.toString() === req.params.studentId);
        if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

        applicant.status = status;
        await job.save();

        // Real-time Notification to Student (Socket)
        const io = req.app.get('io');
        if (io) {
            io.to(req.params.studentId).emit('application_status_update', {
                title: 'Application Update',
                message: `Your application for ${job.title} at ${job.company} has been ${status}.`,
                status: status,
                jobId: job._id
            });
        }

        // Email Notification to Student
        try {
            const studentUser = await User.findById(req.params.studentId);
            if (studentUser && studentUser.email) {
                await sendEmail({
                    email: studentUser.email,
                    subject: `Application Status Updated: ${job.title}`,
                    message: `Hi ${studentUser.name},\n\nYour application status for the position of "${job.title}" at ${job.company} has been updated to: ${status}.\n\nLog in to the portal to see more details.\n\nBest regards,\nPlacement Team`,
                    html: `<h3>Application Status Update</h3><p>Hi ${studentUser.name},</p><p>Your application status for <b>${job.title}</b> at <b>${job.company}</b> has been updated to: <span style="color: blue; font-weight: bold;">${status}</span>.</p><p><a href="http://localhost:5173/login">Click here to log in</a></p>`
                });
            }
        } catch (err) {
            console.error("Email notification error:", err.message);
        }

        res.json({ message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get top candidates (Globally)
// @route   GET /api/recruiter/candidates
// @access  Private/Recruiter
exports.getTopCandidates = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', 'name email');
        const scoredCandidates = profiles.map(p => {
            if (!p.user) return null;
            return {
                ...p._doc,
                matchScore: p.prs || 0
            };
        }).filter(p => p !== null).sort((a, b) => b.matchScore - a.matchScore);
        res.json(scoredCandidates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student details for recruiter review
// @route   GET /api/recruiter/student/:studentId
// @access  Private/Recruiter
exports.getStudentDetails = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.studentId }).populate('user', 'name email');
        if (!profile) return res.status(404).json({ message: 'Student profile not found' });
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a job posting
// @route   PUT /api/recruiter/job/:jobId
// @access  Private/Recruiter
exports.updateJob = async (req, res) => {
    try {
        const { title, company, description, skillsRequired, location, salaryRange, type } = req.body;
        let job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user._id });

        if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

        job.title = title || job.title;
        job.company = company || job.company;
        job.description = description || job.description;
        job.skillsRequired = skillsRequired || job.skillsRequired;
        job.location = location || job.location;
        job.salaryRange = salaryRange || job.salaryRange;
        job.type = type || job.type;

        await job.save();
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a job posting
// @route   DELETE /api/recruiter/job/:jobId
// @access  Private/Recruiter
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.jobId, recruiter: req.user._id });
        if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
