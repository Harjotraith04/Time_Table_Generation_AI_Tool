const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const Timetable = require('./models/Timetable');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';

async function clearAllData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️ Starting to clear all data...\n');

    // Clear all collections
    const collections = [
      { model: User, name: 'Users' },
      { model: Teacher, name: 'Teachers' },
      { model: Student, name: 'Students' },
      { model: Classroom, name: 'Classrooms' },
      { model: Course, name: 'Courses' },
      { model: Timetable, name: 'Timetables' }
    ];

    for (const collection of collections) {
      try {
        const result = await collection.model.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} ${collection.name}`);
      } catch (error) {
        console.log(`❌ Error deleting ${collection.name}:`, error.message);
      }
    }

    console.log('\n🎉 All data cleared successfully!');
    console.log('📝 Note: Database structure and indexes are preserved');

    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

// Run the function
clearAllData();