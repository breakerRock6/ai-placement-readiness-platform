const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    education: [
        {
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startYear: String,
            endYear: String,
            cgpa: Number,
        },
    ],
    experience: [
        {
            company: String,
            position: String,
            description: String,
            startDate: String,
            endDate: String,
        },
    ],
    skills: [String],
    categorizedSkills: {
        type: Map,
        of: [String]
    },
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String,
    },
    resumeUrl: String,
    resumeScore: {
        type: Number,
        default: 0,
    },
    prs: {
        type: Number,
        default: 0,
    },
    prsBreakdown: {
        type: Map,
        of: Number
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    explanation: String,
    gaps: {
        critical: [String],
        upskilling_paths: [String]
    },
    marketStandardUsed: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Profile', profileSchema);
