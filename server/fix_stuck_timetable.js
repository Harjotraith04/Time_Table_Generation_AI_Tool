const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');

const MONGODB_URI = 'mongodb+srv://Harjot:Harjot1234@tt.mtgy9tu.mongodb.net/timetable_generator?retryWrites=true&w=majority&appName=TT';

async function fixStuckTimetable() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    const timetableId = '69097adb7861faf4b491f305';
    
    console.log(`Checking timetable ${timetableId}...`);
    const timetable = await Timetable.findById(timetableId);
    
    if (!timetable) {
      console.log('✗ Timetable not found');
      process.exit(1);
    }

    console.log(`Current status: ${timetable.status}`);
    console.log(`Created at: ${timetable.createdAt}`);
    console.log(`Updated at: ${timetable.updatedAt}`);
    console.log(`Has schedule: ${!!timetable.schedule?.length}`);
    console.log(`Schedule entries: ${timetable.schedule?.length || 0}`);
    
    if (timetable.status === 'generating') {
      console.log('\n⚠️  Timetable is stuck in "generating" status');
      console.log('Updating to "draft" status...');
      
      timetable.status = 'draft';
      await timetable.save();
      
      console.log('✓ Status updated to "draft"');
    } else {
      console.log('\n✓ Timetable status is fine');
    }

    await mongoose.disconnect();
    console.log('\nConnection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixStuckTimetable();
