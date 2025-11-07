const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'student', 'faculty'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestAccounts() {
  try {
    console.log('\n🔧 Creating test login accounts...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('test123', 10);

    // 1. Create/Update Student Account
    const studentEmail = 'student@test.com';
    let student = await User.findOne({ email: studentEmail });
    
    if (student) {
      student.password = hashedPassword;
      await student.save();
      console.log('✅ Updated existing student account');
    } else {
      student = await User.create({
        name: 'Test Student',
        email: studentEmail,
        password: hashedPassword,
        role: 'student'
      });
      console.log('✅ Created new student account');
    }

    // 2. Create/Update Faculty Account
    const facultyEmail = 'faculty@test.com';
    let faculty = await User.findOne({ email: facultyEmail });
    
    if (faculty) {
      faculty.password = hashedPassword;
      await faculty.save();
      console.log('✅ Updated existing faculty account');
    } else {
      faculty = await User.create({
        name: 'Test Faculty',
        email: facultyEmail,
        password: hashedPassword,
        role: 'faculty'
      });
      console.log('✅ Created new faculty account');
    }

    console.log('\n📋 Test Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('\n👨‍🎓 STUDENT ACCOUNT:');
    console.log('   Email:    student@test.com');
    console.log('   Password: test123');
    console.log('   Role:     student');
    
    console.log('\n👨‍🏫 FACULTY ACCOUNT:');
    console.log('   Email:    faculty@test.com');
    console.log('   Password: test123');
    console.log('   Role:     faculty');
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Test accounts ready! You can now login.\n');

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

createTestAccounts();
