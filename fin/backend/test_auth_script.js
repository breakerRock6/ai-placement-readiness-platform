const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
    try {
        // 1. Test Registration
        const uniqueEmail = `test${Date.now()}@example.com`;
        console.log(`Testing Registration with ${uniqueEmail}...`);

        const registerRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email: uniqueEmail,
            password: 'password123',
            role: 'student'
        });
        console.log('Registration Success:', registerRes.status === 201);
        console.log('Role:', registerRes.data.role);

        // 2. Test Login
        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: uniqueEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.status === 200);
        console.log('Token Received:', !!loginRes.data.token);

    } catch (error) {
        console.error('Auth Test Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
};

testAuth();
