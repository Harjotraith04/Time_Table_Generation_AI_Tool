const { body, validationResult } = require('express-validator');

// Sample data that might be sent from the frontend
const sampleStudentData = {
  studentId: "ST001",
  personalInfo: {
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com",
    phone: "1234567890",
    gender: "Male"
  },
  academicInfo: {
    department: "Computer Science",
    program: "BE",
    year: 2,
    semester: 1,
    division: "A", 
    rollNumber: "CS001",
    admissionDate: "2023-08-15",
    academicYear: "2023-24"
  }
};

// Define the validation rules (same as in the route)
const validationRules = [
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
];

console.log('Sample student data:');
console.log(JSON.stringify(sampleStudentData, null, 2));

console.log('\nChecking required fields:');
console.log('studentId:', sampleStudentData.studentId);
console.log('firstName:', sampleStudentData.personalInfo?.firstName);
console.log('lastName:', sampleStudentData.personalInfo?.lastName);
console.log('email:', sampleStudentData.personalInfo?.email);
console.log('phone:', sampleStudentData.personalInfo?.phone);
console.log('department:', sampleStudentData.academicInfo?.department);
console.log('program:', sampleStudentData.academicInfo?.program);
console.log('year:', sampleStudentData.academicInfo?.year);
console.log('semester:', sampleStudentData.academicInfo?.semester);
console.log('division:', sampleStudentData.academicInfo?.division);
console.log('rollNumber:', sampleStudentData.academicInfo?.rollNumber);
console.log('admissionDate:', sampleStudentData.academicInfo?.admissionDate);
console.log('academicYear:', sampleStudentData.academicInfo?.academicYear);

// Check email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log('\nEmail validation:');
console.log('Email format valid:', emailRegex.test(sampleStudentData.personalInfo?.email));

// Check phone format
const phoneRegex = /^\d{10}$/;
console.log('Phone format valid:', phoneRegex.test(sampleStudentData.personalInfo?.phone));

// Check date format
console.log('Date format (ISO8601):', new Date(sampleStudentData.academicInfo?.admissionDate).toISOString());
