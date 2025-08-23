const mongoose = require('mongoose');
require('dotenv').config();

async function fixStudentIndexes() {
  try {
    // Connect to MongoDB using environment variable
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('students');

    // Get current indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index)}`);
    });

    // Check if there's an id_1 index
    const idIndex = indexes.find(index => index.name === 'id_1');
    if (idIndex) {
      console.log('\nFound problematic id_1 index. Dropping it...');
      await collection.dropIndex('id_1');
      console.log('Dropped id_1 index successfully');
    } else {
      console.log('\nNo id_1 index found');
    }

    // Remove any documents with null id field
    console.log('\nChecking for documents with null id field...');
    const docsWithNullId = await collection.find({ id: null }).toArray();
    console.log(`Found ${docsWithNullId.length} documents with null id field`);

    if (docsWithNullId.length > 0) {
      console.log('Removing id field from documents...');
      await collection.updateMany(
        { id: null }, 
        { $unset: { id: "" } }
      );
      console.log('Removed null id fields from documents');
    }

    // Check for documents without studentId
    console.log('\nChecking for documents without studentId...');
    const docsWithoutStudentId = await collection.find({ 
      $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: "" }
      ]
    }).toArray();
    
    console.log(`Found ${docsWithoutStudentId.length} documents without proper studentId`);
    
    if (docsWithoutStudentId.length > 0) {
      console.log('Documents without studentId:');
      docsWithoutStudentId.forEach((doc, index) => {
        console.log(`${index + 1}. _id: ${doc._id}, studentId: ${doc.studentId}`);
      });
      
      // You may want to either delete these or assign proper studentIds
      console.log('\nThese documents need manual attention. Consider:');
      console.log('1. Deleting them if they are invalid');
      console.log('2. Assigning proper studentIds if they are valid');
    }

    // Create proper indexes
    console.log('\nEnsuring proper indexes...');
    
    // Create studentId index if it doesn't exist
    try {
      await collection.createIndex({ studentId: 1 }, { unique: true });
      console.log('Created/ensured studentId unique index');
    } catch (error) {
      if (error.code === 85) {
        console.log('studentId index already exists');
      } else {
        console.log('Error creating studentId index:', error.message);
      }
    }

    // Create email index if it doesn't exist
    try {
      await collection.createIndex({ 'personalInfo.email': 1 }, { unique: true });
      console.log('Created/ensured email unique index');
    } catch (error) {
      if (error.code === 85) {
        console.log('Email index already exists');
      } else {
        console.log('Error creating email index:', error.message);
      }
    }

    console.log('\nFinal indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index)}`);
    });

    console.log('\nIndex fix completed successfully!');

  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixStudentIndexes();
