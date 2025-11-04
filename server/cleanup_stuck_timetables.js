const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
require('dotenv').config();

async function cleanupStuckTimetables() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    // Find all timetables with status 'generating'
    const stuckTimetables = await Timetable.find({ status: 'generating' });

    console.log(`Found ${stuckTimetables.length} stuck timetables\n`);

    if (stuckTimetables.length > 0) {
      // Update all to 'draft' status with error message
      const result = await Timetable.updateMany(
        { status: 'generating' },
        { 
          $set: { 
            status: 'draft',
            conflicts: [{
              type: 'system_error',
              severity: 'critical',
              description: 'Generation timed out or failed to complete. Please try again with the Greedy algorithm.'
            }]
          }
        }
      );

      console.log(`✓ Updated ${result.modifiedCount} timetables to 'draft' status\n`);

      // Show updated timetables
      const updated = await Timetable.find({ 
        _id: { $in: stuckTimetables.map(t => t._id) } 
      });

      for (const tt of updated) {
        console.log(`ID: ${tt._id}`);
        console.log(`Name: ${tt.name}`);
        console.log(`Status: ${tt.status} ✓`);
        console.log(`Department: ${tt.department}`);
        console.log('---\n');
      }

      console.log('✅ All stuck timetables have been cleaned up!');
      console.log('🎯 Please use the "Greedy" algorithm for generation - it\'s fast and reliable.\n');
    } else {
      console.log('✓ No stuck timetables found. Everything is clean!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

cleanupStuckTimetables();
