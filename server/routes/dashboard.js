import express from 'express';
import { query, validationResult } from 'express-validator';
import Teacher from '../models/Teacher.js';
import Classroom from '../models/Classroom.js';
import Course from '../models/Course.js';
import Timetable from '../models/Timetable.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// ==================== DASHBOARD OVERVIEW ====================

/**
 * @route GET /api/dashboard/overview
 * @desc Get dashboard overview statistics
 * @access Private
 */
router.get('/overview', asyncHandler(async (req, res) => {
  try {
    // Get counts
    const [teachers, classrooms, courses, timetables] = await Promise.all([
      Teacher.countDocuments({ isActive: true }),
      Classroom.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Timetable.countDocuments()
    ]);

    // Get recent activity
    const recentTimetables = await Timetable.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('timetableId name status academicYear semester program createdAt')
      .populate('createdBy', 'name');

    // Get status distribution
    const timetableStatuses = await Timetable.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const overview = {
      counts: {
        teachers,
        classrooms,
        courses,
        timetables
      },
      recentActivity: {
        timetables: recentTimetables
      },
      statusDistribution: timetableStatuses,
      systemHealth: {
        status: 'healthy',
        lastUpdated: new Date()
      }
    };

    res.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
}));

// ==================== ANALYTICS ====================

/**
 * @route GET /api/dashboard/analytics/teachers
 * @desc Get teacher analytics
 * @access Private
 */
router.get('/analytics/teachers', [
  query('timeRange').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid time range'),
  query('school').optional().notEmpty().withMessage('School cannot be empty'),
  query('department').optional().notEmpty().withMessage('Department cannot be empty')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { timeRange = 'month', school, department } = req.query;

  try {
    // Build filter
    const filter = { isActive: true };
    if (school) filter.school = school;
    if (department) filter.department = department;

    // Get teacher statistics
    const teacherStats = await Teacher.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$teacherType',
          count: { $sum: 1 },
          avgHoursPerWeek: { $avg: '$maxHoursPerWeek' },
          totalHours: { $sum: '$currentHoursPerWeek' }
        }
      }
    ]);

    // Get workload distribution
    const workloadDistribution = await Teacher.aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: '$currentHoursPerWeek',
          boundaries: [0, 10, 20, 30, 40, 50],
          default: '50+',
          output: {
            count: { $sum: 1 },
            teachers: { $push: { name: '$name', hours: '$currentHoursPerWeek' } }
          }
        }
      }
    ]);

    // Get school/department distribution
    const schoolDistribution = await Teacher.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$school',
          count: { $sum: 1 },
          departments: { $addToSet: '$department' }
        }
      }
    ]);

    const analytics = {
      timeRange,
      filters: { school, department },
      statistics: teacherStats,
      workloadDistribution,
      schoolDistribution,
      summary: {
        totalTeachers: teacherStats.reduce((sum, stat) => sum + stat.count, 0),
        avgHoursPerWeek: teacherStats.reduce((sum, stat) => sum + stat.avgHoursPerWeek, 0) / teacherStats.length,
        totalHours: teacherStats.reduce((sum, stat) => sum + stat.totalHours, 0)
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Teacher analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher analytics',
      error: error.message
    });
  }
}));

/**
 * @route GET /api/dashboard/analytics/classrooms
 * @desc Get classroom analytics
 * @access Private
 */
router.get('/analytics/classrooms', [
  query('timeRange').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid time range'),
  query('building').optional().notEmpty().withMessage('Building cannot be empty')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { timeRange = 'month', building } = req.query;

  try {
    // Build filter
    const filter = { isActive: true };
    if (building) filter.building = building;

    // Get classroom statistics
    const classroomStats = await Classroom.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$roomType',
          count: { $sum: 1 },
          avgCapacity: { $avg: '$capacity' },
          totalCapacity: { $sum: '$capacity' }
        }
      }
    ]);

    // Get capacity distribution
    const capacityDistribution = await Classroom.aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: '$capacity',
          boundaries: [0, 20, 50, 100, 200, 500],
          default: '500+',
          output: {
            count: { $sum: 1 },
            rooms: { $push: { name: '$roomName', capacity: '$capacity' } }
          }
        }
      }
    ]);

    // Get building distribution
    const buildingDistribution = await Classroom.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$building',
          count: { $sum: 1 },
          floors: { $addToSet: '$floor' },
          totalCapacity: { $sum: '$capacity' }
        }
      }
    ]);

    // Get feature utilization
    const featureUtilization = await Classroom.aggregate([
      { $match: filter },
      {
        $project: {
          roomName: 1,
          features: {
            $objectToArray: '$features'
          }
        }
      },
      { $unwind: '$features' },
      {
        $group: {
          _id: '$features.k',
          count: { $sum: 1 },
          rooms: { $addToSet: '$roomName' }
        }
      }
    ]);

    const analytics = {
      timeRange,
      filters: { building },
      statistics: classroomStats,
      capacityDistribution,
      buildingDistribution,
      featureUtilization,
      summary: {
        totalClassrooms: classroomStats.reduce((sum, stat) => sum + stat.count, 0),
        avgCapacity: classroomStats.reduce((sum, stat) => sum + stat.avgCapacity, 0) / classroomStats.length,
        totalCapacity: classroomStats.reduce((sum, stat) => sum + stat.totalCapacity, 0)
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Classroom analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classroom analytics',
      error: error.message
    });
  }
}));

/**
 * @route GET /api/dashboard/analytics/courses
 * @desc Get course analytics
 * @access Private
 */
router.get('/analytics/courses', [
  query('timeRange').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid time range'),
  query('program').optional().notEmpty().withMessage('Program cannot be empty'),
  query('academicYear').optional().notEmpty().withMessage('Academic year cannot be empty')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { timeRange = 'month', program, academicYear } = req.query;

  try {
    // Build filter
    const filter = { isActive: true };
    if (program) filter.program = program;
    if (academicYear) filter.academicYear = academicYear;

    // Get course statistics
    const courseStats = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$courseType',
          count: { $sum: 1 },
          avgTheoryHours: { $avg: '$weeklySchedule.theoryHours' },
          avgPracticalHours: { $avg: '$weeklySchedule.practicalHours' },
          avgTutorialHours: { $avg: '$weeklySchedule.tutorialHours' },
          totalHours: { $sum: '$weeklySchedule.totalHours' }
        }
      }
    ]);

    // Get semester distribution
    const semesterDistribution = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          courses: { $push: { code: '$courseCode', name: '$courseName' } }
        }
      }
    ]);

    // Get program distribution
    const programDistribution = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 },
          academicYears: { $addToSet: '$academicYear' },
          totalHours: { $sum: '$weeklySchedule.totalHours' }
        }
      }
    ]);

    // Get batching requirements
    const batchingRequirements = await Course.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$batching.isRequired',
          count: { $sum: 1 },
          courses: { $push: { code: '$courseCode', name: '$courseName', maxBatches: '$batching.maxBatches' } }
        }
      }
    ]);

    const analytics = {
      timeRange,
      filters: { program, academicYear },
      statistics: courseStats,
      semesterDistribution,
      programDistribution,
      batchingRequirements,
      summary: {
        totalCourses: courseStats.reduce((sum, stat) => sum + stat.count, 0),
        avgTheoryHours: courseStats.reduce((sum, stat) => sum + stat.avgTheoryHours, 0) / courseStats.length,
        avgPracticalHours: courseStats.reduce((sum, stat) => sum + stat.avgPracticalHours, 0) / courseStats.length,
        totalHours: courseStats.reduce((sum, stat) => sum + stat.totalHours, 0)
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics',
      error: error.message
    });
  }
}));

/**
 * @route GET /api/dashboard/analytics/timetables
 * @desc Get timetable analytics
 * @access Private
 */
router.get('/analytics/timetables', [
  query('timeRange').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid time range'),
  query('status').optional().isIn(['draft', 'generating', 'generated', 'validated', 'approved', 'published', 'archived']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { timeRange = 'month', status } = req.query;

  try {
    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // Get timetable statistics
    const timetableStats = await Timetable.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgEntries: { $avg: { $size: '$entries' } },
          avgHours: { $avg: '$totalHours' },
          totalEntries: { $sum: { $size: '$entries' } },
          totalHours: { $sum: '$totalHours' }
        }
      }
    ]);

    // Get program distribution
    const programDistribution = await Timetable.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 },
          semesters: { $addToSet: '$semester' },
          academicYears: { $addToSet: '$academicYear' }
        }
      }
    ]);

    // Get generation performance
    const generationPerformance = await Timetable.aggregate([
      { $match: { ...filter, 'generationInfo.endTime': { $exists: true } } },
      {
        $project: {
          algorithm: '$generationInfo.algorithm',
          duration: { $subtract: ['$generationInfo.endTime', '$generationInfo.startTime'] },
          iterations: '$generationInfo.iterations',
          fitnessScore: '$generationInfo.fitnessScore'
        }
      },
      {
        $group: {
          _id: '$algorithm',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgIterations: { $avg: '$iterations' },
          avgFitnessScore: { $avg: '$fitnessScore' }
        }
      }
    ]);

    // Get validation results
    const validationResults = await Timetable.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$validation.isValid',
          count: { $sum: 1 },
          avgErrors: { $avg: { $size: '$validation.errors' } },
          avgWarnings: { $avg: { $size: '$validation.warnings' } }
        }
      }
    ]);

    const analytics = {
      timeRange,
      filters: { status },
      statistics: timetableStats,
      programDistribution,
      generationPerformance,
      validationResults,
      summary: {
        totalTimetables: timetableStats.reduce((sum, stat) => sum + stat.count, 0),
        avgEntries: timetableStats.reduce((sum, stat) => sum + stat.avgEntries, 0) / timetableStats.length,
        totalEntries: timetableStats.reduce((sum, stat) => sum + stat.totalEntries, 0),
        totalHours: timetableStats.reduce((sum, stat) => sum + stat.totalHours, 0)
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Timetable analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable analytics',
      error: error.message
    });
  }
}));

// ==================== SYSTEM HEALTH ====================

/**
 * @route GET /api/dashboard/system-health
 * @desc Get system health information
 * @access Private
 */
router.get('/system-health', asyncHandler(async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      checks: {}
    };

    // Database connectivity
    try {
      await Teacher.findOne().select('_id').lean();
      health.checks.database = { status: 'healthy', message: 'Database connection successful' };
    } catch (error) {
      health.checks.database = { status: 'unhealthy', message: 'Database connection failed', error: error.message };
      health.status = 'unhealthy';
    }

    // Data integrity
    try {
      const [teacherCount, classroomCount, courseCount] = await Promise.all([
        Teacher.countDocuments({ isActive: true }),
        Classroom.countDocuments({ isActive: true }),
        Course.countDocuments({ isActive: true })
      ]);

      health.checks.dataIntegrity = {
        status: 'healthy',
        message: 'Data integrity check passed',
        counts: { teachers: teacherCount, classrooms: classroomCount, courses: courseCount }
      };

      // Check for potential issues
      if (teacherCount === 0) {
        health.checks.dataIntegrity.status = 'warning';
        health.checks.dataIntegrity.message = 'No teachers found in system';
      }
      if (classroomCount === 0) {
        health.checks.dataIntegrity.status = 'warning';
        health.checks.dataIntegrity.message = 'No classrooms found in system';
      }
      if (courseCount === 0) {
        health.checks.dataIntegrity.status = 'warning';
        health.checks.dataIntegrity.message = 'No courses found in system';
      }
    } catch (error) {
      health.checks.dataIntegrity = { status: 'unhealthy', message: 'Data integrity check failed', error: error.message };
      health.status = 'unhealthy';
    }

    // Recent activity
    try {
      const recentActivity = await Timetable.find()
        .sort({ createdAt: -1 })
        .limit(1)
        .select('createdAt')
        .lean();

      health.checks.recentActivity = {
        status: 'healthy',
        message: 'Recent activity check passed',
        lastActivity: recentActivity.length > 0 ? recentActivity[0].createdAt : null
      };
    } catch (error) {
      health.checks.recentActivity = { status: 'unhealthy', message: 'Recent activity check failed', error: error.message };
      health.status = 'unhealthy';
    }

    // Overall status
    const unhealthyChecks = Object.values(health.checks).filter(check => check.status === 'unhealthy').length;
    const warningChecks = Object.values(health.checks).filter(check => check.status === 'warning').length;

    if (unhealthyChecks > 0) {
      health.status = 'unhealthy';
    } else if (warningChecks > 0) {
      health.status = 'warning';
    }

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check system health',
      error: error.message
    });
  }
}));

export default router;
