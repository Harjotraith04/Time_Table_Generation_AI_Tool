const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetAllPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Default password for all accounts
    const defaultPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    console.log('\n=== Resetting All User Passwords ===\n');
    
    const allUsers = await User.find({});
    
    if (allUsers.length === 0) {
      console.log('No users found in database.');
      process.exit(0);
    }
    
    console.log(`Found ${allUsers.length} users. Resetting passwords...\n`);
    
    let updated = 0;
    let failed = 0;
    
    for (const user of allUsers) {
      try {
        user.password = hashedPassword;
        user.isActive = true;
        user.isEmailVerified = true;
        await user.save();
        console.log(`✓ Reset password for: ${user.email} (${user.role})`);
        updated++;
      } catch (error) {
        console.log(`✗ Failed for ${user.email}: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updated}`);
    console.log(`Failed: ${failed}`);
    console.log(`\n=== Login Credentials ===\n`);
    console.log('All accounts now use the password: Test@123\n');
    
    // Group users by role
    const admins = allUsers.filter(u => u.role === 'admin');
    const faculty = allUsers.filter(u => u.role === 'faculty');
    const students = allUsers.filter(u => u.role === 'student');
    
    if (admins.length > 0) {
      console.log('ADMIN ACCOUNTS:');
      admins.forEach(user => {
        console.log(`  Email: ${user.email} | Password: Test@123`);
      });
      console.log('');
    }
    
    if (faculty.length > 0) {
      console.log('TEACHER/FACULTY ACCOUNTS:');
      faculty.forEach(user => {
        console.log(`  Email: ${user.email} | Password: Test@123`);
      });
      console.log('');
    }
    
    if (students.length > 0) {
      console.log('STUDENT ACCOUNTS:');
      students.forEach(user => {
        console.log(`  Email: ${user.email} | Password: Test@123`);
      });
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAllPasswords();
