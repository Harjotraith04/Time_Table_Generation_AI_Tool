import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import Teacher from '../models/Teacher.js';
import Classroom from '../models/Classroom.js';
import Course from '../models/Course.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// ==================== TEACHER ROUTES ====================

/**
 * @route GET /api/data/teachers
 * @desc Get all teachers with filtering and pagination
 * @access Private
 */
router.get('/teachers', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('school').optional().notEmpty().withMessage('School cannot be empty'),
  query('department').optional().notEmpty().withMessage('Department cannot be empty'),
  query('teacherType').optional().isIn(['core', 'visiting']).withMessage('Invalid teacher type'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
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
    school,
    department,
    teacherType,
    isActive
  } = req.query;

  // Build filter
  const filter = {};
  if (school) filter.school = school;
  if (department) filter.department = department;
  if (teacherType) filter.teacherType = teacherType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email'),
    Teacher.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      teachers,
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
 * @route POST /api/data/teachers
 * @desc Create a new teacher
 * @access Private
 */
router.post('/teachers', [
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('teacherType').isIn(['core', 'visiting']).withMessage('Invalid teacher type'),
  body('school').notEmpty().withMessage('School is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('subjects').isArray().withMessage('Subjects must be an array'),
  body('subjects.*.subjectCode').notEmpty().withMessage('Subject code is required'),
  body('subjects.*.subjectName').notEmpty().withMessage('Subject name is required'),
  body('subjects.*.subjectType').isIn(['theory', 'tutorial', 'lab', 'practical']).withMessage('Invalid subject type'),
  body('subjects.*.hoursPerWeek').isInt({ min: 1, max: 40 }).withMessage('Hours per week must be between 1 and 40')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const teacher = new Teacher({
    ...req.body,
    createdBy: req.user.id
  });

  await teacher.save();

  res.status(201).json({
    success: true,
    message: 'Teacher created successfully',
    data: { teacher }
  });
}));

/**
 * @route PUT /api/data/teachers/:id
 * @desc Update teacher
 * @access Private
 */
router.put('/teachers/:id', [
  param('id').isMongoId().withMessage('Invalid teacher ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('teacherType').optional().isIn(['core', 'visiting']).withMessage('Invalid teacher type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found'
    });
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (key !== 'teacherId' && key !== 'createdBy') {
      teacher[key] = req.body[key];
    }
  });

  teacher.updatedBy = req.user.id;
  await teacher.save();

  res.json({
    success: true,
    message: 'Teacher updated successfully',
    data: { teacher }
  });
}));

/**
 * @route DELETE /api/data/teachers/:id
 * @desc Delete teacher (soft delete)
 * @access Private
 */
router.delete('/teachers/:id', [
  param('id').isMongoId().withMessage('Invalid teacher ID')
], asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found'
    });
  }

  teacher.isActive = false;
  teacher.updatedBy = req.user.id;
  await teacher.save();

  res.json({
    success: true,
    message: 'Teacher deactivated successfully'
  });
}));

// ==================== CLASSROOM ROUTES ====================

/**
 * @route GET /api/data/classrooms
 * @desc Get all classrooms with filtering and pagination
 * @access Private
 */
router.get('/classrooms', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('building').optional().notEmpty().withMessage('Building cannot be empty'),
  query('roomType').optional().isIn(['lecture', 'lab', 'computer', 'tutorial', 'seminar', 'auditorium']).withMessage('Invalid room type'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
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
    building,
    roomType,
    isActive
  } = req.query;

  // Build filter
  const filter = {};
  if (building) filter.building = building;
  if (roomType) filter.roomType = roomType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [classrooms, total] = await Promise.all([
    Classroom.find(filter)
      .sort({ building: 1, floor: 1, roomName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email'),
    Classroom.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      classrooms,
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
 * @route POST /api/data/classrooms
 * @desc Create a new classroom
 * @access Private
 */
router.post('/classrooms', [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('roomName').notEmpty().withMessage('Room name is required'),
  body('building').notEmpty().withMessage('Building is required'),
  body('floor').isInt({ min: 0, max: 50 }).withMessage('Floor must be between 0 and 50'),
  body('capacity').isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),
  body('roomType').isIn(['lecture', 'lab', 'computer', 'tutorial', 'seminar', 'auditorium']).withMessage('Invalid room type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const classroom = new Classroom({
    ...req.body,
    createdBy: req.user.id
  });

  await classroom.save();

  res.status(201).json({
    success: true,
    message: 'Classroom created successfully',
    data: { classroom }
  });
}));

/**
 * @route PUT /api/data/classrooms/:id
 * @desc Update classroom
 * @access Private
 */
router.put('/classrooms/:id', [
  param('id').isMongoId().withMessage('Invalid classroom ID'),
  body('roomName').optional().notEmpty().withMessage('Room name cannot be empty'),
  body('capacity').optional().isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),
  body('roomType').optional().isIn(['lecture', 'lab', 'computer', 'tutorial', 'seminar', 'auditorium']).withMessage('Invalid room type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const classroom = await Classroom.findById(req.params.id);
  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found'
    });
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (key !== 'roomId' && key !== 'createdBy') {
      classroom[key] = req.body[key];
    }
  });

  classroom.updatedBy = req.user.id;
  await classroom.save();

  res.json({
    success: true,
    message: 'Classroom updated successfully',
    data: { classroom }
  });
}));

/**
 * @route DELETE /api/data/classrooms/:id
 * @desc Delete classroom (soft delete)
 * @access Private
 */
router.delete('/classrooms/:id', [
  param('id').isMongoId().withMessage('Invalid classroom ID')
], asyncHandler(async (req, res) => {
  const classroom = await Classroom.findById(req.params.id);
  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: 'Classroom not found'
    });
  }

  classroom.isActive = false;
  classroom.updatedBy = req.user.id;
  await classroom.save();

  res.json({
    success: true,
    message: 'Classroom deactivated successfully'
  });
}));

// ==================== COURSE ROUTES ====================

/**
 * @route GET /api/data/courses
 * @desc Get all courses with filtering and pagination
 * @access Private
 */
router.get('/courses', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('program').optional().notEmpty().withMessage('Program cannot be empty'),
  query('academicYear').optional().notEmpty().withMessage('Academic year cannot be empty'),
  query('semester').optional().isIn(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']).withMessage('Invalid semester'),
  query('courseType').optional().isIn(['core', 'elective', 'open_elective', 'department_elective', 'audit']).withMessage('Invalid course type')
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
    program,
    academicYear,
    semester,
    courseType
  } = req.query;

  // Build filter
  const filter = {};
  if (program) filter.program = program;
  if (academicYear) filter.academicYear = academicYear;
  if (semester) filter.semester = semester;
  if (courseType) filter.courseType = courseType;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort({ program: 1, academicYear: 1, semester: 1, courseCode: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('assignedFaculty.teacherId', 'name email'),
    Course.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      courses,
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
 * @route POST /api/data/courses
 * @desc Create a new course
 * @access Private
 */
router.post('/courses', [
  body('courseCode').notEmpty().withMessage('Course code is required'),
  body('courseName').notEmpty().withMessage('Course name is required'),
  body('school').notEmpty().withMessage('School is required'),
  body('program').notEmpty().withMessage('Program is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('semester').isIn(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']).withMessage('Invalid semester'),
  body('courseType').isIn(['core', 'elective', 'open_elective', 'department_elective', 'audit']).withMessage('Invalid course type'),
  body('category').isIn(['theory', 'practical', 'tutorial', 'project', 'seminar']).withMessage('Invalid category'),
  body('weeklySchedule.theoryHours').isInt({ min: 0, max: 20 }).withMessage('Theory hours must be between 0 and 20'),
  body('weeklySchedule.practicalHours').isInt({ min: 0, max: 20 }).withMessage('Practical hours must be between 0 and 20'),
  body('weeklySchedule.tutorialHours').isInt({ min: 0, max: 20 }).withMessage('Tutorial hours must be between 0 and 20')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const course = new Course({
    ...req.body,
    createdBy: req.user.id
  });

  await course.save();

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: { course }
  });
}));

/**
 * @route PUT /api/data/courses/:id
 * @desc Update course
 * @access Private
 */
router.put('/courses/:id', [
  param('id').isMongoId().withMessage('Invalid course ID'),
  body('courseName').optional().notEmpty().withMessage('Course name cannot be empty'),
  body('courseType').optional().isIn(['core', 'elective', 'open_elective', 'department_elective', 'audit']).withMessage('Invalid course type')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (key !== 'courseCode' && key !== 'createdBy') {
      course[key] = req.body[key];
    }
  });

  course.updatedBy = req.user.id;
  await course.save();

  res.json({
    success: true,
    message: 'Course updated successfully',
    data: { course }
  });
}));

/**
 * @route DELETE /api/data/courses/:id
 * @desc Delete course (soft delete)
 * @access Private
 */
router.delete('/courses/:id', [
  param('id').isMongoId().withMessage('Invalid course ID')
], asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  course.isActive = false;
  course.updatedBy = req.user.id;
  await course.save();

  res.json({
    success: true,
    message: 'Course deactivated successfully'
  });
}));

// ==================== BULK IMPORT ROUTES ====================

/**
 * @route POST /api/data/teachers/bulk-import
 * @desc Bulk import teachers
 * @access Private
 */
router.post('/teachers/bulk-import', asyncHandler(async (req, res) => {
  const { teachers } = req.body;
  
  if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Teachers array is required and must not be empty'
    });
  }

  // Validate each teacher
  const validTeachers = [];
  const invalidTeachers = [];
  
  for (const teacherData of teachers) {
    try {
      const teacher = new Teacher({
        ...teacherData,
        createdBy: req.user.id
      });
      await teacher.validate();
      validTeachers.push(teacher);
    } catch (error) {
      invalidTeachers.push({
        data: teacherData,
        errors: error.errors
      });
    }
  }

  if (invalidTeachers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Some teachers have validation errors',
      data: {
        valid: validTeachers.length,
        invalid: invalidTeachers.length,
        invalidDetails: invalidTeachers
      }
    });
  }

  // Save all valid teachers
  const savedTeachers = await Teacher.insertMany(validTeachers);

  res.status(201).json({
    success: true,
    message: `${savedTeachers.length} teachers imported successfully`,
    data: {
      imported: savedTeachers.length,
      teachers: savedTeachers
    }
  });
}));

/**
 * @route POST /api/data/classrooms/bulk-import
 * @desc Bulk import classrooms
 * @access Private
 */
router.post('/classrooms/bulk-import', asyncHandler(async (req, res) => {
  const { classrooms } = req.body;
  
  if (!classrooms || !Array.isArray(classrooms) || classrooms.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Classrooms array is required and must not be empty'
    });
  }

  // Validate each classroom
  const validClassrooms = [];
  const invalidClassrooms = [];
  
  for (const classroomData of classrooms) {
    try {
      const classroom = new Classroom({
        ...classroomData,
        createdBy: req.user.id
      });
      await classroom.validate();
      validClassrooms.push(classroom);
    } catch (error) {
      invalidClassrooms.push({
        data: classroomData,
        errors: error.errors
      });
    }
  }

  if (invalidClassrooms.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Some classrooms have validation errors',
      data: {
        valid: validClassrooms.length,
        invalid: invalidClassrooms.length,
        invalidDetails: invalidClassrooms
      }
    });
  }

  // Save all valid classrooms
  const savedClassrooms = await Classroom.insertMany(validClassrooms);

  res.status(201).json({
    success: true,
    message: `${savedClassrooms.length} classrooms imported successfully`,
    data: {
      imported: savedClassrooms.length,
      classrooms: savedClassrooms
    }
  });
}));

/**
 * @route POST /api/data/courses/bulk-import
 * @desc Bulk import courses
 * @access Private
 */
router.post('/courses/bulk-import', asyncHandler(async (req, res) => {
  const { courses } = req.body;
  
  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Courses array is required and must not be empty'
    });
  }

  // Validate each course
  const validCourses = [];
  const invalidCourses = [];
  
  for (const courseData of courses) {
    try {
      const course = new Course({
        ...courseData,
        createdBy: req.user.id
      });
      await course.validate();
      validCourses.push(course);
    } catch (error) {
      invalidCourses.push({
        data: courseData,
        errors: error.errors
      });
    }
  }

  if (invalidCourses.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Some courses have validation errors',
      data: {
        valid: validCourses.length,
        invalid: invalidCourses.length,
        invalidDetails: invalidCourses
      }
    });
  }

  // Save all valid courses
  const savedCourses = await Course.insertMany(validCourses);

  res.status(201).json({
    success: true,
    message: `${savedCourses.length} courses imported successfully`,
    data: {
      imported: savedCourses.length,
      courses: savedCourses
    }
  });
}));

// ==================== DATA VALIDATION AND STATISTICS ====================

/**
 * @route GET /api/data/validate
 * @desc Validate all data for timetable generation
 * @access Private
 */
router.get('/validate', asyncHandler(async (req, res) => {
  const validationResults = {};

  // Validate teachers
  const teachers = await Teacher.find({ isActive: true });
  validationResults.teachers = {
    total: teachers.length,
    valid: teachers.filter(t => t.subjects.length > 0).length,
    issues: []
  };

  teachers.forEach(teacher => {
    if (teacher.subjects.length === 0) {
      validationResults.teachers.issues.push({
        teacherId: teacher.teacherId,
        name: teacher.name,
        issue: 'No subjects assigned'
      });
    }
  });

  // Validate classrooms
  const classrooms = await Classroom.find({ isActive: true });
  validationResults.classrooms = {
    total: classrooms.length,
    valid: classrooms.filter(c => c.capacity > 0).length,
    issues: []
  };

  classrooms.forEach(classroom => {
    if (classroom.capacity <= 0) {
      validationResults.classrooms.issues.push({
        roomId: classroom.roomId,
        name: classroom.roomName,
        issue: 'Invalid capacity'
      });
    }
  });

  // Validate courses
  const courses = await Course.find({ isActive: true });
  validationResults.courses = {
    total: courses.length,
    valid: courses.filter(c => c.weeklySchedule.totalHours > 0).length,
    issues: []
  };

  courses.forEach(course => {
    if (course.weeklySchedule.totalHours === 0) {
      validationResults.courses.issues.push({
        courseCode: course.courseCode,
        name: course.courseName,
        issue: 'No weekly hours specified'
      });
    }
  });

  // Overall validation
  const totalIssues = Object.values(validationResults).reduce((sum, result) => sum + result.issues.length, 0);
  validationResults.isValid = totalIssues === 0;
  validationResults.totalIssues = totalIssues;

  res.json({
    success: true,
    data: validationResults
  });
}));

/**
 * @route GET /api/data/statistics
 * @desc Get data statistics
 * @access Private
 */
router.get('/statistics', asyncHandler(async (req, res) => {
  const [teachers, classrooms, courses] = await Promise.all([
    Teacher.countDocuments({ isActive: true }),
    Classroom.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true })
  ]);

  const statistics = {
    teachers: {
      total: teachers,
      core: await Teacher.countDocuments({ isActive: true, teacherType: 'core' }),
      visiting: await Teacher.countDocuments({ isActive: true, teacherType: 'visiting' })
    },
    classrooms: {
      total: classrooms,
      byType: await Classroom.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$roomType', count: { $sum: 1 } } }
      ])
    },
    courses: {
      total: courses,
      byType: await Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$courseType', count: { $sum: 1 } } }
      ])
    }
  };

  res.json({
    success: true,
    data: statistics
  });
}));

export default router;
