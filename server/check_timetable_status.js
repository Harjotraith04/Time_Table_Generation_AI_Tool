const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
require('dotenv').config();

async function checkTimetableStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Find all timetables with status 'generating'
    const generatingTimetables = await Timetable.find({ status: 'generating' })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`Found ${generatingTimetables.length} timetables with status 'generating':\n`);

    for (const tt of generatingTimetables) {
      console.log(`ID: ${tt._id}`);
      console.log(`Name: ${tt.name}`);
      console.log(`Status: ${tt.status}`);
      console.log(`Created: ${tt.createdAt}`);
      console.log(`Department: ${tt.department}`);
      console.log(`Algorithm: ${tt.generationSettings?.algorithm}`);
      console.log(`Has Schedule: ${!!tt.schedule && tt.schedule.length > 0}`);
      console.log(`Schedule Length: ${tt.schedule?.length || 0}`);
      console.log('---\n');
    }

    // Find recent completed/draft timetables
    const recentTimetables = await Timetable.find({ status: { $ne: 'generating' } })
      .sort({ createdAt: -1 })
      .limit(3);

    console.log(`\nFound ${recentTimetables.length} recent non-generating timetables:\n`);

    for (const tt of recentTimetables) {
      console.log(`ID: ${tt._id}`);
      console.log(`Name: ${tt.name}`);
      console.log(`Status: ${tt.status}`);
      console.log(`Created: ${tt.createdAt}`);
      console.log(`Has Schedule: ${!!tt.schedule && tt.schedule.length > 0}`);
      console.log(`Schedule Length: ${tt.schedule?.length || 0}`);
      console.log('---\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

checkTimetableStatus();
