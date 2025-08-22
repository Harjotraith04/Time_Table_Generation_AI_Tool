const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const OptimizationEngine = require('../algorithms/OptimizationEngine');
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Store active generation processes
const activeGenerations = new Map();

/**
 * @route   POST /api/timetables/generate
 * @desc    Start timetable generation process
 * @access  Private
 */
router.post('/generate', [
  body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Name is required and must be less than 150 characters'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('year').optional().isInt({ min: 1, max: 5 }),
  body('settings.algorithm').isIn(['genetic', 'csp', 'hybrid', 'backtracking', 'simulated_annealing']).withMessage('Invalid algorithm'),
  body('settings.populationSize').optional().isInt({ min: 10, max: 500 }),
  body('settings.maxGenerations').optional().isInt({ min: 100, max: 5000 }),
  body('settings.crossoverRate').optional().isFloat({ min: 0, max: 1 }),
  body('settings.mutationRate').optional().isFloat({ min: 0, max: 1 }),
  body('settings.optimizationGoals').optional().isArray(),
  body('settings.workingDays').optional().isArray({ min: 1, max: 7 }),
  body('settings.startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('settings.endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('settings.slotDuration').optional().isInt({ min: 30, max: 180 }),
  body('settings.breakSlots').optional().isArray(),
  body('settings.enforceBreaks').optional().isBoolean(),
  body('settings.balanceWorkload').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, academicYear, semester, department, year, settings } = req.body;

    // Create timetable record
    const timetable = new Timetable({
      name,
      academicYear,
      semester,
      department,
      year,
      status: 'generating',
      generationSettings: settings,
      createdBy: req.user.userId
    });

    await timetable.save();

    const timetableId = timetable._id.toString();

    logger.info('Timetable generation started', {
      timetableId,
      algorithm: settings.algorithm,
      department,
      semester,
      startedBy: req.user.userId
    });

    // Start generation process asynchronously
    generateTimetableAsync(timetableId, department, year, semester, settings, req.app.get('io'));

    res.status(202).json({
      success: true,
      message: 'Timetable generation started',
      timetableId,
      status: 'generating'
    });

  } catch (error) {
    logger.error('Error starting timetable generation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while starting generation'
    });
  }
});

/**
 * @route   GET /api/timetables/generate/:id/progress
 * @desc    Get generation progress for a timetable
 * @access  Private
 */
router.get('/generate/:id/progress', async (req, res) => {
  try {
    const timetableId = req.params.id;
    
    // Check if generation is active
    if (activeGenerations.has(timetableId)) {
      const generationInfo = activeGenerations.get(timetableId);
      return res.json({
        success: true,
        status: 'generating',
        progress: {
          percentage: generationInfo.progress || 0,
          currentStep: generationInfo.currentStep || 'Initializing',
          generation: generationInfo.generation || 0,
          fitness: generationInfo.fitness || 0
        },
        startTime: generationInfo.startTime
      });
    }

    // Check database for completed/failed generation
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      status: timetable.status,
      progress: {
        percentage: timetable.status === 'completed' ? 100 : 0,
        currentStep: timetable.status === 'completed' ? 'Completed' : 'Failed'
      },
      metrics: timetable.metrics,
      quality: timetable.quality
    });

  } catch (error) {
    logger.error('Error fetching generation progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching progress'
    });
  }
});

/**
 * @route   GET /api/timetables
 * @desc    Get all timetables with optional filtering
 * @access  Private
 */
router.get('/', [
  query('status').optional().isIn(['draft', 'generating', 'completed', 'published', 'archived']),
  query('department').optional().trim(),
  query('academicYear').optional().trim(),
  query('semester').optional().isInt({ min: 1, max: 2 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, department, academicYear, semester, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (status) query.status = status;
    if (department) query.department = department;
    if (academicYear) query.academicYear = academicYear;
    if (semester) query.semester = parseInt(semester);

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const timetables = await Timetable.find(query)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Timetable.countDocuments(query);

    res.json({
      success: true,
      data: timetables,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching timetables'
    });
  }
});

/**
 * @route   GET /api/timetables/:id
 * @desc    Get a specific timetable
 * @access  Private
 */
router.get('/:id', [
  query('format').optional().isIn(['full', 'summary', 'schedule_only'])
], async (req, res) => {
  try {
    const { format = 'full' } = req.query;
    
    let timetable;
    if (format === 'schedule_only') {
      timetable = await Timetable.findById(req.params.id).select('schedule name academicYear semester department');
    } else if (format === 'summary') {
      timetable = await Timetable.findById(req.params.id)
        .select('-schedule -conflicts -comments')
        .populate('createdBy', 'name email');
    } else {
      timetable = await Timetable.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .populate('comments.user', 'name email');
    }

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      data: timetable
    });

  } catch (error) {
    logger.error('Error fetching timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching timetable'
    });
  }
});

/**
 * @route   PATCH /api/timetables/:id/status
 * @desc    Update timetable status
 * @access  Private
 */
router.patch('/:id/status', [
  body('status').isIn(['draft', 'completed', 'published', 'archived']).withMessage('Invalid status'),
  body('comments').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, comments } = req.body;
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Update status
    timetable.status = status;
    timetable.lastModifiedBy = req.user.userId;

    if (status === 'published') {
      timetable.publishedAt = new Date();
    }

    // Add comment if provided
    if (comments) {
      timetable.comments.push({
        user: req.user.userId,
        comment: comments,
        timestamp: new Date()
      });
    }

    await timetable.save();

    logger.info('Timetable status updated', {
      timetableId: timetable._id,
      status,
      updatedBy: req.user.userId
    });

    res.json({
      success: true,
      message: 'Timetable status updated successfully',
      data: {
        id: timetable._id,
        status: timetable.status,
        publishedAt: timetable.publishedAt
      }
    });

  } catch (error) {
    logger.error('Error updating timetable status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating status'
    });
  }
});

/**
 * @route   DELETE /api/timetables/:id
 * @desc    Delete a timetable
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Only allow deletion of draft or failed timetables
    if (timetable.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete published timetable. Archive it instead.'
      });
    }

    // Soft delete by setting isActive to false
    timetable.isActive = false;
    await timetable.save();

    logger.info('Timetable deleted', {
      timetableId: timetable._id,
      deletedBy: req.user.userId
    });

    res.json({
      success: true,
      message: 'Timetable deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting timetable'
    });
  }
});

/**
 * @route   POST /api/timetables/:id/comments
 * @desc    Add comment to timetable
 * @access  Private
 */
router.post('/:id/comments', [
  body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Comment is required and must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    timetable.comments.push({
      user: req.user.userId,
      comment: req.body.comment,
      timestamp: new Date()
    });

    await timetable.save();

    res.json({
      success: true,
      message: 'Comment added successfully'
    });

  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding comment'
    });
  }
});

/**
 * @route   GET /api/timetables/statistics/overview
 * @desc    Get timetable generation statistics
 * @access  Private
 */
router.get('/statistics/overview', async (req, res) => {
  try {
    const stats = await Timetable.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgQuality: { $avg: '$quality.overallScore' },
          avgGenerationTime: { $avg: '$metrics.duration' }
        }
      }
    ]);

    const departmentStats = await Timetable.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          publishedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          }
        }
      }
    ]);

    const algorithmStats = await Timetable.aggregate([
      {
        $group: {
          _id: '$generationSettings.algorithm',
          count: { $sum: 1 },
          avgQuality: { $avg: '$quality.overallScore' },
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution: stats,
        departmentStatistics: departmentStats,
        algorithmPerformance: algorithmStats,
        summary: {
          totalTimetables: await Timetable.countDocuments({ isActive: true }),
          completedTimetables: await Timetable.countDocuments({ status: 'completed', isActive: true }),
          publishedTimetables: await Timetable.countDocuments({ status: 'published', isActive: true }),
          activeDepartments: departmentStats.length
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching timetable statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics'
    });
  }
});

/**
 * Async function to handle timetable generation
 */
async function generateTimetableAsync(timetableId, department, year, semester, settings, io) {
  try {
    // Store generation info
    activeGenerations.set(timetableId, {
      startTime: Date.now(),
      progress: 0,
      currentStep: 'Initializing',
      generation: 0,
      fitness: 0
    });

    // Emit start event
    io.to(`generation_${timetableId}`).emit('generation_started', {
      timetableId,
      status: 'generating'
    });

    logger.info('Starting timetable generation process', { timetableId, department });

    // Fetch data
    const progressCallback = (progress, step, generation, fitness) => {
      const generationInfo = activeGenerations.get(timetableId);
      if (generationInfo) {
        generationInfo.progress = progress;
        generationInfo.currentStep = step || generationInfo.currentStep;
        generationInfo.generation = generation || generationInfo.generation;
        generationInfo.fitness = fitness || generationInfo.fitness;
        
        // Emit progress update
        io.to(`generation_${timetableId}`).emit('generation_progress', {
          timetableId,
          progress,
          step,
          generation,
          fitness
        });
      }
    };

    // Update progress
    progressCallback(10, 'Loading data');

    // Fetch required data
    const query = { department };
    if (year) query.year = year;
    if (semester) query.semester = semester;

    const [teachers, classrooms, courses] = await Promise.all([
      Teacher.find({ status: 'active' }),
      Classroom.find({ status: 'available' }),
      Course.find({ ...query, isActive: true })
    ]);

    logger.info('Data loaded for generation', {
      timetableId,
      teachers: teachers.length,
      classrooms: classrooms.length,
      courses: courses.length
    });

    progressCallback(20, 'Initializing optimization engine');

    // Initialize optimization engine
    const optimizationEngine = new OptimizationEngine();

    // Start optimization
    progressCallback(30, 'Starting optimization');
    
    const result = await optimizationEngine.optimize(
      teachers,
      classrooms,
      courses,
      settings,
      (progress, step, generation, fitness) => {
        progressCallback(30 + (progress * 0.6), step, generation, fitness);
      }
    );

    if (result.success) {
      progressCallback(95, 'Saving results');

      // Update timetable in database
      const timetable = await Timetable.findById(timetableId);
      timetable.status = 'completed';
      timetable.schedule = result.solution;
      timetable.conflicts = result.conflicts || [];
      timetable.metrics = result.metrics;
      timetable.quality = result.metrics.qualityMetrics;
      
      // Calculate statistics
      timetable.statistics = calculateTimetableStatistics(result.solution, teachers, classrooms, courses);
      
      await timetable.save();

      progressCallback(100, 'Completed');

      logger.info('Timetable generation completed successfully', {
        timetableId,
        quality: result.metrics.qualityMetrics?.overallScore,
        conflicts: result.conflicts?.length || 0
      });

      // Emit completion event
      io.to(`generation_${timetableId}`).emit('generation_completed', {
        timetableId,
        status: 'completed',
        quality: result.metrics.qualityMetrics,
        conflicts: result.conflicts?.length || 0
      });

    } else {
      // Generation failed
      logger.error('Timetable generation failed', { timetableId, reason: result.reason });

      const timetable = await Timetable.findById(timetableId);
      timetable.status = 'draft';
      timetable.conflicts = [{ 
        type: 'generation_error',
        severity: 'critical',
        description: result.reason || 'Unknown generation error'
      }];
      await timetable.save();

      // Emit failure event
      io.to(`generation_${timetableId}`).emit('generation_failed', {
        timetableId,
        status: 'draft',
        reason: result.reason
      });
    }

  } catch (error) {
    logger.error('Error during timetable generation:', error);

    try {
      const timetable = await Timetable.findById(timetableId);
      timetable.status = 'draft';
      timetable.conflicts = [{ 
        type: 'system_error',
        severity: 'critical',
        description: error.message || 'System error during generation'
      }];
      await timetable.save();

      // Emit error event
      io.to(`generation_${timetableId}`).emit('generation_error', {
        timetableId,
        status: 'draft',
        error: error.message
      });

    } catch (saveError) {
      logger.error('Error saving failure state:', saveError);
    }

  } finally {
    // Clean up active generation
    activeGenerations.delete(timetableId);
  }
}

/**
 * Calculate timetable statistics
 */
function calculateTimetableStatistics(schedule, teachers, classrooms, courses) {
  const stats = {
    totalClasses: schedule.length,
    totalTeachers: new Set(schedule.map(s => s.teacherId)).size,
    totalRooms: new Set(schedule.map(s => s.classroomId)).size,
    totalHours: schedule.length, // Assuming 1 hour per class
    utilizationByDay: {},
    peakHours: [],
    roomUtilizationRate: 0,
    teacherWorkloadDistribution: {}
  };

  // Calculate utilization by day
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (const day of daysOfWeek) {
    const dayClasses = schedule.filter(s => s.day === day);
    stats.utilizationByDay[day.toLowerCase()] = dayClasses.length;
  }

  // Calculate peak hours
  const hourUsage = new Map();
  schedule.forEach(slot => {
    const hour = slot.startTime.split(':')[0];
    hourUsage.set(hour, (hourUsage.get(hour) || 0) + 1);
  });

  const maxUsage = Math.max(...hourUsage.values());
  stats.peakHours = Array.from(hourUsage.entries())
    .filter(([hour, usage]) => usage === maxUsage)
    .map(([hour]) => `${hour}:00`);

  // Calculate room utilization rate
  const totalPossibleSlots = classrooms.length * daysOfWeek.length * 8; // 8 hours per day
  stats.roomUtilizationRate = (schedule.length / totalPossibleSlots) * 100;

  // Calculate teacher workload distribution
  const teacherHours = new Map();
  schedule.forEach(slot => {
    teacherHours.set(slot.teacherId, (teacherHours.get(slot.teacherId) || 0) + 1);
  });

  for (const [teacherId, hours] of teacherHours) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      stats.teacherWorkloadDistribution[teacherId] = {
        name: teacher.name,
        assignedHours: hours,
        maxHours: teacher.maxHoursPerWeek,
        utilizationPercentage: (hours / teacher.maxHoursPerWeek) * 100
      };
    }
  }

  return stats;
}

module.exports = router;
