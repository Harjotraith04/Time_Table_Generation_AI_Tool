const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const chatbotService = require('../utils/chatbotService');

/**
 * @route   POST /api/chatbot/message
 * @desc    Process chatbot message and return response
 * @access  Private
 */
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, userRole, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Use authenticated user's info if not provided
    const role = userRole || req.user.role;
    const id = userId || req.user._id;

    const response = await chatbotService.processMessage(message, role, id);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred processing your message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get suggested questions based on user role
 * @access  Private
 */
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    const suggestions = {
      admin: [
        "Show me active timetables",
        "Which rooms are currently available?",
        "How can I optimize the timetable?",
        "Show me faculty members",
        "What are the different optimization algorithms?"
      ],
      faculty: [
        "Where is Professor [Name]?",
        "Show me today's schedule",
        "Which rooms are free right now?",
        "Show me my teaching schedule",
        "What courses are available?"
      ],
      student: [
        "Show me my schedule for today",
        "Where is my professor right now?",
        "What rooms are available?",
        "Show me the timetable",
        "Where can I find [Teacher Name]?"
      ]
    };

    res.json({
      success: true,
      suggestions: suggestions[userRole] || suggestions.student
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions'
    });
  }
});

/**
 * @route   POST /api/chatbot/feedback
 * @desc    Submit feedback on chatbot response
 * @access  Private
 */
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { messageId, rating, comment } = req.body;

    // In a production environment, you would store this feedback in a database
    console.log('Chatbot feedback received:', {
      user: req.user._id,
      messageId,
      rating,
      comment,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
});

module.exports = router;
