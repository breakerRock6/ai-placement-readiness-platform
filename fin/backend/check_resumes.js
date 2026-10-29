const mongoose = require('mongoose');
const Profile = require('./src/models/Profile');
const dotenv = require('dotenv');
dotenv.config();

const checkResumes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const profiles = await Profile.find({}, 'user resumeUrl');
        console.log('--- RESUME DATA ---');
        profiles.forEach(p => {
            console.log(`User: ${p.user}, Resume: ${p.resumeUrl}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkResumes();
