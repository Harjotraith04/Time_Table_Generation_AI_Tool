const mongoose = require('mongoose');
require('dotenv').config();

async function comprehensiveFix() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Step 1: Check all current indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Step 2: Drop problematic indexes
    const problematicIndexes = ['id_1', 'email_1'];
    for (const indexName of problematicIndexes) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped ${indexName} index`);
      } catch (error) {
        if (error.codeName === 'IndexNotFound') {
          console.log(`ℹ️  ${indexName} index not found (already removed)`);
        } else {
          console.log(`⚠️  Error dropping ${indexName}: ${error.message}`);
        }
      }
    }

    // Step 3: Clean up documents with null values
    console.log('\n🧹 Cleaning up documents...');
    
    // Remove null id fields
    const idCleanup = await collection.updateMany(
      { id: null }, 
      { $unset: { id: "" } }
    );
    console.log(`   Removed 'id' field from ${idCleanup.modifiedCount} documents`);

    // Remove null email fields
    const emailCleanup = await collection.updateMany(
      { email: null }, 
      { $unset: { email: "" } }
    );
    console.log(`   Removed 'email' field from ${emailCleanup.modifiedCount} documents`);

    // Remove documents with null personalInfo.email
    const personalEmailCleanup = await collection.updateMany(
      { 'personalInfo.email': null }, 
      { $unset: { 'personalInfo.email': "" } }
    );
    console.log(`   Removed null 'personalInfo.email' from ${personalEmailCleanup.modifiedCount} documents`);

    // Step 4: Check for documents without required fields
    console.log('\n🔍 Checking for documents with missing required fields...');
    
    const invalidDocs = await collection.find({
      $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: "" },
        { 'personalInfo.email': { $exists: false } },
        { 'personalInfo.email': null },
        { 'personalInfo.email': "" }
      ]
    }).toArray();

    console.log(`Found ${invalidDocs.length} documents with missing required fields`);
    
    if (invalidDocs.length > 0) {
      console.log('\n📄 Invalid documents (first 5):');
      invalidDocs.slice(0, 5).forEach((doc, i) => {
        console.log(`   ${i + 1}. _id: ${doc._id}`);
        console.log(`      studentId: ${doc.studentId}`);
        console.log(`      email: ${doc.personalInfo?.email}`);
      });
      
      console.log('\n⚠️  Options for handling invalid documents:');
      console.log('   1. Delete them (recommended if they are test data)');
      console.log('   2. Fix them manually');
      
      // Optionally delete invalid documents (uncomment if you want to auto-delete)
      // const deleteResult = await collection.deleteMany({
      //   $or: [
      //     { studentId: { $exists: false } },
      //     { studentId: null },
      //     { studentId: "" },
      //     { 'personalInfo.email': { $exists: false } },
      //     { 'personalInfo.email': null },
      //     { 'personalInfo.email': "" }
      //   ]
      // });
      // console.log(`🗑️  Deleted ${deleteResult.deletedCount} invalid documents`);
    }

    // Step 5: Recreate proper indexes
    console.log('\n🔧 Creating proper indexes...');
    
    try {
      await collection.createIndex({ studentId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created unique index on studentId');
    } catch (error) {
      console.log(`⚠️  studentId index: ${error.message}`);
    }

    try {
      await collection.createIndex({ 'personalInfo.email': 1 }, { unique: true, sparse: true });
      console.log('✅ Created unique index on personalInfo.email');
    } catch (error) {
      console.log(`⚠️  email index: ${error.message}`);
    }

    // Step 6: Final verification
    console.log('\n📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`   ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ Comprehensive fix completed!');
    console.log('💡 You should now be able to create students without duplicate key errors.');
    
  } catch (error) {
    console.error('❌ Error during fix:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

comprehensiveFix();
