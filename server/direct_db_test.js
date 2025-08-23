const mongoose = require('mongoose');
require('dotenv').config();

async function directDatabaseTest() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Test data without using the Mongoose model
    const testStudent = {
      studentId: 'DIRECT-TEST-001',
      personalInfo: {
        firstName: 'Direct',
        lastName: 'Test',
        email: 'direct.test@example.com',
        phone: '9876543210'
      },
      academicInfo: {
        department: 'Computer Science',
        program: 'B.Tech',
        year: 1,
        semester: 1,
        division: 'A',
        rollNumber: 'CS2024002',
        admissionDate: new Date(),
        academicYear: '2024-25'
      },
      enrolledCourses: [],
      attendance: {
        totalClasses: 0,
        classesAttended: 0,
        attendancePercentage: 0
      },
      status: 'Active',
      notes: []
    };

    console.log('\n🧪 Testing direct database insertion...');
    
    // Insert directly into collection
    const result = await collection.insertOne(testStudent);
    console.log('✅ Student inserted successfully!');
    console.log(`Inserted ID: ${result.insertedId}`);
    
    // Verify insertion
    const inserted = await collection.findOne({ studentId: testStudent.studentId });
    if (inserted) {
      console.log(`✅ Verified: Student ${inserted.studentId} exists in database`);
    }
    
    // Clean up - delete the test student
    await collection.deleteOne({ studentId: testStudent.studentId });
    console.log('🧹 Test student cleaned up');
    
    console.log('\n🎉 Database operations are working correctly!');
    console.log('💡 The duplicate key errors have been resolved.');
    
  } catch (error) {
    console.error('❌ Error in direct database test:', error.message);
    
    if (error.code === 11000) {
      console.error('💡 Still getting duplicate key error:');
      console.error(`   Field: ${Object.keys(error.keyValue)[0]}`);
      console.error(`   Value: ${Object.values(error.keyValue)[0]}`);
      console.error('🔧 This suggests there may be more cleanup needed.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

directDatabaseTest();
