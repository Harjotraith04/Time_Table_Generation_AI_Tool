const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
require('dotenv').config();

async function findStudentByEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const email = 'hardyysharma@gmail.com';
    
    // Check User collection
    const user = await User.findOne({ email: email });
    console.log('\n=== User Collection ===');
    if (user) {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      console.log(`Active: ${user.isActive}`);
    } else {
      console.log('No user found with this email');
    }
    
    // Check Student collection
    const student = await Student.findOne({ 'personalInfo.email': email });
    console.log('\n=== Student Collection ===');
    if (student) {
      console.log(`Student ID: ${student.studentId}`);
      console.log(`Name: ${student.personalInfo.firstName} ${student.personalInfo.lastName}`);
      console.log(`Email: ${student.personalInfo.email}`);
      console.log(`Roll Number: ${student.academicInfo.rollNumber}`);
      console.log(`Department: ${student.academicInfo.department}`);
      console.log(`Program: ${student.academicInfo.program}`);
      console.log(`Status: ${student.status}`);
    } else {
      console.log('No student found with this email in Student collection');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findStudentByEmail();
