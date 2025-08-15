import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import Timetable from '../models/Timetable.js';
import TimetableGenerator from '../services/TimetableGenerator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Validation middleware
const validateTimetableGeneration = [
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('semester').isIn(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']).withMessage('Invalid semester'),
  body('program').notEmpty().withMessage('Program is required'),
  body('school').notEmpty().withMessage('School is required'),
  body('scope').optional().isIn(['class', 'teacher', 'room', 'division', 'batch']).withMessage('Invalid scope'),
  body('targetId').optional().notEmpty().withMessage('Target ID is required when scope is specified'),
  body('algorithm').optional().isIn(['genetic', 'constraint_satisfaction', 'heuristic']).withMessage('Invalid algorithm'),
  body('customConstraints').optional().isObject().withMessage('Custom constraints must be an object')
];

const validateTimetableUpdate = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('status').optional().isIn(['draft', 'generating', 'generated', 'validated', 'approved', 'published', 'archived']).withMessage('Invalid status'),
  body('entries').optional().isArray().withMessage('Entries must be an array')
];

// ==================== TIMETABLE GENERATION ====================

/**
 * @route POST /api/timetables/generate
 * @desc Generate a new timetable
 * @access Private
 */
router.post('/generate', validateTimetableGeneration, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const generator = new TimetableGenerator();
    const timetable = await generator.generateTimetable({
      ...req.body,
      createdBy: req.user.id
    });

    // Save to database
    await timetable.save();

    res.status(201).json({
      success: true,
      message: 'Timetable generated successfully',
      data: {
        timetableId: timetable.timetableId,
        status: timetable.status,
        totalEntries: timetable.totalEntries,
        totalHours: timetable.totalHours,
        validation: timetable.validation
      }
    });

  } catch (error) {
    console.error('Timetable generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate timetable',
      error: error.message
    });
  }
}));

/**
 * @route POST /api/timetables/generate/async
 * @desc Generate timetable asynchronously (for long-running operations)
 * @access Private
 */
router.post('/generate/async', validateTimetableGeneration, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Create initial timetable record
    const timetable = new Timetable({
      ...req.body,
      status: 'generating',
      createdBy: req.user.id,
      generationInfo: {
        algorithm: req.body.algorithm || 'genetic',
        startTime: new Date(),
        parameters: {}
      }
    });

    await timetable.save();

    // Start generation in background
    setImmediate(async () => {
      try {
        const generator = new TimetableGenerator();
        const generatedTimetable = await generator.generateTimetable({
          ...req.body,
          createdBy: req.user.id
        });

        // Update the existing record
        timetable.entries = generatedTimetable.entries;
        timetable.status = 'generated';
        timetable.generationInfo.endTime = new Date();
        timetable.validation = generatedTimetable.validation;

        await timetable.save();

        console.log(`Timetable ${timetable.timetableId} generated successfully`);

      } catch (error) {
        console.error(`Error generating timetable ${timetable.timetableId}:`, error);
        
        timetable.status = 'draft';
        timetable.validation.errors.push({
          type: 'error',
          message: `Generation failed: ${error.message}`,
          severity: 'critical'
        });

        await timetable.save();
      }
    });

    res.status(202).json({
      success: true,
      message: 'Timetable generation started',
      data: {
        timetableId: timetable.timetableId,
        status: timetable.status,
        progressUrl: `/api/timetables/generate/${timetable.timetableId}/progress`
      }
    });

  } catch (error) {
    console.error('Async timetable generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start timetable generation',
      error: error.message
    });
  }
}));

/**
 * @route GET /api/timetables/generate/:id/progress
 * @desc Get generation progress
 * @access Private
 */
router.get('/generate/:id/progress', asyncHandler(async (req, res) => {
  const timetable = await Timetable.findOne({ timetableId: req.params.id });
  
  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found'
    });
  }

  const progress = {
    timetableId: timetable.timetableId,
    status: timetable.status,
    progress: 0,
    estimatedTimeRemaining: null,
    currentStep: null
  };

  // Calculate progress based on status
  switch (timetable.status) {
    case 'draft':
      progress.progress = 0;
      progress.currentStep = 'Initialized';
      break;
    case 'generating':
      progress.progress = 50;
      progress.currentStep = 'Generating timetable';
      if (timetable.generationInfo.startTime) {
        const elapsed = Date.now() - timetable.generationInfo.startTime;
        progress.estimatedTimeRemaining = Math.max(0, 300000 - elapsed); // 5 minutes estimate
      }
      break;
    case 'generated':
      progress.progress = 75;
      progress.currentStep = 'Validating constraints';
      break;
    case 'validated':
      progress.progress = 100;
      progress.currentStep = 'Completed';
      break;
    default:
      progress.progress = 0;
      progress.currentStep = 'Unknown';
  }

  res.json({
    success: true,
    data: progress
  });
}));

// ==================== TIMETABLE CRUD OPERATIONS ====================

/**
 * @route GET /api/timetables
 * @desc Get all timetables with filtering and pagination
 * @access Private
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['draft', 'generating', 'generated', 'validated', 'approved', 'published', 'archived']).withMessage('Invalid status'),
  query('program').optional().notEmpty().withMessage('Program cannot be empty'),
  query('academicYear').optional().notEmpty().withMessage('Academic year cannot be empty'),
  query('semester').optional().isIn(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']).withMessage('Invalid semester')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const {
    page = 1,
    limit = 10,
    status,
    program,
    academicYear,
    semester,
    scope,
    targetId
  } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (program) filter.program = program;
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;
  if (scope) filter.scope = scope;
  if (targetId) filter.targetId = targetId;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [timetables, total] = await Promise.all([
    Timetable.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .select('-entries'), // Don't include entries in list view
    Timetable.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      timetables,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
}));

/**
 * @route GET /api/timetables/:id
 * @desc Get timetable by ID
 * @access Private
 */
router.get('/:id', [
  param('id').notEmpty().withMessage('Timetable ID is required'),
  query('format').optional().isIn(['full', 'summary', 'matrix']).withMessage('Invalid format')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { format = 'full' } = req.query;
  const timetable = await Timetable.findOne({ timetableId: req.params.id })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('approvedBy', 'name email');

  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found'
    });
  }

  let responseData = timetable;

  // Format response based on requested format
  if (format === 'summary') {
    responseData = {
      timetableId: timetable.timetableId,
      name: timetable.name,
      status: timetable.status,
      academicYear: timetable.academicYear,
      semester: timetable.semester,
      program: timetable.program,
      school: timetable.school,
      totalEntries: timetable.totalEntries,
      totalHours: timetable.totalHours,
      validation: timetable.validation,
      createdAt: timetable.createdAt,
      updatedAt: timetable.updatedAt
    };
  } else if (format === 'matrix') {
    responseData = this.formatTimetableMatrix(timetable);
  }

  res.json({
    success: true,
    data: responseData
  });
}));

/**
 * @route PUT /api/timetables/:id
 * @desc Update timetable
 * @access Private
 */
router.put('/:id', [
  param('id').notEmpty().withMessage('Timetable ID is required'),
  ...validateTimetableUpdate
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const timetable = await Timetable.findOne({ timetableId: req.params.id });
  
  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found'
    });
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (key !== 'timetableId' && key !== 'createdBy') {
      timetable[key] = req.body[key];
    }
  });

  timetable.updatedBy = req.user.id;

  // Re-validate if entries were updated
  if (req.body.entries) {
    const validation = timetable.validateConstraints();
    timetable.validation = validation;
    
    if (validation.isValid) {
      timetable.status = 'validated';
    } else {
      timetable.status = 'generated';
    }
  }

  await timetable.save();

  res.json({
    success: true,
    message: 'Timetable updated successfully',
    data: {
      timetableId: timetable.timetableId,
      status: timetable.status,
      validation: timetable.validation
    }
  });
}));

/**
 * @route DELETE /api/timetables/:id
 * @desc Delete timetable
 * @access Private
 */
router.delete('/:id', [
  param('id').notEmpty().withMessage('Timetable ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const timetable = await Timetable.findOne({ timetableId: req.params.id });
  
  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found'
    });
  }

  // Soft delete - change status to archived
  timetable.status = 'archived';
  timetable.updatedBy = req.user.id;
  await timetable.save();

  res.json({
    success: true,
    message: 'Timetable archived successfully'
  });
}));

// ==================== TIMETABLE STATUS MANAGEMENT ====================

/**
 * @route PATCH /api/timetables/:id/status
 * @desc Update timetable status
 * @access Private
 */
router.patch('/:id/status', [
  param('id').notEmpty().withMessage('Timetable ID is required'),
  body('status').isIn(['draft', 'generating', 'generated', 'validated', 'approved', 'published', 'archived']).withMessage('Invalid status'),
  body('comments').optional().isString().withMessage('Comments must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { status, comments } = req.body;
  const timetable = await Timetable.findOne({ timetableId: req.params.id });
  
  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found'
    });
  }

  // Update status
  timetable.status = status;
  timetable.updatedBy = req.user.id;

  // Handle approval
  if (status === 'approved') {
    timetable.approvedBy = req.user.id;
    timetable.approvedAt = new Date();
  }

  // Add status change comment
  if (comments) {
    if (!timetable.validation.comments) {
      timetable.validation.comments = [];
    }
    timetable.validation.comments.push({
      timestamp: new Date(),
      user: req.user.id,
      status: status,
      comment: comments
    });
  }

  await timetable.save();

  res.json({
    success: true,
    message: 'Timetable status updated successfully',
    data: {
      timetableId: timetable.timetableId,
      status: timetable.status,
      approvedBy: timetable.approvedBy,
      approvedAt: timetable.approvedAt
    }
  });
}));

// ==================== TIMETABLE VALIDATION ====================

/**
 * @route POST /api/timetables/:id/validate
 * @desc Validate timetable constraints
 * @access Private
 */
router.post('/:id/validate', [
  param('id').notEmpty().withMessage('Timetable ID is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const timetable = await Timetable.findOne({ timetableId: req.params.id });
  
  if (!timetable) {
    return res.status(404).json({
      success: false,
      message: 'Timetable not found'
    });
  }

  // Validate constraints
  const validation = timetable.validateConstraints();
  timetable.validation = validation;
  timetable.status = validation.isValid ? 'validated' : 'generated';
  timetable.updatedBy = req.user.id;

  await timetable.save();

  res.json({
    success: true,
    message: 'Timetable validation completed',
    data: {
      timetableId: timetable.timetableId,
      status: timetable.status,
      validation: validation
    }
  });
}));

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format timetable as a matrix (day vs time)
 */
formatTimetableMatrix(timetable) {
  const matrix = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  // Initialize matrix
  days.forEach(day => {
    matrix[day] = {};
  });

  // Populate matrix with entries
  timetable.entries.forEach(entry => {
    if (!matrix[entry.day][entry.startTime]) {
      matrix[entry.day][entry.startTime] = [];
    }
    matrix[entry.day][entry.startTime].push({
      courseCode: entry.courseCode,
      courseName: entry.courseName,
      teacherName: entry.teacherName,
      roomName: entry.roomName,
      batch: entry.batch,
      division: entry.division,
      duration: entry.duration
    });
  });

  return {
    timetableId: timetable.timetableId,
    name: timetable.name,
    academicYear: timetable.academicYear,
    semester: timetable.semester,
    program: timetable.program,
    school: timetable.school,
    matrix: matrix,
    timeSlots: timetable.scheduleConfig.timeSlots
  };
}

export default router;
