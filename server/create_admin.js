const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@example.com');
      process.exit(0);
    }
    
    // Create admin user
    const adminUser = new User({
      name: 'Administrator',
      email: 'admin@example.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin',
      department: 'Administration'
    });
    
    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
