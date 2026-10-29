const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    skillsRequired: [String],
    location: String,
    salaryRange: String,
    type: {
        type: String, // Full-time, Internship, etc.
        default: 'Full-time'
    },
    applicants: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            matchScore: Number,
            status: {
                type: String,
                enum: ['Applied', 'Shortlisted', 'Rejected', 'Hired'],
                default: 'Applied'
            },
            appliedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Job', jobSchema);
