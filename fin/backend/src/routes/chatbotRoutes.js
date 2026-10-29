const express = require('express');
const router = express.Router();
const { queryDocumentation, getFAQ } = require('../controllers/chatbotController');

// @route   POST /api/chatbot/query
// @desc    Query documentation chatbot
// @access  Public
router.post('/query', queryDocumentation);

// @route   GET /api/chatbot/faq
// @desc    Get frequently asked questions
// @access  Public
router.get('/faq', getFAQ);

module.exports = router;
