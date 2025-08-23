const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';

async function clearTeachers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all teachers
    const result = await Teacher.deleteMany({});
    console.log(`Deleted ${result.deletedCount} teachers`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error clearing teachers:', error);
    process.exit(1);
  }
}

clearTeachers();
