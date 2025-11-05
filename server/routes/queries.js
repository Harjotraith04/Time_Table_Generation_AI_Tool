const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Query = require('../models/Query');
const User = require('../models/User');
const Timetable = require('../models/Timetable');
const { authenticateToken } = require('./auth');
const { sendQueryNotification, sendQueryResponseEmail } = require('../utils/emailService');

const router = express.Router();

// Middleware for role checking
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

const isFacultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'faculty')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or faculty privileges required.'
    });
  }
};

// All routes require authentication
router.use(authenticateToken);

// Get all queries (with filters)
router.get('/', [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'resolved']),
  query('type').optional().isIn(['timetable-conflict', 'schedule-change', 'general', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, type, priority, page = 1, limit = 50 } = req.query;

    // Build query
    const queryFilter = {};
    if (status) queryFilter.status = status;
    if (type) queryFilter.type = type;
    if (priority) queryFilter.priority = priority;

    // If user is student, only show their queries
    if (req.user.role === 'student') {
      queryFilter['submittedBy.userId'] = req.user.userId;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const queries = await Query.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Query.countDocuments(queryFilter);

    res.json({
      success: true,
      data: queries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch queries',
      error: error.message 
    });
  }
});

// Get a single query by ID
router.get('/:id', async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('timetableId', 'name academicYear semester')
      .populate('submittedBy.userId', 'name email role');

    if (!query) {
      return res.status(404).json({ 
        success: false,
        message: 'Query not found' 
      });
    }

    // Check permissions: students can only view their own queries
    if (req.user.role === 'student' && query.submittedBy.userId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to view this query' 
      });
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    console.error('Error fetching query:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch query',
      error: error.message 
    });
  }
});

// Create a new query
router.post('/', [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['timetable-conflict', 'schedule-change', 'general', 'other']).withMessage('Invalid query type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('timetableId').optional().isMongoId().withMessage('Invalid timetable ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, type, priority, timetableId } = req.body;

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify timetable exists if provided
    if (timetableId) {
      const timetable = await Timetable.findById(timetableId);
      if (!timetable) {
        return res.status(404).json({ 
          success: false,
          message: 'Timetable not found' 
        });
      }
    }

    // Create query
    const newQuery = new Query({
      subject,
      description,
      type,
      priority: priority || 'medium',
      timetableId,
      submittedBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    await newQuery.save();

    // Send notification email to admins
    try {
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await sendQueryNotification(admin.email, newQuery, user);
      }
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Don't fail the query creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      data: newQuery
    });
  } catch (error) {
    console.error('Error creating query:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create query',
      error: error.message 
    });
  }
});

// Update query status (admin/faculty only)
router.patch('/:id/status', isFacultyOrAdmin, [
  body('status').isIn(['pending', 'approved', 'rejected', 'resolved']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ 
        success: false,
        message: 'Query not found' 
      });
    }

    query.status = status;
    await query.save();

    // Send notification to the user who submitted the query
    try {
      const user = await User.findById(query.submittedBy.userId);
      if (user && user.email) {
        await sendQueryResponseEmail(user.email, query, status);
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Query status updated successfully',
      data: query
    });
  } catch (error) {
    console.error('Error updating query status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update query status',
      error: error.message 
    });
  }
});

// Respond to a query (admin/faculty only)
router.post('/:id/respond', isFacultyOrAdmin, [
  body('response').trim().notEmpty().withMessage('Response is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { response } = req.body;
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ 
        success: false,
        message: 'Query not found' 
      });
    }

    const respondingUser = await User.findById(req.user.userId);

    query.adminResponse = response;
    query.respondedBy = {
      userId: respondingUser._id,
      name: respondingUser.name,
      email: respondingUser.email
    };
    query.respondedAt = new Date();
    query.status = 'resolved';

    await query.save();

    // Send email to the user who submitted the query
    try {
      const submitter = await User.findById(query.submittedBy.userId);
      if (submitter && submitter.email) {
        await sendQueryResponseEmail(submitter.email, query, 'resolved', response);
      }
    } catch (emailError) {
      console.error('Error sending response email:', emailError);
    }

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: query
    });
  } catch (error) {
    console.error('Error responding to query:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to respond to query',
      error: error.message 
    });
  }
});

// Add a comment to a query
router.post('/:id/comments', [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ 
        success: false,
        message: 'Query not found' 
      });
    }

    // Check permissions
    const isOwner = query.submittedBy.userId.toString() === req.user.userId;
    const isAdminOrFaculty = ['admin', 'faculty'].includes(req.user.role);

    if (!isOwner && !isAdminOrFaculty) {
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to comment on this query' 
      });
    }

    const user = await User.findById(req.user.userId);

    query.comments.push({
      text,
      commentedBy: {
        userId: user._id,
        name: user.name,
        email: user.email
      },
      commentedAt: new Date()
    });

    await query.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: query
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add comment',
      error: error.message 
    });
  }
});

// Delete a query (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({ 
        success: false,
        message: 'Query not found' 
      });
    }

    await Query.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Query deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete query',
      error: error.message 
    });
  }
});

// Get query statistics (admin/faculty only)
router.get('/statistics/overview', isFacultyOrAdmin, async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();
    const pendingQueries = await Query.countDocuments({ status: 'pending' });
    const approvedQueries = await Query.countDocuments({ status: 'approved' });
    const rejectedQueries = await Query.countDocuments({ status: 'rejected' });
    const resolvedQueries = await Query.countDocuments({ status: 'resolved' });

    const queriesByType = await Query.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const queriesByPriority = await Query.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalQueries,
        pending: pendingQueries,
        approved: approvedQueries,
        rejected: rejectedQueries,
        resolved: resolvedQueries,
        byType: queriesByType,
        byPriority: queriesByPriority
      }
    });
  } catch (error) {
    console.error('Error fetching query statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch query statistics',
      error: error.message 
    });
  }
});

module.exports = router;
