const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testRecruiter = async () => {
    try {
        // 1. Login as Recruiter
        const uniqueEmail = `recruiter${Date.now()}@example.com`;
        console.log(`Creating Recruiter: ${uniqueEmail}`);

        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Test Recruiter',
            email: uniqueEmail,
            password: 'password123',
            role: 'recruiter'
        });
        const token = regRes.data.token;
        console.log('Recruiter Registered. Token:', !!token);

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Post a Job
        console.log('Posting Job...');
        const jobRes = await axios.post(`${API_URL}/recruiter/job`, {
            title: 'SDE 1',
            company: 'Tech Corp',
            description: 'Coding job',
            skillsRequired: ['Java', 'Python'],
            location: 'Remote',
            salaryRange: '10-15 LPA'
        }, config);
        console.log('Job Posted:', jobRes.status === 201);

        // 3. Get Jobs
        console.log('Fetching Jobs...');
        const jobsRes = await axios.get(`${API_URL}/recruiter/jobs`, config);
        console.log('Jobs Found:', jobsRes.data.length);

        // 4. Get Candidates (Mock)
        console.log('Fetching Candidates...');
        const candidatesRes = await axios.get(`${API_URL}/recruiter/candidates`, config);
        console.log('Candidates Found:', candidatesRes.data.length);

    } catch (error) {
        console.error('Recruiter Test Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
};

testRecruiter();
