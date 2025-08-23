const mongoose = require('mongoose');
require('dotenv').config();

async function quickFix() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';
    console.log('Connecting to:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Step 1: Check for the problematic index
    console.log('\n📋 Checking current indexes...');
    const indexes = await collection.indexes();
    const indexNames = indexes.map(idx => idx.name);
    console.log('Current indexes:', indexNames);

    // Step 2: Drop the id_1 index if it exists
    if (indexNames.includes('id_1')) {
      console.log('\n🗑️  Dropping problematic id_1 index...');
      await collection.dropIndex('id_1');
      console.log('✅ Dropped id_1 index');
    } else {
      console.log('\n✅ No id_1 index found');
    }

    // Step 3: Remove documents with null id field
    console.log('\n🧹 Cleaning up documents with null id field...');
    const updateResult = await collection.updateMany(
      { id: null }, 
      { $unset: { id: "" } }
    );
    console.log(`✅ Cleaned ${updateResult.modifiedCount} documents`);

    // Step 4: Check for documents without proper studentId
    console.log('\n🔍 Checking for documents without proper studentId...');
    const count = await collection.countDocuments({
      $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: "" }
      ]
    });
    console.log(`Found ${count} documents without proper studentId`);

    if (count > 0) {
      console.log('\n⚠️  These documents need attention. You may want to:');
      console.log('   1. Delete them if they are invalid test data');
      console.log('   2. Assign proper studentIds manually');
      
      // Show a few examples
      const samples = await collection.find({
        $or: [
          { studentId: { $exists: false } },
          { studentId: null },
          { studentId: "" }
        ]
      }).limit(3).toArray();
      
      console.log('\n📄 Sample documents:');
      samples.forEach((doc, i) => {
        console.log(`   ${i + 1}. _id: ${doc._id}, studentId: ${doc.studentId}`);
      });
    }

    console.log('\n✅ Index cleanup completed!');
    console.log('\n💡 You should now be able to create students without the duplicate key error.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

quickFix();
