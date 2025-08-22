const express = require('express');
const { body, query, validationResult } = require('express-validator');
const csv = require('csv-parse');
const csvStringify = require('csv-stringify');
const multer = require('multer');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

// ==================== TEACHERS ROUTES ====================

/**
 * @route   GET /api/data/teachers
 * @desc    Get all teachers with optional filtering
 * @access  Private
 */
router.get('/teachers', [
  query('department').optional().trim(),
  query('status').optional().isIn(['active', 'inactive', 'on_leave']),
  query('subject').optional().trim(),
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

    const { department, status, subject, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (subject) query.subjects = { $in: [subject] };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const teachers = await Teacher.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });

    const total = await Teacher.countDocuments(query);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching teachers'
    });
  }
});

/**
 * @route   GET /api/data/teachers/:id
 * @desc    Get a specific teacher
 * @access  Private
 */
router.get('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ id: req.params.id });
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: teacher
    });

  } catch (error) {
    logger.error('Error fetching teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching teacher'
    });
  }
});

/**
 * @route   POST /api/data/teachers
 * @desc    Create a new teacher
 * @access  Private
 */
router.post('/teachers', [
  body('id').trim().notEmpty().withMessage('Teacher ID is required'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('designation').isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant']),
  body('maxHoursPerWeek').isInt({ min: 1, max: 40 }).withMessage('Max hours per week must be between 1 and 40'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if teacher ID already exists
    const existingTeacher = await Teacher.findOne({ id: req.body.id });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this ID already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await Teacher.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }

    const teacher = new Teacher(req.body);
    await teacher.save();

    logger.info('Teacher created', { teacherId: teacher.id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher
    });

  } catch (error) {
    logger.error('Error creating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating teacher'
    });
  }
});

/**
 * @route   PUT /api/data/teachers/:id
 * @desc    Update a teacher
 * @access  Private
 */
router.put('/teachers/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('department').optional().trim().notEmpty(),
  body('designation').optional().isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant']),
  body('maxHoursPerWeek').optional().isInt({ min: 1, max: 40 }),
  body('subjects').optional().isArray({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['active', 'inactive', 'on_leave'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const teacher = await Teacher.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    logger.info('Teacher updated', { teacherId: teacher.id, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher
    });

  } catch (error) {
    logger.error('Error updating teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating teacher'
    });
  }
});

/**
 * @route   DELETE /api/data/teachers/:id
 * @desc    Delete a teacher
 * @access  Private
 */
router.delete('/teachers/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndDelete({ id: req.params.id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    logger.info('Teacher deleted', { teacherId: teacher.id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting teacher'
    });
  }
});

/**
 * @route   POST /api/data/teachers/bulk-import
 * @desc    Bulk import teachers from CSV
 * @access  Private
 */
router.post('/teachers/bulk-import', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const csvData = req.file.buffer.toString();
    const records = [];
    const errors = [];

    // Parse CSV
    csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, data) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV format',
          error: err.message
        });
      }

      // Validate and process each record
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        try {
          // Basic validation
          if (!record.id || !record.name || !record.email || !record.department) {
            errors.push(`Row ${i + 1}: Missing required fields (id, name, email, department)`);
            continue;
          }

          // Parse subjects (comma-separated)
          const subjects = record.subjects ? record.subjects.split(',').map(s => s.trim()) : [];
          
          // Parse availability if provided
          const availability = record.availability ? JSON.parse(record.availability) : undefined;

          const teacherData = {
            id: record.id,
            name: record.name,
            email: record.email,
            phone: record.phone,
            department: record.department,
            designation: record.designation || 'Lecturer',
            qualification: record.qualification,
            experience: record.experience,
            subjects,
            maxHoursPerWeek: parseInt(record.maxHoursPerWeek) || 20,
            availability,
            priority: record.priority || 'medium',
            status: record.status || 'active'
          };

          records.push(teacherData);
        } catch (parseError) {
          errors.push(`Row ${i + 1}: ${parseError.message}`);
        }
      }

      if (errors.length > 0 && records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid records found',
          errors
        });
      }

      // Bulk insert valid records
      try {
        const result = await Teacher.insertMany(records, { ordered: false });
        
        logger.info('Bulk teacher import completed', { 
          imported: result.length,
          errors: errors.length,
          importedBy: req.user.userId 
        });

        res.json({
          success: true,
          message: `Successfully imported ${result.length} teachers`,
          imported: result.length,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (insertError) {
        logger.error('Bulk teacher import error:', insertError);
        res.status(500).json({
          success: false,
          message: 'Error importing teachers',
          errors: [insertError.message]
        });
      }
    });

  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk import'
    });
  }
});

// ==================== CLASSROOMS ROUTES ====================

/**
 * @route   GET /api/data/classrooms
 * @desc    Get all classrooms with optional filtering
 * @access  Private
 */
router.get('/classrooms', [
  query('building').optional().trim(),
  query('type').optional().trim(),
  query('status').optional().isIn(['available', 'maintenance', 'reserved', 'out_of_order']),
  query('minCapacity').optional().isInt({ min: 1 }),
  query('features').optional().trim(),
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

    const { building, type, status, minCapacity, features, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    if (building) query.building = building;
    if (type) query.type = type;
    if (status) query.status = status;
    if (minCapacity) query.capacity = { $gte: parseInt(minCapacity) };
    if (features) query.features = { $in: [features] };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const classrooms = await Classroom.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ building: 1, floor: 1, name: 1 });

    const total = await Classroom.countDocuments(query);

    res.json({
      success: true,
      data: classrooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching classrooms:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching classrooms'
    });
  }
});

/**
 * @route   POST /api/data/classrooms
 * @desc    Create a new classroom
 * @access  Private
 */
router.post('/classrooms', [
  body('id').trim().notEmpty().withMessage('Classroom ID is required'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('building').trim().notEmpty().withMessage('Building is required'),
  body('floor').trim().notEmpty().withMessage('Floor is required'),
  body('capacity').isInt({ min: 1, max: 500 }).withMessage('Capacity must be between 1 and 500'),
  body('type').isIn(['Lecture Hall', 'Tutorial Room', 'Computer Lab', 'Science Lab', 'Seminar Hall', 'Workshop']),
  body('features').optional().isArray(),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if classroom ID already exists
    const existingClassroom = await Classroom.findOne({ id: req.body.id });
    if (existingClassroom) {
      return res.status(400).json({
        success: false,
        message: 'Classroom with this ID already exists'
      });
    }

    const classroom = new Classroom(req.body);
    await classroom.save();

    logger.info('Classroom created', { classroomId: classroom.id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: classroom
    });

  } catch (error) {
    logger.error('Error creating classroom:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating classroom'
    });
  }
});

/**
 * @route   PUT /api/data/classrooms/:id
 * @desc    Update a classroom
 * @access  Private
 */
router.put('/classrooms/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('building').optional().trim().notEmpty(),
  body('floor').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1, max: 500 }),
  body('type').optional().isIn(['Lecture Hall', 'Tutorial Room', 'Computer Lab', 'Science Lab', 'Seminar Hall', 'Workshop']),
  body('features').optional().isArray(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['available', 'maintenance', 'reserved', 'out_of_order'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const classroom = await Classroom.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    logger.info('Classroom updated', { classroomId: classroom.id, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Classroom updated successfully',
      data: classroom
    });

  } catch (error) {
    logger.error('Error updating classroom:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating classroom'
    });
  }
});

/**
 * @route   DELETE /api/data/classrooms/:id
 * @desc    Delete a classroom
 * @access  Private
 */
router.delete('/classrooms/:id', async (req, res) => {
  try {
    const classroom = await Classroom.findOneAndDelete({ id: req.params.id });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    logger.info('Classroom deleted', { classroomId: classroom.id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Classroom deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting classroom:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting classroom'
    });
  }
});

/**
 * @route   POST /api/data/classrooms/bulk-import
 * @desc    Bulk import classrooms from CSV
 * @access  Private
 */
router.post('/classrooms/bulk-import', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const csvData = req.file.buffer.toString();
    const records = [];
    const errors = [];

    // Parse CSV
    csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, data) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV format',
          error: err.message
        });
      }

      // Validate and process each record
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        try {
          // Basic validation
          if (!record.id || !record.name || !record.building || !record.type) {
            errors.push(`Row ${i + 1}: Missing required fields (id, name, building, type)`);
            continue;
          }

          // Parse features (comma-separated)
          const features = record.features ? record.features.split(',').map(f => f.trim()) : [];
          
          // Parse availability if provided
          const availability = record.availability ? JSON.parse(record.availability) : undefined;

          const classroomData = {
            id: record.id,
            name: record.name,
            building: record.building,
            floor: record.floor || 'Ground Floor',
            capacity: parseInt(record.capacity) || 30,
            type: record.type,
            features,
            availability,
            priority: record.priority || 'medium',
            status: record.status || 'available'
          };

          records.push(classroomData);
        } catch (parseError) {
          errors.push(`Row ${i + 1}: ${parseError.message}`);
        }
      }

      if (errors.length > 0 && records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid records found',
          errors
        });
      }

      // Bulk insert valid records
      try {
        const result = await Classroom.insertMany(records, { ordered: false });
        
        logger.info('Bulk classroom import completed', { 
          imported: result.length,
          errors: errors.length,
          importedBy: req.user.userId 
        });

        res.json({
          success: true,
          message: `Successfully imported ${result.length} classrooms`,
          imported: result.length,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (insertError) {
        logger.error('Bulk classroom import error:', insertError);
        res.status(500).json({
          success: false,
          message: 'Error importing classrooms',
          errors: [insertError.message]
        });
      }
    });

  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk import'
    });
  }
});

// ==================== COURSES ROUTES ====================

/**
 * @route   GET /api/data/courses
 * @desc    Get all courses with optional filtering
 * @access  Private
 */
router.get('/courses', [
  query('department').optional().trim(),
  query('program').optional().trim(),
  query('year').optional().isInt({ min: 1, max: 5 }),
  query('semester').optional().isInt({ min: 1, max: 2 }),
  query('teacher').optional().trim(),
  query('isActive').optional().isBoolean(),
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

    const { department, program, year, semester, teacher, isActive, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    if (department) query.department = department;
    if (program) query.program = program;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (teacher) query['assignedTeachers.teacherId'] = teacher;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ department: 1, year: 1, semester: 1, name: 1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching courses'
    });
  }
});

/**
 * @route   POST /api/data/courses
 * @desc    Create a new course
 * @access  Private
 */
router.post('/courses', [
  body('id').trim().notEmpty().withMessage('Course ID is required'),
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('program').trim().notEmpty().withMessage('Program is required'),
  body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Credits must be between 1 and 10'),
  body('totalHoursPerWeek').isInt({ min: 1, max: 20 }).withMessage('Total hours per week must be between 1 and 20'),
  body('enrolledStudents').isInt({ min: 1, max: 500 }).withMessage('Enrolled students must be between 1 and 500'),
  body('assignedTeachers').isArray({ min: 1 }).withMessage('At least one teacher must be assigned')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if course ID already exists
    const existingCourse = await Course.findOne({ id: req.body.id });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course with this ID already exists'
      });
    }

    // Check if course code already exists
    const existingCode = await Course.findOne({ code: req.body.code });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Course with this code already exists'
      });
    }

    const course = new Course(req.body);
    await course.save();

    logger.info('Course created', { courseId: course.id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating course'
    });
  }
});

/**
 * @route   PUT /api/data/courses/:id
 * @desc    Update a course
 * @access  Private
 */
router.put('/courses/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('code').optional().trim().notEmpty(),
  body('department').optional().trim().notEmpty(),
  body('program').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1, max: 5 }),
  body('semester').optional().isInt({ min: 1, max: 2 }),
  body('credits').optional().isInt({ min: 1, max: 10 }),
  body('totalHoursPerWeek').optional().isInt({ min: 1, max: 20 }),
  body('enrolledStudents').optional().isInt({ min: 1, max: 500 }),
  body('assignedTeachers').optional().isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const course = await Course.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info('Course updated', { courseId: course.id, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating course'
    });
  }
});

/**
 * @route   DELETE /api/data/courses/:id
 * @desc    Delete a course
 * @access  Private
 */
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ id: req.params.id });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info('Course deleted', { courseId: course.id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting course'
    });
  }
});

/**
 * @route   POST /api/data/courses/bulk-import
 * @desc    Bulk import courses from CSV
 * @access  Private
 */
router.post('/courses/bulk-import', upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const csvData = req.file.buffer.toString();
    const records = [];
    const errors = [];

    // Parse CSV
    csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, data) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV format',
          error: err.message
        });
      }

      // Validate and process each record
      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        try {
          // Basic validation
          if (!record.id || !record.name || !record.code || !record.department) {
            errors.push(`Row ${i + 1}: Missing required fields (id, name, code, department)`);
            continue;
          }

          // Parse assigned teachers (comma-separated)
          const assignedTeachers = record.assignedTeachers ? 
            record.assignedTeachers.split(',').map(t => ({ teacherId: t.trim() })) : [];

          const courseData = {
            id: record.id,
            name: record.name,
            code: record.code,
            department: record.department,
            program: record.program || 'General',
            year: parseInt(record.year) || 1,
            semester: parseInt(record.semester) || 1,
            credits: parseInt(record.credits) || 3,
            totalHoursPerWeek: parseInt(record.totalHoursPerWeek) || 3,
            enrolledStudents: parseInt(record.enrolledStudents) || 30,
            assignedTeachers,
            requirements: {
              roomType: record.requiredRoomType || 'Lecture Hall'
            },
            isActive: record.isActive !== 'false'
          };

          records.push(courseData);
        } catch (parseError) {
          errors.push(`Row ${i + 1}: ${parseError.message}`);
        }
      }

      if (errors.length > 0 && records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid records found',
          errors
        });
      }

      // Bulk insert valid records
      try {
        const result = await Course.insertMany(records, { ordered: false });
        
        logger.info('Bulk course import completed', { 
          imported: result.length,
          errors: errors.length,
          importedBy: req.user.userId 
        });

        res.json({
          success: true,
          message: `Successfully imported ${result.length} courses`,
          imported: result.length,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (insertError) {
        logger.error('Bulk course import error:', insertError);
        res.status(500).json({
          success: false,
          message: 'Error importing courses',
          errors: [insertError.message]
        });
      }
    });

  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk import'
    });
  }
});

// ==================== DATA VALIDATION AND STATISTICS ====================

/**
 * @route   GET /api/data/validate
 * @desc    Validate all data for timetable generation
 * @access  Private
 */
router.get('/validate', async (req, res) => {
  try {
    const validation = {
      teachers: { status: 'unknown', count: 0, issues: 0 },
      classrooms: { status: 'unknown', count: 0, issues: 0 },
      courses: { status: 'unknown', count: 0, issues: 0 },
      overall: { status: 'unknown', ready: false }
    };

    // Validate teachers
    const teachers = await Teacher.find({ status: 'active' });
    validation.teachers.count = teachers.length;
    validation.teachers.issues = teachers.filter(t => 
      !t.subjects || t.subjects.length === 0 || 
      !t.availability || 
      !t.maxHoursPerWeek
    ).length;
    validation.teachers.status = validation.teachers.issues === 0 ? 'completed' : 'warning';

    // Validate classrooms
    const classrooms = await Classroom.find({ status: 'available' });
    validation.classrooms.count = classrooms.length;
    validation.classrooms.issues = classrooms.filter(c => 
      !c.capacity || c.capacity < 1 || 
      !c.type || 
      !c.availability
    ).length;
    validation.classrooms.status = validation.classrooms.issues === 0 ? 'completed' : 'warning';

    // Validate courses
    const courses = await Course.find({ isActive: true });
    validation.courses.count = courses.length;
    validation.courses.issues = courses.filter(c => 
      !c.assignedTeachers || c.assignedTeachers.length === 0 || 
      !c.sessions || 
      !c.enrolledStudents
    ).length;
    validation.courses.status = validation.courses.issues === 0 ? 'completed' : 'warning';

    // Overall validation
    validation.overall.ready = validation.teachers.count > 0 && 
                               validation.classrooms.count > 0 && 
                               validation.courses.count > 0 &&
                               validation.teachers.issues + validation.classrooms.issues + validation.courses.issues < 5;
    validation.overall.status = validation.overall.ready ? 'completed' : 'warning';

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    logger.error('Error validating data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating data'
    });
  }
});

/**
 * @route   GET /api/data/statistics
 * @desc    Get data statistics
 * @access  Private
 */
router.get('/statistics', async (req, res) => {
  try {
    const [teacherStats, classroomStats, courseStats] = await Promise.all([
      Teacher.aggregate([
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalHours: { $sum: '$maxHoursPerWeek' }
          }
        }
      ]),
      Classroom.aggregate([
        {
          $group: {
            _id: '$building',
            count: { $sum: 1 },
            totalCapacity: { $sum: '$capacity' },
            availableCount: {
              $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
            }
          }
        }
      ]),
      Course.aggregate([
        {
          $group: {
            _id: { department: '$department', year: '$year' },
            count: { $sum: 1 },
            totalCredits: { $sum: '$credits' },
            totalStudents: { $sum: '$enrolledStudents' },
            totalHours: { $sum: '$totalHoursPerWeek' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        teachers: teacherStats,
        classrooms: classroomStats,
        courses: courseStats,
        summary: {
          totalTeachers: await Teacher.countDocuments(),
          activeTeachers: await Teacher.countDocuments({ status: 'active' }),
          totalClassrooms: await Classroom.countDocuments(),
          availableClassrooms: await Classroom.countDocuments({ status: 'available' }),
          totalCourses: await Course.countDocuments(),
          activeCourses: await Course.countDocuments({ isActive: true })
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching statistics'
    });
  }
});

// ==================== EXPORT ROUTES ====================

/**
 * @route   GET /api/data/teachers/export
 * @desc    Export teachers data as CSV
 * @access  Private
 */
router.get('/teachers/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    if (format !== 'csv') {
      return res.status(400).json({
        success: false,
        message: 'Only CSV format is currently supported'
      });
    }

    const teachers = await Teacher.find({ status: 'active' });
    
    const csvData = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || '',
      department: teacher.department,
      designation: teacher.designation,
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      subjects: teacher.subjects ? teacher.subjects.join(', ') : '',
      maxHoursPerWeek: teacher.maxHoursPerWeek,
      availability: teacher.availability ? JSON.stringify(teacher.availability) : '',
      priority: teacher.priority,
      status: teacher.status
    }));

    csvStringify.stringify(csvData, { header: true }, (err, output) => {
      if (err) {
        logger.error('CSV generation error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error generating CSV'
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="teachers.csv"');
      res.send(output);
    });

  } catch (error) {
    logger.error('Error exporting teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while exporting teachers'
    });
  }
});

/**
 * @route   GET /api/data/classrooms/export
 * @desc    Export classrooms data as CSV
 * @access  Private
 */
router.get('/classrooms/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    if (format !== 'csv') {
      return res.status(400).json({
        success: false,
        message: 'Only CSV format is currently supported'
      });
    }

    const classrooms = await Classroom.find({ status: 'available' });
    
    const csvData = classrooms.map(classroom => ({
      id: classroom.id,
      name: classroom.name,
      building: classroom.building,
      floor: classroom.floor,
      capacity: classroom.capacity,
      type: classroom.type,
      features: classroom.features ? classroom.features.join(', ') : '',
      availability: classroom.availability ? JSON.stringify(classroom.availability) : '',
      priority: classroom.priority,
      status: classroom.status
    }));

    csvStringify.stringify(csvData, { header: true }, (err, output) => {
      if (err) {
        logger.error('CSV generation error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error generating CSV'
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="classrooms.csv"');
      res.send(output);
    });

  } catch (error) {
    logger.error('Error exporting classrooms:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while exporting classrooms'
    });
  }
});

/**
 * @route   GET /api/data/courses/export
 * @desc    Export courses data as CSV
 * @access  Private
 */
router.get('/courses/export', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    
    if (format !== 'csv') {
      return res.status(400).json({
        success: false,
        message: 'Only CSV format is currently supported'
      });
    }

    const courses = await Course.find({ isActive: true });
    
    const csvData = courses.map(course => ({
      id: course.id,
      name: course.name,
      code: course.code,
      department: course.department,
      program: course.program,
      year: course.year,
      semester: course.semester,
      credits: course.credits,
      totalHoursPerWeek: course.totalHoursPerWeek,
      enrolledStudents: course.enrolledStudents,
      assignedTeachers: course.assignedTeachers ? course.assignedTeachers.map(t => t.teacherId).join(', ') : '',
      requiredRoomType: course.requirements ? course.requirements.roomType : '',
      isActive: course.isActive
    }));

    csvStringify.stringify(csvData, { header: true }, (err, output) => {
      if (err) {
        logger.error('CSV generation error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error generating CSV'
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="courses.csv"');
      res.send(output);
    });

  } catch (error) {
    logger.error('Error exporting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while exporting courses'
    });
  }
});

module.exports = router;
