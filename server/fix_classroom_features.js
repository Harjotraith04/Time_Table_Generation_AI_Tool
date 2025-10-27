const mongoose = require('mongoose');
const Classroom = require('./models/Classroom');
require('dotenv').config();

const validFeatures = [
  'Projector', 'Sound System', 'Air Conditioning', 'WiFi', 'Whiteboard',
  'Smart Board', 'Computers', 'Lab Equipment', 'Safety Equipment',
  'Ventilation', 'Storage', 'Stage', 'Microphone System'
];

const featureMapping = {
  'AC': 'Air Conditioning',
  'Microphone': 'Microphone System',
  'Camera': null, // Remove - not in valid list
  'High-Speed Internet': 'WiFi', // Map to WiFi
  'Video Conferencing': null, // Remove - not in valid list
  'Recording Equipment': null // Remove - not in valid list
};

async function fixClassroomFeatures() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator');
    console.log('Connected to MongoDB');

    // Find all classrooms
    const classrooms = await Classroom.find({});
    console.log(`\nFound ${classrooms.length} classrooms`);

    let fixed = 0;
    let alreadyValid = 0;
    let errors = 0;

    for (const classroom of classrooms) {
      let needsUpdate = false;
      const originalFeatures = [...classroom.features];
      const newFeatures = [];

      // Check each feature
      for (const feature of classroom.features) {
        if (validFeatures.includes(feature)) {
          // Valid feature - keep it
          newFeatures.push(feature);
        } else if (featureMapping[feature]) {
          // Map old feature to new one
          const mappedFeature = featureMapping[feature];
          if (!newFeatures.includes(mappedFeature)) {
            newFeatures.push(mappedFeature);
          }
          needsUpdate = true;
          console.log(`  Mapping "${feature}" → "${mappedFeature}" in classroom ${classroom.id}`);
        } else {
          // Invalid feature - skip it
          needsUpdate = true;
          console.log(`  Removing invalid feature "${feature}" from classroom ${classroom.id}`);
        }
      }

      if (needsUpdate) {
        try {
          classroom.features = newFeatures;
          await classroom.save();
          console.log(`✓ Fixed classroom ${classroom.id}: ${originalFeatures.join(', ')} → ${newFeatures.join(', ')}`);
          fixed++;
        } catch (error) {
          console.error(`✗ Error fixing classroom ${classroom.id}:`, error.message);
          errors++;
        }
      } else {
        alreadyValid++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total classrooms: ${classrooms.length}`);
    console.log(`Already valid: ${alreadyValid}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Errors: ${errors}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the fix
fixClassroomFeatures();
