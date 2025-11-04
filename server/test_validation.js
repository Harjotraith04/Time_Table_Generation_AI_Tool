/**
 * Test script to diagnose validation issues
 * Run with: node test_validation.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const OptimizationEngine = require('./algorithms/OptimizationEngine');

async function testValidation() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator');
    console.log('✅ Connected to MongoDB\n');

    console.log('Fetching data...');
    const [teachers, classrooms, courses] = await Promise.all([
      Teacher.find({ status: 'active' }),
      Classroom.find({ status: 'available' }),
      Course.find({ isActive: true })
    ]);

    console.log('📊 Data Summary:');
    console.log(`  Teachers: ${teachers.length}`);
    console.log(`  Classrooms: ${classrooms.length}`);
    console.log(`  Courses: ${courses.length}\n`);

    if (teachers.length > 0) {
      console.log('📝 Sample Teacher Data:');
      const teacher = teachers[0];
      console.log(`  ID: ${teacher.id}`);
      console.log(`  Name: ${teacher.name}`);
      console.log(`  Subjects: ${JSON.stringify(teacher.subjects)}`);
      console.log(`  Availability: ${JSON.stringify(teacher.availability)}`);
      console.log(`  MaxHours: ${teacher.maxHoursPerWeek}\n`);
    }

    if (courses.length > 0) {
      console.log('📚 Sample Course Data:');
      const course = courses[0];
      console.log(`  ID: ${course.id}`);
      console.log(`  Name: ${course.name}`);
      console.log(`  Code: ${course.code}`);
      console.log(`  Assigned Teachers: ${JSON.stringify(course.assignedTeachers)}`);
      console.log(`  Sessions: ${JSON.stringify(course.sessions)}`);
      console.log(`  Total Hours/Week: ${course.totalHoursPerWeek}\n`);
    }

    console.log('Running validation...');
    const engine = new OptimizationEngine();
    const validation = engine.validateInputData(teachers, classrooms, courses);

    console.log('\n🔍 Validation Result:');
    console.log(`  Valid: ${validation.valid}`);
    console.log(`  Issues Found: ${validation.issues.length}\n`);

    if (validation.issues.length > 0) {
      console.log('⚠️  Validation Issues:');
      validation.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (validation.valid) {
      console.log('\n✅ Data is valid! Ready for optimization.');
    } else {
      console.log('\n❌ Data validation failed! Fix these issues before generating timetable.');
    }

    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testValidation();
