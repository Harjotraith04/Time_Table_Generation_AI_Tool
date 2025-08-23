const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');

async function testStudentCreation() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Test data
    const testStudent = {
      studentId: 'TEST-2024-001',
      personalInfo: {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test.student@example.com',
        phone: '1234567890'
      },
      academicInfo: {
        department: 'Computer Science',
        program: 'B.Tech',
        year: 1,
        semester: 1,
        division: 'A',
        rollNumber: 'CS2024001',
        admissionDate: new Date(),
        academicYear: '2024-25'
      }
    };

    console.log('\n🧪 Testing student creation...');
    
    // Try to create a student
    const student = new Student(testStudent);
    await student.save();
    
    console.log('✅ Student created successfully!');
    console.log(`Student ID: ${student.studentId}`);
    console.log(`Student Name: ${student.personalInfo.firstName} ${student.personalInfo.lastName}`);
    
    // Clean up - delete the test student
    await Student.deleteOne({ studentId: testStudent.studentId });
    console.log('🧹 Test student cleaned up');
    
    console.log('\n🎉 The duplicate key error has been fixed!');
    
  } catch (error) {
    console.error('❌ Error testing student creation:', error.message);
    
    if (error.code === 11000) {
      console.error('💡 This is still a duplicate key error. The fix may not have worked completely.');
      console.error('🔧 You may need to manually run the MongoDB commands or check for other duplicate data.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testStudentCreation();
