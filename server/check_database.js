const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabaseInfo() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to:', uri.replace(/:[^:]*@/, ':****@')); // Hide password
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    console.log('📊 Database name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    if (collections.length === 0) {
      console.log('   No collections found');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
    }
    
    // Check specifically for users collection
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`\n👤 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'email role isActive createdAt').lean();
      console.log('\n📋 User details:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Active: ${user.isActive} - Created: ${user.createdAt}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabaseInfo();
