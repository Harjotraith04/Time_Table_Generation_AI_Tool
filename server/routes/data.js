const express = require('express');
const { body, query, validationResult } = require('express-validator');
const csv = require('csv-parse');
const csvStringify = require('csv-stringify');
const multer = require('multer');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');
const Program = require('../models/Program');
const Division = require('../models/Division');
const SystemConfig = require('../models/SystemConfig');
const Holiday = require('../models/Holiday');
const { authenticateToken } = require('./auth');
const logger = require('../utils/logger');
const emailService = require('../utils/emailService');

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

    // Check if email already exists in Teacher collection
    const existingTeacherEmail = await Teacher.findOne({ email: req.body.email });
    if (existingTeacherEmail) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists'
      });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = emailService.generateSecurePassword(10);

    // Create Teacher record
    const teacher = new Teacher(req.body);
    await teacher.save();

    // Create User account for teacher
    const userAccount = new User({
      name: teacher.name,
      email: teacher.email,
      password: tempPassword,
      role: 'faculty',
      department: teacher.department,
      isFirstLogin: true,
      mustChangePassword: true
    });
    await userAccount.save();

    // Send credentials email
    const emailSent = await emailService.sendTeacherCredentials(teacher, tempPassword);

    logger.info('Teacher and user account created', { 
      teacherId: teacher.id, 
      userId: userAccount._id,
      emailSent,
      createdBy: req.user.userId 
    });

    res.status(201).json({
      success: true,
      message: `Teacher created successfully${emailSent ? ' and credentials sent via email' : ' (email sending failed)'}`,
      data: {
        teacher,
        userAccount: {
          id: userAccount._id,
          email: userAccount.email,
          role: userAccount.role
        },
        emailSent
      }
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

/**
 * @route   POST /api/data/teachers/bulk-create
 * @desc    Create multiple teachers with user accounts and send credentials
 * @access  Private
 */
router.post('/teachers/bulk-create', [
  body('teachers').isArray({ min: 1 }).withMessage('Teachers array is required'),
  body('teachers.*.id').notEmpty().trim(),
  body('teachers.*.name').notEmpty().trim(),
  body('teachers.*.email').isEmail().normalizeEmail(),
  body('teachers.*.department').notEmpty().trim(),
  body('teachers.*.designation').isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant']),
  body('sendCredentials').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { teachers, sendCredentials = false } = req.body;
    const results = {
      created: [],
      failed: [],
      userAccountsCreated: []
    };

    for (const teacherData of teachers) {
      try {
        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({
          $or: [
            { id: teacherData.id },
            { email: teacherData.email }
          ]
        });

        if (existingTeacher) {
          results.failed.push({
            teacherId: teacherData.id,
            email: teacherData.email,
            reason: 'Teacher already exists'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: teacherData.email });
        if (existingUser) {
          results.failed.push({
            teacherId: teacherData.id,
            email: teacherData.email,
            reason: 'User account already exists'
          });
          continue;
        }

        // Create teacher
        const teacher = new Teacher(teacherData);
        await teacher.save();
        results.created.push(teacher);

        // Create user account if requested
        if (sendCredentials) {
          try {
            const tempPassword = emailService.generateSecurePassword(10);
            
            const userData = {
              name: teacherData.name,
              email: teacherData.email,
              password: tempPassword,
              role: 'faculty',
              department: teacherData.department,
              isFirstLogin: true,
              mustChangePassword: true
            };

            const user = new User(userData);
            await user.save();

            const credentialData = {
              teacherId: teacherData.id,
              email: teacherData.email,
              tempPassword: tempPassword,
              userId: user._id
            };

            results.userAccountsCreated.push(credentialData);

            // Send credentials email
            const emailSent = await emailService.sendTeacherCredentials(teacherData, tempPassword);
            
            if (emailSent) {
              logger.info(`Credentials email sent to teacher: ${teacherData.id}`);
            } else {
              logger.warn(`Failed to send credentials email to teacher: ${teacherData.id}`);
            }

          } catch (userError) {
            logger.error(`Failed to create user account for teacher ${teacherData.id}:`, userError);
            results.failed.push({
              teacherId: teacherData.id,
              email: teacherData.email,
              reason: `User account creation failed: ${userError.message}`
            });
          }
        }

      } catch (error) {
        results.failed.push({
          teacherId: teacherData.id,
          email: teacherData.email,
          reason: error.message
        });
      }
    }

    logger.info(`Bulk teacher creation completed: ${results.created.length} created, ${results.failed.length} failed`);

    // Send summary email to admin if there were successful account creations
    if (results.userAccountsCreated.length > 0) {
      try {
        const adminUser = await User.findById(req.user.userId);
        const adminEmail = adminUser ? adminUser.email : req.user.email;
        
        // Adapt the summary for teachers
        const teacherSummary = results.userAccountsCreated.map(account => ({
          studentId: account.teacherId, // Reuse the field name for consistency
          email: account.email,
          tempPassword: account.tempPassword
        }));
        
        const emailSent = await emailService.sendBulkCreationSummary(teacherSummary, adminEmail);
        if (emailSent) {
          logger.info(`Bulk teacher creation summary email sent to admin: ${adminEmail}`);
        } else {
          logger.warn('Failed to send bulk teacher creation summary email to admin');
        }
      } catch (emailError) {
        logger.error('Failed to send bulk teacher creation summary email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk operation completed: ${results.created.length} teachers created, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    logger.error('Error in bulk teacher creation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk teacher creation'
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
    
    // Log the request body for debugging
    logger.error('Classroom creation failed with data:', JSON.stringify(req.body, null, 2));
    
    // Return validation errors if they exist
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
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

// ==================== STUDENTS ROUTES ====================

/**
 * @route   GET /api/data/students
 * @desc    Get all students with optional filtering
 * @access  Private
 */
router.get('/students', [
  query('department').optional().trim(),
  query('program').optional().trim(),
  query('year').optional().isInt({ min: 1, max: 5 }),
  query('semester').optional().isInt({ min: 1, max: 2 }),
  query('division').optional().trim(),
  query('status').optional().isIn(['Active', 'Inactive', 'Graduated', 'Suspended', 'Transferred']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      department, 
      program, 
      year, 
      semester, 
      division, 
      status = 'Active',
      page = 1, 
      limit = 50 
    } = req.query;

    // Build filter object
    const filter = { status };
    if (department) filter['academicInfo.department'] = new RegExp(department, 'i');
    if (program) filter['academicInfo.program'] = new RegExp(program, 'i');
    if (year) filter['academicInfo.year'] = parseInt(year);
    if (semester) filter['academicInfo.semester'] = parseInt(semester);
    if (division) filter['academicInfo.division'] = new RegExp(division, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(filter)
        .select('-notes')
        .sort({ 'academicInfo.rollNumber': 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Student.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + students.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching students'
    });
  }
});

/**
 * @route   POST /api/data/students
 * @desc    Create a new student
 * @access  Private
 */
router.post('/students', [
  body('studentId').notEmpty().trim().withMessage('Student ID is required'),
  body('personalInfo.firstName').notEmpty().trim().withMessage('First name is required'),
  body('personalInfo.lastName').notEmpty().trim().withMessage('Last name is required'),
  body('personalInfo.email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('personalInfo.phone').optional().matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  body('academicInfo.department').notEmpty().trim().withMessage('Department is required'),
  body('academicInfo.program').notEmpty().trim().withMessage('Program is required'),
  body('academicInfo.year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('academicInfo.semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  body('academicInfo.division').notEmpty().trim().withMessage('Division is required'),
  body('academicInfo.rollNumber').notEmpty().trim().withMessage('Roll number is required'),
  body('academicInfo.admissionDate').isISO8601().withMessage('Valid admission date is required'),
  body('academicInfo.academicYear').notEmpty().trim().withMessage('Academic year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if student ID or email already exists in Student collection
    const existingStudent = await Student.findOne({
      $or: [
        { studentId: req.body.studentId },
        { 'personalInfo.email': req.body.personalInfo.email }
      ]
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student with this ID or email already exists'
      });
    }

    // Check if email already exists in User collection
    const existingUser = await User.findOne({ email: req.body.personalInfo.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const tempPassword = emailService.generateSecurePassword(10);

    // Create Student record
    const student = new Student(req.body);
    await student.save();

    // Create User account for student
    const userAccount = new User({
      name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
      email: student.personalInfo.email,
      password: tempPassword,
      role: 'student',
      department: student.academicInfo.department,
      isFirstLogin: true,
      mustChangePassword: true
    });
    await userAccount.save();

    // Prepare student data for email
    const studentEmailData = {
      studentId: student.studentId,
      firstName: student.personalInfo.firstName,
      lastName: student.personalInfo.lastName,
      email: student.personalInfo.email,
      rollNumber: student.academicInfo.rollNumber,
      department: student.academicInfo.department,
      program: student.academicInfo.program,
      year: student.academicInfo.year,
      semester: student.academicInfo.semester,
      division: student.academicInfo.division,
      batch: student.academicInfo.batch
    };

    // Send credentials email
    const emailSent = await emailService.sendStudentCredentials(studentEmailData, tempPassword);

    logger.info(`Student and user account created: ${student.studentId} by user ${req.user.userId}`, {
      studentId: student.studentId,
      userId: userAccount._id,
      emailSent
    });

    res.status(201).json({
      success: true,
      message: `Student created successfully${emailSent ? ' and credentials sent via email' : ' (email sending failed)'}`,
      data: { 
        student,
        userAccount: {
          id: userAccount._id,
          email: userAccount.email,
          role: userAccount.role
        },
        emailSent
      }
    });

  } catch (error) {
    logger.error('Error creating student:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Student with this information already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating student'
    });
  }
});

/**
 * @route   POST /api/data/students/bulk-create
 * @desc    Create multiple students and their user accounts
 * @access  Private
 */
router.post('/students/bulk-create', [
  body('students').isArray({ min: 1 }).withMessage('Students array is required'),
  body('students.*.studentId').notEmpty().trim(),
  body('students.*.personalInfo.firstName').notEmpty().trim(),
  body('students.*.personalInfo.lastName').notEmpty().trim(),
  body('students.*.personalInfo.email').isEmail().normalizeEmail(),
  body('students.*.academicInfo.department').notEmpty().trim(),
  body('students.*.academicInfo.program').notEmpty().trim(),
  body('students.*.academicInfo.year').isInt({ min: 1, max: 5 }),
  body('students.*.academicInfo.semester').isInt({ min: 1, max: 2 }),
  body('students.*.academicInfo.division').notEmpty().trim(),
  body('students.*.academicInfo.rollNumber').notEmpty().trim(),
  body('students.*.academicInfo.academicYear').notEmpty().trim(),
  body('sendCredentials').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { students, sendCredentials = false } = req.body;
    const results = {
      created: [],
      failed: [],
      userAccountsCreated: []
    };

    for (const studentData of students) {
      try {
        // Check if student already exists
        const existing = await Student.findOne({
          $or: [
            { studentId: studentData.studentId },
            { 'personalInfo.email': studentData.personalInfo.email }
          ]
        });

        if (existing) {
          results.failed.push({
            studentId: studentData.studentId,
            email: studentData.personalInfo.email,
            reason: 'Student already exists'
          });
          continue;
        }

        // Create student
        const student = new Student(studentData);
        await student.save();
        results.created.push(student);

        // Create user account if requested
        if (sendCredentials) {
          try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: studentData.personalInfo.email });
            if (existingUser) {
              results.failed.push({
                studentId: studentData.studentId,
                email: studentData.personalInfo.email,
                reason: 'User account already exists'
              });
              continue;
            }

            // Generate a secure temporary password
            const tempPassword = emailService.generateSecurePassword(10);
            
            const userData = {
              name: `${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`,
              email: studentData.personalInfo.email,
              password: tempPassword,
              role: 'student',
              department: studentData.academicInfo.department,
              isFirstLogin: true,
              mustChangePassword: true
            };

            const user = new User(userData);
            await user.save();

            const credentialData = {
              studentId: studentData.studentId,
              email: studentData.personalInfo.email,
              tempPassword: tempPassword,
              userId: user._id
            };

            results.userAccountsCreated.push(credentialData);

            // Send email with credentials
            const emailSent = await emailService.sendStudentCredentials({
              studentId: studentData.studentId,
              firstName: studentData.personalInfo.firstName,
              lastName: studentData.personalInfo.lastName,
              email: studentData.personalInfo.email,
              rollNumber: studentData.academicInfo.rollNumber,
              department: studentData.academicInfo.department,
              program: studentData.academicInfo.program,
              year: studentData.academicInfo.year,
              semester: studentData.academicInfo.semester,
              division: studentData.academicInfo.division,
              batch: studentData.academicInfo.batch
            }, tempPassword);
            
            if (emailSent) {
              logger.info(`Credentials email sent to student: ${studentData.studentId}`);
            } else {
              logger.warn(`Failed to send credentials email to student: ${studentData.studentId}`);
            }

          } catch (userError) {
            logger.error(`Failed to create user account for student ${studentData.studentId}:`, userError);
          }
        }

      } catch (error) {
        results.failed.push({
          studentId: studentData.studentId,
          email: studentData.personalInfo.email,
          reason: error.message
        });
      }
    }

    logger.info(`Bulk student creation completed: ${results.created.length} created, ${results.failed.length} failed`);

    // Send summary email to admin if there were successful account creations
    if (results.userAccountsCreated.length > 0) {
      try {
        const adminUser = await User.findById(req.user.userId);
        const adminEmail = adminUser ? adminUser.email : req.user.email;
        
        const emailSent = await emailService.sendBulkCreationSummary(results.userAccountsCreated, adminEmail);
        if (emailSent) {
          logger.info(`Bulk creation summary email sent to admin: ${adminEmail}`);
        } else {
          logger.warn('Failed to send bulk creation summary email to admin');
        }
      } catch (emailError) {
        logger.error('Failed to send bulk creation summary email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk operation completed: ${results.created.length} students created, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    logger.error('Error in bulk student creation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk student creation'
    });
  }
});

/**
 * @route   POST /api/data/students/upload
 * @desc    Upload students via CSV file
 * @access  Private
 */
router.post('/students/upload', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    const csvData = req.file.buffer.toString('utf8');
    const records = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      csv.parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })
      .on('data', (record) => records.push(record))
      .on('error', reject)
      .on('end', resolve);
    });

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is empty or invalid'
      });
    }

    const studentsToCreate = [];
    const { sendCredentials = false } = req.body;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // CSV row number (including header)

      try {
        // Validate required fields
        const requiredFields = [
          'studentId', 'firstName', 'lastName', 'email', 
          'department', 'program', 'year', 'semester', 
          'division', 'rollNumber', 'academicYear'
        ];

        for (const field of requiredFields) {
          if (!record[field]) {
            errors.push({
              row: rowNumber,
              field,
              message: `${field} is required`
            });
          }
        }

        if (errors.length > 0) continue;

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(record.email)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            message: 'Invalid email format'
          });
          continue;
        }

        // Validate phone if provided
        if (record.phone && !/^\d{10}$/.test(record.phone)) {
          errors.push({
            row: rowNumber,
            field: 'phone',
            message: 'Phone must be 10 digits'
          });
          continue;
        }

        // Create student object
        const studentData = {
          studentId: record.studentId.trim(),
          personalInfo: {
            firstName: record.firstName.trim(),
            lastName: record.lastName.trim(),
            email: record.email.toLowerCase().trim(),
            phone: record.phone ? record.phone.trim() : undefined,
            dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : undefined,
            gender: record.gender || undefined,
            address: {
              street: record.street || '',
              city: record.city || '',
              state: record.state || '',
              zipCode: record.zipCode || '',
              country: record.country || 'India'
            }
          },
          academicInfo: {
            department: record.department.trim(),
            program: record.program.trim(),
            year: parseInt(record.year),
            semester: parseInt(record.semester),
            division: record.division.trim(),
            batch: record.batch ? record.batch.trim() : undefined,
            rollNumber: record.rollNumber.trim(),
            admissionDate: record.admissionDate ? new Date(record.admissionDate) : new Date(),
            academicYear: record.academicYear.trim()
          },
          guardianInfo: {
            name: record.guardianName || '',
            relationship: record.guardianRelation || '',
            phone: record.guardianPhone || '',
            email: record.guardianEmail || ''
          }
        };

        // Add courses if provided
        if (record.courses) {
          const courseIds = record.courses.split(',').map(id => id.trim()).filter(id => id);
          studentData.enrolledCourses = courseIds.map(courseId => ({
            courseId,
            enrollmentDate: new Date()
          }));
        }

        studentsToCreate.push(studentData);

      } catch (error) {
        errors.push({
          row: rowNumber,
          message: `Processing error: ${error.message}`
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV validation failed',
        errors: errors.slice(0, 10) // Limit to first 10 errors
      });
    }

    // Bulk create students
    const bulkResult = await new Promise((resolve) => {
      req.body = { students: studentsToCreate, sendCredentials };
      resolve();
    });

    // Call bulk create endpoint logic
    const results = {
      created: [],
      failed: [],
      userAccountsCreated: []
    };

    for (const studentData of studentsToCreate) {
      try {
        const existing = await Student.findOne({
          $or: [
            { studentId: studentData.studentId },
            { 'personalInfo.email': studentData.personalInfo.email }
          ]
        });

        if (existing) {
          results.failed.push({
            studentId: studentData.studentId,
            email: studentData.personalInfo.email,
            reason: 'Student already exists'
          });
          continue;
        }

        const student = new Student(studentData);
        await student.save();
        results.created.push(student);

        if (sendCredentials) {
          try {
            const tempPassword = Math.random().toString(36).slice(-8);
            
            const userData = {
              name: `${studentData.personalInfo.firstName} ${studentData.personalInfo.lastName}`,
              email: studentData.personalInfo.email,
              password: tempPassword,
              role: 'student',
              department: studentData.academicInfo.department
            };

            const user = new User(userData);
            await user.save();

            const credentialData = {
              studentId: studentData.studentId,
              email: studentData.personalInfo.email,
              tempPassword: tempPassword
            };

            results.userAccountsCreated.push(credentialData);

            // Send email with credentials if email service is configured
            if (emailService.isConfigured()) {
              try {
                await emailService.sendStudentCredentials({
                  studentId: studentData.studentId,
                  firstName: studentData.personalInfo.firstName,
                  lastName: studentData.personalInfo.lastName,
                  email: studentData.personalInfo.email,
                  rollNumber: studentData.academicInfo.rollNumber,
                  department: studentData.academicInfo.department,
                  program: studentData.academicInfo.program,
                  year: studentData.academicInfo.year,
                  semester: studentData.academicInfo.semester,
                  division: studentData.academicInfo.division,
                  batch: studentData.academicInfo.batch
                }, tempPassword);
                
                logger.info(`Credentials email sent to student: ${studentData.studentId}`);
              } catch (emailError) {
                logger.error(`Failed to send email to student ${studentData.studentId}:`, emailError);
              }
            }

          } catch (userError) {
            logger.error(`Failed to create user account for student ${studentData.studentId}:`, userError);
          }
        }

      } catch (error) {
        results.failed.push({
          studentId: studentData.studentId,
          email: studentData.personalInfo.email,
          reason: error.message
        });
      }
    }

    logger.info(`CSV student upload completed: ${results.created.length} created, ${results.failed.length} failed`);

    // Send summary email to admin if there were successful account creations
    if (results.userAccountsCreated.length > 0 && emailService.isConfigured()) {
      try {
        await emailService.sendBulkCreationSummary(results.userAccountsCreated, req.user.email);
        logger.info(`CSV upload summary email sent to admin: ${req.user.email}`);
      } catch (emailError) {
        logger.error('Failed to send CSV upload summary email:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: `CSV upload completed: ${results.created.length} students created, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    logger.error('Error uploading students CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while uploading students'
    });
  }
});

/**
 * @route   GET /api/data/students/export
 * @desc    Export students as CSV
 * @access  Private
 */
router.get('/students/export', [
  query('department').optional().trim(),
  query('program').optional().trim(),
  query('year').optional().isInt({ min: 1, max: 5 }),
  query('semester').optional().isInt({ min: 1, max: 2 }),
  query('division').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { department, program, year, semester, division } = req.query;

    // Build filter
    const filter = { status: 'Active' };
    if (department) filter['academicInfo.department'] = new RegExp(department, 'i');
    if (program) filter['academicInfo.program'] = new RegExp(program, 'i');
    if (year) filter['academicInfo.year'] = parseInt(year);
    if (semester) filter['academicInfo.semester'] = parseInt(semester);
    if (division) filter['academicInfo.division'] = new RegExp(division, 'i');

    const students = await Student.find(filter).lean();

    // Convert to CSV format
    const csvData = students.map(student => ({
      studentId: student.studentId,
      firstName: student.personalInfo.firstName,
      lastName: student.personalInfo.lastName,
      email: student.personalInfo.email,
      phone: student.personalInfo.phone || '',
      dateOfBirth: student.personalInfo.dateOfBirth ? student.personalInfo.dateOfBirth.toISOString().split('T')[0] : '',
      gender: student.personalInfo.gender || '',
      department: student.academicInfo.department,
      program: student.academicInfo.program,
      year: student.academicInfo.year,
      semester: student.academicInfo.semester,
      division: student.academicInfo.division,
      batch: student.academicInfo.batch || '',
      rollNumber: student.academicInfo.rollNumber,
      admissionDate: student.academicInfo.admissionDate.toISOString().split('T')[0],
      academicYear: student.academicInfo.academicYear,
      status: student.status,
      guardianName: student.guardianInfo?.name || '',
      guardianPhone: student.guardianInfo?.phone || '',
      guardianEmail: student.guardianInfo?.email || '',
      courses: student.enrolledCourses?.map(c => c.courseId).join(',') || '',
      street: student.personalInfo.address?.street || '',
      city: student.personalInfo.address?.city || '',
      state: student.personalInfo.address?.state || '',
      zipCode: student.personalInfo.address?.zipCode || '',
      country: student.personalInfo.address?.country || 'India'
    }));

    csvStringify.stringify(csvData, {
      header: true,
      columns: [
        'studentId', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender',
        'department', 'program', 'year', 'semester', 'division', 'batch', 'rollNumber',
        'admissionDate', 'academicYear', 'status', 'guardianName', 'guardianPhone', 
        'guardianEmail', 'courses', 'street', 'city', 'state', 'zipCode', 'country'
      ]
    }, (err, output) => {
      if (err) {
        logger.error('Error generating CSV:', err);
        return res.status(500).json({
          success: false,
          message: 'Error generating CSV'
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
      res.send(output);
    });

  } catch (error) {
    logger.error('Error exporting students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while exporting students'
    });
  }
});

/**
 * @route   GET /api/data/students/stats
 * @desc    Get student statistics
 * @access  Private
 */
router.get('/students/stats', async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: {
            department: '$academicInfo.department',
            program: '$academicInfo.program',
            year: '$academicInfo.year',
            semester: '$academicInfo.semester'
          },
          totalStudents: { $sum: 1 },
          divisions: { $addToSet: '$academicInfo.division' }
        }
      },
      {
        $group: {
          _id: '$_id.department',
          programs: {
            $push: {
              program: '$_id.program',
              year: '$_id.year',
              semester: '$_id.semester',
              totalStudents: '$totalStudents',
              divisions: '$divisions'
            }
          },
          departmentTotal: { $sum: '$totalStudents' }
        }
      }
    ]);

    const totalStudents = await Student.countDocuments({ status: 'Active' });

    res.json({
      success: true,
      data: {
        totalStudents,
        departments: stats
      }
    });

  } catch (error) {
    logger.error('Error fetching student stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching student statistics'
    });
  }
});

// ==================== PROGRAMS ROUTES ====================

/**
 * @route   GET /api/data/programs
 * @desc    Get all programs with optional filtering
 * @access  Private
 */
router.get('/programs', [
  query('school').optional().trim(),
  query('type').optional().isIn(['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate']),
  query('status').optional().isIn(['Active', 'Inactive', 'Archived']),
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

    const { school, type, status, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    if (school) query.school = school;
    if (type) query.type = type;
    if (status) query.status = status;
    else query.status = 'Active'; // Default to active programs

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const programs = await Program.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ school: 1, name: 1 });

    const total = await Program.countDocuments(query);

    res.json({
      success: true,
      data: programs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching programs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching programs'
    });
  }
});

/**
 * @route   GET /api/data/programs/:id
 * @desc    Get a specific program
 * @access  Private
 */
router.get('/programs/:id', async (req, res) => {
  try {
    const program = await Program.findOne({ id: req.params.id });
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });

  } catch (error) {
    logger.error('Error fetching program:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching program'
    });
  }
});

/**
 * @route   POST /api/data/programs
 * @desc    Create a new program
 * @access  Private
 */
router.post('/programs', [
  body('id').trim().notEmpty().withMessage('Program ID is required'),
  body('name').trim().isLength({ min: 2, max: 150 }).withMessage('Name must be between 2 and 150 characters'),
  body('code').trim().notEmpty().withMessage('Program code is required'),
  body('school').trim().notEmpty().withMessage('School is required'),
  body('type').isIn(['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate']).withMessage('Invalid program type'),
  body('duration').isInt({ min: 1, max: 8 }).withMessage('Duration must be between 1 and 8 years'),
  body('totalSemesters').isInt({ min: 1, max: 16 }).withMessage('Total semesters must be between 1 and 16')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if program ID already exists
    const existingProgram = await Program.findOne({ id: req.body.id });
    if (existingProgram) {
      return res.status(400).json({
        success: false,
        message: 'Program with this ID already exists'
      });
    }

    // Check if program code already exists
    const existingCode = await Program.findOne({ code: req.body.code });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Program with this code already exists'
      });
    }

    const program = new Program(req.body);
    await program.save();

    logger.info('Program created', { programId: program.id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program
    });

  } catch (error) {
    logger.error('Error creating program:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating program'
    });
  }
});

/**
 * @route   PUT /api/data/programs/:id
 * @desc    Update a program
 * @access  Private
 */
router.put('/programs/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 150 }),
  body('code').optional().trim().notEmpty(),
  body('school').optional().trim().notEmpty(),
  body('type').optional().isIn(['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate']),
  body('duration').optional().isInt({ min: 1, max: 8 }),
  body('totalSemesters').optional().isInt({ min: 1, max: 16 }),
  body('status').optional().isIn(['Active', 'Inactive', 'Archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const program = await Program.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    logger.info('Program updated', { programId: program.id, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program
    });

  } catch (error) {
    logger.error('Error updating program:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating program'
    });
  }
});

/**
 * @route   DELETE /api/data/programs/:id
 * @desc    Delete a program
 * @access  Private
 */
router.delete('/programs/:id', async (req, res) => {
  try {
    const program = await Program.findOneAndDelete({ id: req.params.id });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    logger.info('Program deleted', { programId: program.id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting program'
    });
  }
});

// ==================== DIVISIONS ROUTES ====================

/**
 * @route   GET /api/data/divisions
 * @desc    Get all divisions with optional filtering
 * @access  Private
 */
router.get('/divisions', [
  query('program').optional().trim(),
  query('year').optional().isInt({ min: 1, max: 5 }),
  query('semester').optional().isInt({ min: 1, max: 2 }),
  query('status').optional().isIn(['Active', 'Inactive', 'Archived']),
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

    const { program, year, semester, status, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    if (program) query.program = program;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (status) query.status = status;
    else query.status = 'Active'; // Default to active divisions

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const divisions = await Division.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ program: 1, year: 1, semester: 1, name: 1 });

    const total = await Division.countDocuments(query);

    res.json({
      success: true,
      data: divisions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching divisions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching divisions'
    });
  }
});

/**
 * @route   GET /api/data/divisions/:id
 * @desc    Get a specific division
 * @access  Private
 */
router.get('/divisions/:id', async (req, res) => {
  try {
    const division = await Division.findOne({ id: req.params.id });
    
    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    res.json({
      success: true,
      data: division
    });

  } catch (error) {
    logger.error('Error fetching division:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching division'
    });
  }
});

/**
 * @route   POST /api/data/divisions
 * @desc    Create a new division
 * @access  Private
 */
router.post('/divisions', [
  body('id').trim().notEmpty().withMessage('Division ID is required'),
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('program').trim().notEmpty().withMessage('Program is required'),
  body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  body('studentCount').isInt({ min: 1, max: 500 }).withMessage('Student count must be between 1 and 500'),
  body('labBatches').optional().isInt({ min: 0 }).withMessage('Lab batches must be 0 or greater')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if division ID already exists
    const existingDivision = await Division.findOne({ id: req.body.id });
    if (existingDivision) {
      return res.status(400).json({
        success: false,
        message: 'Division with this ID already exists'
      });
    }

    const division = new Division(req.body);
    await division.save();

    logger.info('Division created', { divisionId: division.id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Division created successfully',
      data: division
    });

  } catch (error) {
    logger.error('Error creating division:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating division'
    });
  }
});

/**
 * @route   PUT /api/data/divisions/:id
 * @desc    Update a division
 * @access  Private
 */
router.put('/divisions/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('program').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1, max: 5 }),
  body('semester').optional().isInt({ min: 1, max: 2 }),
  body('studentCount').optional().isInt({ min: 1, max: 500 }),
  body('labBatches').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['Active', 'Inactive', 'Archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const division = await Division.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    logger.info('Division updated', { divisionId: division.id, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Division updated successfully',
      data: division
    });

  } catch (error) {
    logger.error('Error updating division:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating division'
    });
  }
});

/**
 * @route   DELETE /api/data/divisions/:id
 * @desc    Delete a division
 * @access  Private
 */
router.delete('/divisions/:id', async (req, res) => {
  try {
    const division = await Division.findOneAndDelete({ id: req.params.id });

    if (!division) {
      return res.status(404).json({
        success: false,
        message: 'Division not found'
      });
    }

    logger.info('Division deleted', { divisionId: division.id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Division deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting division:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting division'
    });
  }
});

// ==================== SYSTEM CONFIGURATION ROUTES ====================

/**
 * @route   GET /api/data/system-config
 * @desc    Get system configuration
 * @access  Private
 */
router.get('/system-config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ isActive: true });

    if (!config) {
      // Create default configuration if none exists
      config = new SystemConfig({
        createdBy: req.user.userId,
        generalPolicies: {},
        workingHours: {},
        academicCalendar: {
          academicYearStart: new Date('2024-07-01'),
          academicYearEnd: new Date('2025-06-30'),
          semester1Start: new Date('2024-07-01'),
          semester1End: new Date('2024-12-15'),
          semester2Start: new Date('2025-01-01'),
          semester2End: new Date('2025-06-30')
        },
        constraintRules: {}
      });
      await config.save();
      logger.info('Default system configuration created', { createdBy: req.user.userId });
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    logger.error('Error fetching system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching system configuration'
    });
  }
});

/**
 * @route   PUT /api/data/system-config
 * @desc    Update system configuration
 * @access  Private
 */
router.put('/system-config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ isActive: true });

    if (!config) {
      // Create new configuration
      config = new SystemConfig({
        ...req.body,
        createdBy: req.user.userId
      });
    } else {
      // Update existing configuration
      Object.assign(config, req.body);
      config.updatedBy = req.user.userId;
    }

    await config.save();

    logger.info('System configuration updated', { updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'System configuration updated successfully',
      data: config
    });

  } catch (error) {
    logger.error('Error updating system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating system configuration'
    });
  }
});

/**
 * @route   PUT /api/data/system-config/general-policies
 * @desc    Update general policies
 * @access  Private
 */
router.put('/system-config/general-policies', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ isActive: true });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    config.generalPolicies = { ...config.generalPolicies, ...req.body };
    config.updatedBy = req.user.userId;
    await config.save();

    logger.info('General policies updated', { updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'General policies updated successfully',
      data: config.generalPolicies
    });

  } catch (error) {
    logger.error('Error updating general policies:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating general policies'
    });
  }
});

/**
 * @route   PUT /api/data/system-config/working-hours
 * @desc    Update working hours
 * @access  Private
 */
router.put('/system-config/working-hours', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ isActive: true });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    config.workingHours = { ...config.workingHours, ...req.body };
    config.updatedBy = req.user.userId;
    await config.save();

    logger.info('Working hours updated', { updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Working hours updated successfully',
      data: config.workingHours
    });

  } catch (error) {
    logger.error('Error updating working hours:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating working hours'
    });
  }
});

/**
 * @route   PUT /api/data/system-config/academic-calendar
 * @desc    Update academic calendar
 * @access  Private
 */
router.put('/system-config/academic-calendar', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ isActive: true });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    config.academicCalendar = { ...config.academicCalendar, ...req.body };
    config.updatedBy = req.user.userId;
    await config.save();

    logger.info('Academic calendar updated', { updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Academic calendar updated successfully',
      data: config.academicCalendar
    });

  } catch (error) {
    logger.error('Error updating academic calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating academic calendar'
    });
  }
});

/**
 * @route   PUT /api/data/system-config/constraint-rules
 * @desc    Update constraint rules
 * @access  Private
 */
router.put('/system-config/constraint-rules', async (req, res) => {
  try {
    let config = await SystemConfig.findOne({ isActive: true });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'System configuration not found'
      });
    }

    config.constraintRules = { ...config.constraintRules, ...req.body };
    config.updatedBy = req.user.userId;
    await config.save();

    logger.info('Constraint rules updated', { updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Constraint rules updated successfully',
      data: config.constraintRules
    });

  } catch (error) {
    logger.error('Error updating constraint rules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating constraint rules'
    });
  }
});

// ==================== HOLIDAYS ROUTES ====================

/**
 * @route   GET /api/data/holidays
 * @desc    Get all holidays
 * @access  Private
 */
router.get('/holidays', [
  query('type').optional().trim(),
  query('status').optional().isIn(['Active', 'Inactive', 'Archived']),
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

    const { type, status, page = 1, limit = 50 } = req.query;
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const holidays = await Holiday.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1, startDate: 1 });

    const total = await Holiday.countDocuments(query);

    res.json({
      success: true,
      data: holidays,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching holidays'
    });
  }
});

/**
 * @route   GET /api/data/holidays/:id
 * @desc    Get a specific holiday
 * @access  Private
 */
router.get('/holidays/:id', async (req, res) => {
  try {
    const holiday = await Holiday.findOne({ id: req.params.id });

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    res.json({
      success: true,
      data: holiday
    });

  } catch (error) {
    logger.error('Error fetching holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching holiday'
    });
  }
});

/**
 * @route   POST /api/data/holidays
 * @desc    Create a new holiday
 * @access  Private
 */
router.post('/holidays', [
  body('id').trim().notEmpty().withMessage('ID is required'),
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Name must be between 1 and 200 characters'),
  body('type').isIn(['National Holiday', 'Festival', 'Examination', 'Vacation', 'Academic Event', 'Other']).withMessage('Invalid holiday type'),
  body('recurring').optional().isBoolean(),
  body('isDateRange').optional().isBoolean(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if holiday ID already exists
    const existingHoliday = await Holiday.findOne({ id: req.body.id });
    if (existingHoliday) {
      return res.status(400).json({
        success: false,
        message: 'Holiday with this ID already exists'
      });
    }

    const holiday = new Holiday({
      ...req.body,
      createdBy: req.user.userId
    });
    await holiday.save();

    logger.info('Holiday created', { holidayId: holiday.id, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Holiday created successfully',
      data: holiday
    });

  } catch (error) {
    logger.error('Error creating holiday:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while creating holiday'
    });
  }
});

/**
 * @route   PUT /api/data/holidays/:id
 * @desc    Update a holiday
 * @access  Private
 */
router.put('/holidays/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('type').optional().isIn(['National Holiday', 'Festival', 'Examination', 'Vacation', 'Academic Event', 'Other']),
  body('recurring').optional().isBoolean(),
  body('isDateRange').optional().isBoolean(),
  body('status').optional().isIn(['Active', 'Inactive', 'Archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const holiday = await Holiday.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedBy: req.user.userId },
      { new: true, runValidators: true }
    );

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    logger.info('Holiday updated', { holidayId: holiday.id, updatedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Holiday updated successfully',
      data: holiday
    });

  } catch (error) {
    logger.error('Error updating holiday:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while updating holiday'
    });
  }
});

/**
 * @route   DELETE /api/data/holidays/:id
 * @desc    Delete a holiday
 * @access  Private
 */
router.delete('/holidays/:id', async (req, res) => {
  try {
    const holiday = await Holiday.findOneAndDelete({ id: req.params.id });

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: 'Holiday not found'
      });
    }

    logger.info('Holiday deleted', { holidayId: holiday.id, deletedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Holiday deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting holiday:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting holiday'
    });
  }
});

/**
 * @route   POST /api/data/holidays/bulk
 * @desc    Create multiple holidays
 * @access  Private
 */
router.post('/holidays/bulk', async (req, res) => {
  try {
    const { holidays } = req.body;

    if (!Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Holidays array is required'
      });
    }

    // Add createdBy to each holiday
    const holidaysWithCreator = holidays.map(h => ({
      ...h,
      createdBy: req.user.userId
    }));

    const result = await Holiday.insertMany(holidaysWithCreator, { ordered: false });

    logger.info('Bulk holidays created', { count: result.length, createdBy: req.user.userId });

    res.status(201).json({
      success: true,
      message: `${result.length} holidays created successfully`,
      data: result
    });

  } catch (error) {
    logger.error('Error creating bulk holidays:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating holidays'
    });
  }
});

module.exports = router;
