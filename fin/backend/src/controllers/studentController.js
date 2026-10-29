const Profile = require('../models/Profile');
const Job = require('../models/Job');
const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// @desc    Get current user profile
// @route   GET /api/student/profile
// @access  Private/Student
exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update user profile
// @route   POST /api/student/profile
// @access  Private/Student
exports.upsertProfile = async (req, res) => {
    const { education, experience, skills, socialLinks } = req.body;

    const profileFields = {
        user: req.user._id,
        education,
        experience,
        skills,
        socialLinks,
    };

    try {
        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new Profile(profileFields);
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload resume
// @route   POST /api/student/resume
// @access  Private/Student
exports.uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const resumePath = req.file.path.replace(/\\/g, "/"); // Normalize path

        let profile = await Profile.findOne({ user: req.user._id });

        if (!profile) {
            profile = new Profile({ user: req.user._id, resumeUrl: resumePath });
        } else {
            profile.resumeUrl = resumePath;
        }

        // Call AI Engine
        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path));

            const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';
            const aiResponse = await axios.post(`${aiEngineUrl}/analyze`, formData, {
                headers: { ...formData.getHeaders() }
            });

            const {
                skills,
                categorized_skills,
                prs,
                breakdown,
                experience_years,
                explanation,
                gaps,
                market_standard_used
            } = aiResponse.data;

            console.log("AI Analysis Success:", { prs, skillsCount: skills?.length });

            profile.skills = skills || [];
            profile.categorizedSkills = categorized_skills || {};
            profile.resumeScore = prs || 0;
            profile.prs = prs || 0;
            profile.prsBreakdown = breakdown || {};
            profile.experienceYears = experience_years || 0;
            profile.explanation = explanation || "Analysis complete.";
            profile.gaps = gaps || { critical: [], upskilling_paths: [] };
            profile.marketStandardUsed = market_standard_used || "General Benchmark";

            console.log("Profile state prepared for DB save.");

        } catch (aiError) {
            console.error("AI Service Error:", aiError.message, aiError.response?.data);
        }

        try {
            console.log("Saving profile for user:", req.user._id);
            await profile.save();
            console.log("Profile save SUCCESS");
        } catch (saveError) {
            console.error("Profile Save ERROR:", saveError.message);
            throw saveError; // Re-throw to be caught by outer catch and sent to client
        }

        res.json({
            message: 'Resume uploaded & analyzed successfully',
            filePath: resumePath,
            profile
        });
    } catch (error) {
        console.error("Critical Upload Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active jobs for matching
// @route   GET /api/student/jobs
// @access  Private/Student
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Apply for a job
// @route   POST /api/student/apply/:jobId
// @access  Private/Student
exports.applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        const profile = await Profile.findOne({ user: req.user._id });

        if (!job) return res.status(404).json({ message: 'Job not found' });

        // Check if already applied
        const alreadyApplied = job.applicants.find(a => a.student.toString() === req.user._id.toString());
        if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

        job.applicants.push({
            student: req.user._id,
            matchScore: profile?.resumeScore || 0
        });

        await job.save();

        // Real-time Notification to Recruiter (Socket)
        const io = req.app.get('io');
        if (io) {
            io.to(job.recruiter.toString()).emit('new_application', {
                title: 'New Applicant',
                message: `A student has applied for ${job.title}.`,
                jobId: job._id
            });
        }

        // Email Notification to Recruiter
        try {
            const recruiterUser = await User.findById(job.recruiter);
            if (recruiterUser && recruiterUser.email) {
                await sendEmail({
                    email: recruiterUser.email,
                    subject: `New Applicant for ${job.title}`,
                    message: `Hi ${recruiterUser.name},\n\nA student has applied for your job opening: "${job.title}".\n\nLog in to the dashboard to review the application and ATS match score.\n\nBest regards,\nPlacement System`,
                    html: `<h3>New Job Application</h3><p>Hi ${recruiterUser.name},</p><p>A student has applied for your job opening: <b>${job.title}</b>.</p><p><a href="http://localhost:5173/login">Click here to log in and review</a></p>`
                });
            }
        } catch (err) {
            console.error("Recruiter email notification error:", err.message);
        }

        res.json({ message: 'Applied successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
