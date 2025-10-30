const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
require('dotenv').config();

async function deleteStudent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const email = 'hardyysharma@gmail.com';
    
    // Find and delete student
    const student = await Student.findOne({ 'personalInfo.email': email });
    
    if (student) {
      console.log('\n=== Deleting Student ===');
      console.log(`Student ID: ${student.studentId}`);
      console.log(`Name: ${student.personalInfo.firstName} ${student.personalInfo.lastName}`);
      console.log(`Email: ${student.personalInfo.email}`);
      
      await Student.deleteOne({ 'personalInfo.email': email });
      console.log('✅ Student deleted from Student collection');
    } else {
      console.log('No student found with this email');
    }
    
    // Find and delete user
    const user = await User.findOne({ email: email });
    
    if (user) {
      console.log('\n=== Deleting User Account ===');
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
      
      await User.deleteOne({ email: email });
      console.log('✅ User deleted from User collection');
    } else {
      console.log('No user found with this email');
    }
    
    console.log('\n✅ Email hardyysharma@gmail.com is now free to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteStudent();
