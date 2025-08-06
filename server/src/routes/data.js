import express from 'express';
import Teacher from '../models/Teacher.js';
import Classroom from '../models/Classroom.js';
import Course from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ==================== TEACHERS ====================

/**
 * Get all teachers
 */
router.get('/teachers', async (req, res) => {
  try {
    const { page = 1, limit = 50, department, isActive = true } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const teachers = await Teacher.find(filter)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Teacher.countDocuments(filter);

    res.json({
      teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      error: 'Failed to fetch teachers',
      message: error.message
    });
  }
});

/**
 * Create new teacher
 */
router.post('/teachers', async (req, res) => {
  try {
    const teacherData = {
      id: uuidv4(),
      ...req.body
    };

    const teacher = new Teacher(teacherData);
    await teacher.save();

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher
    });

  } catch (error) {
    console.error('Error creating teacher:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        error: 'Duplicate entry',
        message: 'A teacher with this email or ID already exists'
      });
    } else {
      res.status(500).json({
        error: 'Failed to create teacher',
        message: error.message
      });
    }
  }
});

/**
 * Update teacher
 */
router.put('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({
        error: 'Teacher not found'
      });
    }

    res.json({
      message: 'Teacher updated successfully',
      teacher
    });

  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({
      error: 'Failed to update teacher',
      message: error.message
    });
  }
});

/**
 * Delete teacher
 */
router.delete('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await Teacher.findOneAndDelete({ id });
    if (!teacher) {
      return res.status(404).json({
        error: 'Teacher not found'
      });
    }

    res.json({
      message: 'Teacher deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({
      error: 'Failed to delete teacher',
      message: error.message
    });
  }
});

/**
 * Bulk import teachers
 */
router.post('/teachers/bulk-import', async (req, res) => {
  try {
    const { teachers } = req.body;
    
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Teachers array is required and must not be empty'
      });
    }

    const teachersWithIds = teachers.map(teacher => ({
      id: teacher.id || uuidv4(),
      ...teacher
    }));

    const result = await Teacher.insertMany(teachersWithIds, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${result.length} teachers`,
      imported: result.length,
      total: teachers.length
    });

  } catch (error) {
    console.error('Error importing teachers:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        error: 'Duplicate entries found',
        message: 'Some teachers already exist in the database'
      });
    } else {
      res.status(500).json({
        error: 'Failed to import teachers',
        message: error.message
      });
    }
  }
});

// ==================== CLASSROOMS ====================

/**
 * Get all classrooms
 */
router.get('/classrooms', async (req, res) => {
  try {
    const { page = 1, limit = 50, building, type, isActive = true } = req.query;
    
    const filter = {};
    if (building) filter.building = building;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const classrooms = await Classroom.find(filter)
      .sort({ building: 1, floor: 1, roomNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Classroom.countDocuments(filter);

    res.json({
      classrooms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({
      error: 'Failed to fetch classrooms',
      message: error.message
    });
  }
});

/**
 * Create new classroom
 */
router.post('/classrooms', async (req, res) => {
  try {
    const classroomData = {
      id: uuidv4(),
      ...req.body
    };

    const classroom = new Classroom(classroomData);
    await classroom.save();

    res.status(201).json({
      message: 'Classroom created successfully',
      classroom
    });

  } catch (error) {
    console.error('Error creating classroom:', error);
    res.status(500).json({
      error: 'Failed to create classroom',
      message: error.message
    });
  }
});

/**
 * Update classroom
 */
router.put('/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({
        error: 'Classroom not found'
      });
    }

    res.json({
      message: 'Classroom updated successfully',
      classroom
    });

  } catch (error) {
    console.error('Error updating classroom:', error);
    res.status(500).json({
      error: 'Failed to update classroom',
      message: error.message
    });
  }
});

/**
 * Delete classroom
 */
router.delete('/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const classroom = await Classroom.findOneAndDelete({ id });
    if (!classroom) {
      return res.status(404).json({
        error: 'Classroom not found'
      });
    }

    res.json({
      message: 'Classroom deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting classroom:', error);
    res.status(500).json({
      error: 'Failed to delete classroom',
      message: error.message
    });
  }
});

/**
 * Bulk import classrooms
 */
router.post('/classrooms/bulk-import', async (req, res) => {
  try {
    const { classrooms } = req.body;
    
    if (!Array.isArray(classrooms) || classrooms.length === 0) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Classrooms array is required and must not be empty'
      });
    }

    const classroomsWithIds = classrooms.map(classroom => ({
      id: classroom.id || uuidv4(),
      ...classroom
    }));

    const result = await Classroom.insertMany(classroomsWithIds, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${result.length} classrooms`,
      imported: result.length,
      total: classrooms.length
    });

  } catch (error) {
    console.error('Error importing classrooms:', error);
    res.status(500).json({
      error: 'Failed to import classrooms',
      message: error.message
    });
  }
});

// ==================== COURSES ====================

/**
 * Get all courses
 */
router.get('/courses', async (req, res) => {
  try {
    const { page = 1, limit = 50, department, program, year, semester, isActive = true } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (program) filter.program = program;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const courses = await Course.find(filter)
      .sort({ program: 1, year: 1, semester: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      error: 'Failed to fetch courses',
      message: error.message
    });
  }
});

/**
 * Create new course
 */
router.post('/courses', async (req, res) => {
  try {
    const courseData = {
      id: uuidv4(),
      ...req.body
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        error: 'Duplicate entry',
        message: 'A course with this code already exists'
      });
    } else {
      res.status(500).json({
        error: 'Failed to create course',
        message: error.message
      });
    }
  }
});

/**
 * Update course
 */
router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    res.json({
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      error: 'Failed to update course',
      message: error.message
    });
  }
});

/**
 * Delete course
 */
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOneAndDelete({ id });
    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    res.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      error: 'Failed to delete course',
      message: error.message
    });
  }
});

/**
 * Bulk import courses
 */
router.post('/courses/bulk-import', async (req, res) => {
  try {
    const { courses } = req.body;
    
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Courses array is required and must not be empty'
      });
    }

    const coursesWithIds = courses.map(course => ({
      id: course.id || uuidv4(),
      ...course
    }));

    const result = await Course.insertMany(coursesWithIds, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${result.length} courses`,
      imported: result.length,
      total: courses.length
    });

  } catch (error) {
    console.error('Error importing courses:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        error: 'Duplicate entries found',
        message: 'Some courses with duplicate codes already exist'
      });
    } else {
      res.status(500).json({
        error: 'Failed to import courses',
        message: error.message
      });
    }
  }
});

// ==================== DATA VALIDATION ====================

/**
 * Validate all data for timetable generation
 */
router.get('/validate', async (req, res) => {
  try {
    const validation = {
      teachers: { status: 'unknown', count: 0, issues: [] },
      classrooms: { status: 'unknown', count: 0, issues: [] },
      courses: { status: 'unknown', count: 0, issues: [] },
      overall: { status: 'unknown', ready: false }
    };

    // Validate teachers
    const teachers = await Teacher.find({ isActive: true });
    validation.teachers.count = teachers.length;
    
    teachers.forEach((teacher, index) => {
      if (!teacher.subjects || teacher.subjects.length === 0) {
        validation.teachers.issues.push(`Teacher "${teacher.name}" has no subjects assigned`);
      }
      if (!teacher.email) {
        validation.teachers.issues.push(`Teacher "${teacher.name}" has no email address`);
      }
    });
    
    validation.teachers.status = validation.teachers.issues.length === 0 ? 'valid' : 'issues';

    // Validate classrooms
    const classrooms = await Classroom.find({ isActive: true });
    validation.classrooms.count = classrooms.length;
    
    classrooms.forEach((classroom, index) => {
      if (!classroom.capacity || classroom.capacity <= 0) {
        validation.classrooms.issues.push(`Classroom "${classroom.name}" has invalid capacity`);
      }
      if (!classroom.type) {
        validation.classrooms.issues.push(`Classroom "${classroom.name}" has no type specified`);
      }
    });
    
    validation.classrooms.status = validation.classrooms.issues.length === 0 ? 'valid' : 'issues';

    // Validate courses
    const courses = await Course.find({ isActive: true });
    validation.courses.count = courses.length;
    
    for (const course of courses) {
      if (!course.teacherId) {
        validation.courses.issues.push(`Course "${course.name}" has no teacher assigned`);
      } else {
        const teacher = await Teacher.findOne({ id: course.teacherId });
        if (!teacher) {
          validation.courses.issues.push(`Course "${course.name}" assigned to non-existent teacher`);
        }
      }
      
      if (!course.studentCount || course.studentCount <= 0) {
        validation.courses.issues.push(`Course "${course.name}" has invalid student count`);
      }
    }
    
    validation.courses.status = validation.courses.issues.length === 0 ? 'valid' : 'issues';

    // Overall validation
    const hasMinimumData = teachers.length >= 1 && classrooms.length >= 1 && courses.length >= 1;
    const hasNoIssues = validation.teachers.status === 'valid' && 
                       validation.classrooms.status === 'valid' && 
                       validation.courses.status === 'valid';
    
    validation.overall.ready = hasMinimumData && hasNoIssues;
    validation.overall.status = validation.overall.ready ? 'ready' : 'not_ready';

    res.json(validation);

  } catch (error) {
    console.error('Error validating data:', error);
    res.status(500).json({
      error: 'Failed to validate data',
      message: error.message
    });
  }
});

/**
 * Get data statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await Promise.all([
      Teacher.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: false }),
      Classroom.countDocuments({ isActive: true }),
      Classroom.countDocuments({ isActive: false }),
      Course.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: false }),
      Teacher.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      Classroom.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Course.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      teachers: {
        active: stats[0],
        inactive: stats[1],
        total: stats[0] + stats[1],
        byDepartment: stats[6]
      },
      classrooms: {
        active: stats[2],
        inactive: stats[3],
        total: stats[2] + stats[3],
        byType: stats[7]
      },
      courses: {
        active: stats[4],
        inactive: stats[5],
        total: stats[4] + stats[5],
        byDepartment: stats[8]
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

export default router;
