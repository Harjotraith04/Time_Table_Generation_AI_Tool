const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`Users found: ${users.length}`);
    
    if (users.length === 0) {
      console.log('No users found in the database');
    } else {
      users.forEach(user => {
        console.log(`- Email: ${user.email} | Role: ${user.role} | Active: ${user.isActive}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
