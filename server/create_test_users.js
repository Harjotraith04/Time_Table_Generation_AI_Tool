const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test password for all accounts
    const testPassword = 'Test@123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'John Smith',
        email: 'teacher1@college.edu',
        password: hashedPassword,
        role: 'faculty',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Sarah Johnson',
        email: 'teacher2@college.edu',
        password: hashedPassword,
        role: 'faculty',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Michael Brown',
        email: 'teacher3@college.edu',
        password: hashedPassword,
        role: 'faculty',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Alice Williams',
        email: 'student1@college.edu',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Bob Davis',
        email: 'student2@college.edu',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Carol Martinez',
        email: 'student3@college.edu',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'David Wilson',
        email: 'student4@college.edu',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isEmailVerified: true
      },
      {
        name: 'Emma Garcia',
        email: 'student5@college.edu',
        password: hashedPassword,
        role: 'student',
        isActive: true,
        isEmailVerified: true
      }
    ];
    
    console.log('\n=== Creating Test Users ===\n');
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          // Update existing user with new password
          existingUser.password = hashedPassword;
          existingUser.isActive = true;
          existingUser.isEmailVerified = true;
          await existingUser.save();
          console.log(`✓ Updated: ${userData.email} (${userData.role})`);
        } else {
          // Create new user
          const user = new User(userData);
          await user.save();
          console.log(`✓ Created: ${userData.email} (${userData.role})`);
        }
      } catch (error) {
        console.log(`✗ Error with ${userData.email}: ${error.message}`);
      }
    }
    
    console.log('\n=== Test Credentials ===\n');
    console.log('All accounts use the same password: Test@123\n');
    console.log('ADMIN ACCOUNTS:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: Test@123\n');
    
    console.log('TEACHER/FACULTY ACCOUNTS:');
    console.log('  Email: teacher1@college.edu | Password: Test@123');
    console.log('  Email: teacher2@college.edu | Password: Test@123');
    console.log('  Email: teacher3@college.edu | Password: Test@123\n');
    
    console.log('STUDENT ACCOUNTS:');
    console.log('  Email: student1@college.edu | Password: Test@123');
    console.log('  Email: student2@college.edu | Password: Test@123');
    console.log('  Email: student3@college.edu | Password: Test@123');
    console.log('  Email: student4@college.edu | Password: Test@123');
    console.log('  Email: student5@college.edu | Password: Test@123\n');
    
    // List all users in database
    const allUsers = await User.find({});
    console.log(`\n=== All Users in Database (${allUsers.length} total) ===\n`);
    allUsers.forEach(user => {
      console.log(`${user.role.toUpperCase().padEnd(8)} | ${user.email.padEnd(30)} | Active: ${user.isActive}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();
