import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Timetable from '../models/Timetable.js';
import Teacher from '../models/Teacher.js';
import Classroom from '../models/Classroom.js';
import Course from '../models/Course.js';
import { GeneticTimetableGenerator } from '../algorithms/GeneticTimetableGenerator.js';

const router = express.Router();

// In-memory storage for active generation processes
const activeGenerations = new Map();

/**
 * Generate a new timetable
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      name,
      academicYear,
      semester,
      department,
      year,
      settings = {},
      teacherIds,
      classroomIds,
      courseIds
    } = req.body;

    // Validate required fields
    if (!name || !academicYear || !semester || !department || !year) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, academicYear, semester, department, and year are required'
      });
    }

    // Create timetable record
    const timetableId = uuidv4();
    const timetable = new Timetable({
      id: timetableId,
      name,
      academicYear,
      semester,
      department,
      year,
      status: 'generating',
      generationSettings: {
        algorithm: settings.algorithm || 'genetic',
        parameters: {
          populationSize: settings.populationSize || 100,
          maxGenerations: settings.maxGenerations || 1000,
          crossoverRate: settings.crossoverRate || 0.8,
          mutationRate: settings.mutationRate || 0.1,
          targetFitness: settings.targetFitness || 0.95
        },
        constraints: {
          workingDays: settings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: settings.startTime || '09:00',
          endTime: settings.endTime || '17:00',
          slotDuration: settings.slotDuration || 60,
          breakSlots: settings.breakSlots || ['12:00-13:00'],
          maxConsecutiveHours: settings.maxConsecutiveHours || 3,
          enforceBreaks: settings.enforceBreaks !== false,
          balanceWorkload: settings.balanceWorkload !== false
        },
        optimizationGoals: settings.optimizationGoals || ['minimize_conflicts', 'balanced_schedule', 'teacher_preferences']
      }
    });

    await timetable.save();

    // Start generation process asynchronously
    generateTimetableAsync(timetableId, {
      teacherIds,
      classroomIds,
      courseIds,
      settings: timetable.generationSettings
    });

    res.status(202).json({
      message: 'Timetable generation started',
      timetableId,
      status: 'generating',
      estimatedTime: '2-5 minutes'
    });

  } catch (error) {
    console.error('Error starting timetable generation:', error);
    res.status(500).json({
      error: 'Generation failed',
      message: error.message
    });
  }
});

/**
 * Get generation progress
 */
router.get('/generate/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    
    const timetable = await Timetable.findOne({ id });
    if (!timetable) {
      return res.status(404).json({
        error: 'Timetable not found'
      });
    }

    const progress = activeGenerations.get(id);
    if (progress) {
      res.json({
        timetableId: id,
        status: timetable.status,
        progress: progress
      });
    } else {
      res.json({
        timetableId: id,
        status: timetable.status,
        progress: {
          generation: 0,
          bestFitness: 0,
          status: timetable.status === 'completed' ? 'Generation completed' : 'Initializing...'
        }
      });
    }

  } catch (error) {
    console.error('Error getting generation progress:', error);
    res.status(500).json({
      error: 'Failed to get progress',
      message: error.message
    });
  }
});

/**
 * Get all timetables
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      academicYear,
      semester,
      department,
      status
    } = req.query;

    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = parseInt(semester);
    if (department) filter.department = department;
    if (status) filter.status = status;

    const timetables = await Timetable.find(filter)
      .select('-schedule -teacherSchedules -classroomSchedules -studentSchedules')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Timetable.countDocuments(filter);

    res.json({
      timetables,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({
      error: 'Failed to fetch timetables',
      message: error.message
    });
  }
});

/**
 * Get specific timetable
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'full' } = req.query;

    const timetable = await Timetable.findOne({ id });
    if (!timetable) {
      return res.status(404).json({
        error: 'Timetable not found'
      });
    }

    if (format === 'summary') {
      const summary = {
        id: timetable.id,
        name: timetable.name,
        academicYear: timetable.academicYear,
        semester: timetable.semester,
        department: timetable.department,
        year: timetable.year,
        status: timetable.status,
        metadata: timetable.metadata,
        conflicts: timetable.conflicts,
        createdAt: timetable.createdAt,
        updatedAt: timetable.updatedAt
      };
      res.json(summary);
    } else {
      res.json(timetable);
    }

  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({
      error: 'Failed to fetch timetable',
      message: error.message
    });
  }
});

/**
 * Update timetable status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const validStatuses = ['draft', 'generating', 'completed', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updateData = { status };
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const timetable = await Timetable.findOneAndUpdate(
      { id },
      updateData,
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({
        error: 'Timetable not found'
      });
    }

    res.json({
      message: `Timetable status updated to ${status}`,
      timetable: {
        id: timetable.id,
        name: timetable.name,
        status: timetable.status,
        publishedAt: timetable.publishedAt
      }
    });

  } catch (error) {
    console.error('Error updating timetable status:', error);
    res.status(500).json({
      error: 'Failed to update status',
      message: error.message
    });
  }
});

/**
 * Delete timetable
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await Timetable.findOneAndDelete({ id });
    if (!timetable) {
      return res.status(404).json({
        error: 'Timetable not found'
      });
    }

    // Clean up any active generation process
    activeGenerations.delete(id);

    res.json({
      message: 'Timetable deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({
      error: 'Failed to delete timetable',
      message: error.message
    });
  }
});

/**
 * Async function to generate timetable
 */
async function generateTimetableAsync(timetableId, options) {
  try {
    console.log(`Starting timetable generation for ${timetableId}`);

    // Fetch data
    const teachers = await Teacher.find(
      options.teacherIds ? { id: { $in: options.teacherIds } } : { isActive: true }
    );
    const classrooms = await Classroom.find(
      options.classroomIds ? { id: { $in: options.classroomIds } } : { isActive: true }
    );
    const courses = await Course.find(
      options.courseIds ? { id: { $in: options.courseIds } } : { isActive: true }
    );

    console.log(`Loaded data: ${teachers.length} teachers, ${classrooms.length} classrooms, ${courses.length} courses`);

    // Initialize genetic algorithm
    const generator = new GeneticTimetableGenerator({
      populationSize: options.settings.parameters.populationSize,
      maxGenerations: options.settings.parameters.maxGenerations,
      crossoverRate: options.settings.parameters.crossoverRate,
      mutationRate: options.settings.parameters.mutationRate,
      targetFitness: options.settings.parameters.targetFitness,
      onProgress: (progress) => {
        activeGenerations.set(timetableId, progress);
        console.log(`Generation ${progress.generation}: Fitness ${progress.bestFitness.toFixed(4)}`);
      },
      onComplete: async (result) => {
        await saveTimetableResult(timetableId, result, teachers, classrooms, courses);
        activeGenerations.delete(timetableId);
      },
      onError: async (error) => {
        console.error(`Generation failed for ${timetableId}:`, error);
        await Timetable.findOneAndUpdate(
          { id: timetableId },
          { 
            status: 'draft',
            'metadata.error': error.message
          }
        );
        activeGenerations.delete(timetableId);
      }
    });

    // Prepare data for algorithm
    const algorithmData = {
      teachers: teachers.map(t => ({
        id: t.id,
        name: t.name,
        subjects: t.subjects,
        unavailableSlots: t.unavailableSlots || [],
        preferredHours: t.preferences?.preferredHours || 20,
        maxHours: t.preferences?.maxHours || 25
      })),
      classrooms: classrooms.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        capacity: c.capacity,
        facilities: c.facilities || []
      })),
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        teacherId: c.teacherId,
        duration: c.duration,
        studentGroup: c.studentGroup,
        studentCount: c.studentCount,
        roomType: c.roomRequirements?.type
      })),
      constraints: options.settings.constraints
    };

    // Initialize and start evolution
    generator.initialize(algorithmData);
    await generator.evolve();

  } catch (error) {
    console.error(`Error in generateTimetableAsync for ${timetableId}:`, error);
    
    await Timetable.findOneAndUpdate(
      { id: timetableId },
      { 
        status: 'draft',
        'metadata.error': error.message
      }
    );
    
    activeGenerations.delete(timetableId);
  }
}

/**
 * Save timetable generation result
 */
async function saveTimetableResult(timetableId, result, teachers, classrooms, courses) {
  try {
    const formattedTimetable = result.bestSolution;
    const generator = new GeneticTimetableGenerator();
    
    // Format the timetable for storage
    const schedule = formattedTimetable.schedule.map(assignment => {
      const teacher = teachers.find(t => t.id === assignment.teacherId);
      const classroom = classrooms.find(c => c.id === assignment.classroomId);
      const course = courses.find(c => c.id === assignment.courseId);
      
      return {
        courseId: assignment.courseId,
        courseName: course?.name || assignment.courseName,
        teacherId: assignment.teacherId,
        teacherName: teacher?.name || 'Unknown',
        classroomId: assignment.classroomId,
        classroomName: classroom?.name || 'Unknown',
        timeSlotId: assignment.timeSlotId,
        day: assignment.day,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        studentGroup: assignment.studentGroup,
        duration: assignment.duration,
        type: course?.type || 'theory'
      };
    });

    const updateData = {
      status: 'completed',
      schedule: schedule,
      metadata: {
        generatedAt: new Date(),
        algorithm: 'Genetic Algorithm',
        fitness: formattedTimetable.fitness,
        violations: formattedTimetable.violations,
        statistics: {
          totalCourses: courses.length,
          totalTeachers: teachers.length,
          totalClassrooms: classrooms.length,
          generationTime: Date.now(),
          finalGeneration: result.statistics.finalGeneration
        }
      },
      backupData: {
        teachers: teachers,
        classrooms: classrooms,
        courses: courses
      }
    };

    await Timetable.findOneAndUpdate({ id: timetableId }, updateData);
    
    console.log(`Timetable generation completed for ${timetableId} with fitness ${formattedTimetable.fitness.toFixed(4)}`);

  } catch (error) {
    console.error(`Error saving timetable result for ${timetableId}:`, error);
    throw error;
  }
}

export default router;
