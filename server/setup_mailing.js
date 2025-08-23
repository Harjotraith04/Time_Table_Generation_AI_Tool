#!/usr/bin/env node

/**
 * Mailing System Setup and Testing Utility
 * 
 * This script helps set up and test the mailing system functionality
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEmailConfiguration() {
  console.log('🔧 Email Configuration Setup');
  console.log('=============================\n');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      return;
    }
  }
  
  console.log('Please provide your email configuration:\n');
  
  // Gather email configuration
  const emailEnabled = await question('Enable email functionality? (y/N): ');
  const enableEmail = emailEnabled.toLowerCase() === 'y';
  
  let smtpConfig = {};
  if (enableEmail) {
    console.log('\nChoose your email provider:');
    console.log('1. Gmail (recommended)');
    console.log('2. Outlook/Hotmail');
    console.log('3. Yahoo');
    console.log('4. Other/Custom');
    
    const provider = await question('Enter choice (1-4): ');
    
    switch (provider) {
      case '1':
        smtpConfig = {
          host: 'smtp.gmail.com',
          port: '587',
          secure: 'false'
        };
        console.log('\n📧 Gmail Setup Instructions:');
        console.log('1. Enable 2-Factor Authentication on your Google account');
        console.log('2. Go to Google Account Settings → Security');
        console.log('3. Navigate to 2-Step Verification → App passwords');
        console.log('4. Select "Mail" and your device');
        console.log('5. Copy the generated 16-character password\n');
        break;
      case '2':
        smtpConfig = {
          host: 'smtp-mail.outlook.com',
          port: '587',
          secure: 'false'
        };
        break;
      case '3':
        smtpConfig = {
          host: 'smtp.mail.yahoo.com',
          port: '587',
          secure: 'false'
        };
        break;
      case '4':
        smtpConfig.host = await question('SMTP Host: ');
        smtpConfig.port = await question('SMTP Port (default 587): ') || '587';
        smtpConfig.secure = await question('Use TLS? (y/N): ').then(ans => ans.toLowerCase() === 'y' ? 'true' : 'false');
        break;
      default:
        console.log('Invalid choice. Using Gmail settings.');
        smtpConfig = {
          host: 'smtp.gmail.com',
          port: '587',
          secure: 'false'
        };
    }
    
    smtpConfig.user = await question('Email address: ');
    smtpConfig.pass = await question('Email password (app password for Gmail): ');
    smtpConfig.fromEmail = await question('From email address (can be same as above): ') || smtpConfig.user;
  }
  
  // Database configuration
  const mongoUri = await question('MongoDB URI (default: mongodb://localhost:27017/timetable_generator): ') 
    || 'mongodb://localhost:27017/timetable_generator';
  
  // JWT configuration
  const jwtSecret = await question('JWT Secret (press Enter to generate random): ') 
    || require('crypto').randomBytes(64).toString('hex');
  
  // Client configuration
  const clientUrl = await question('Client URL (default: http://localhost:5173): ') 
    || 'http://localhost:5173';
  
  // Generate .env file
  const envContent = `# Timetable Generator Environment Configuration
# Generated on ${new Date().toISOString()}

# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
PORT=8000
HOST=localhost
NODE_ENV=development

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MONGODB_URI=${mongoUri}

# =============================================================================
# JWT AUTHENTICATION CONFIGURATION
# =============================================================================
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=24h

# =============================================================================
# CLIENT CONFIGURATION
# =============================================================================
CLIENT_URL=${clientUrl}
CORS_ORIGINS=${clientUrl},http://localhost:3000

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_ENABLED=${enableEmail}
${enableEmail ? `
SMTP_HOST=${smtpConfig.host}
SMTP_PORT=${smtpConfig.port}
SMTP_SECURE=${smtpConfig.secure}
SMTP_USER=${smtpConfig.user}
SMTP_PASS=${smtpConfig.pass}
FROM_EMAIL=${smtpConfig.fromEmail}
` : `
# Email disabled - configure the values below to enable
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# FROM_EMAIL=noreply@timetablegenerator.com
`}

# =============================================================================
# ADDITIONAL CONFIGURATION
# =============================================================================
LOG_LEVEL=info
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env file created successfully!');
  
  if (enableEmail) {
    console.log('\n📧 Email configuration completed.');
    console.log('You can test your email setup by running: npm run test-email');
  } else {
    console.log('\n📧 Email functionality is disabled.');
    console.log('You can enable it later by editing the .env file.');
  }
}

async function testEmailSetup() {
  console.log('📧 Testing Email Setup');
  console.log('======================\n');
  
  try {
    require('dotenv').config();
    const testScript = require('./test_email_service');
    await testScript.runAllTests();
  } catch (error) {
    console.error('❌ Error running email tests:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Configured your .env file');
    console.log('2. Installed all dependencies (npm install)');
    console.log('3. Started your MongoDB server');
  }
}

async function createAdminUser() {
  console.log('👤 Create Admin User');
  console.log('===================\n');
  
  try {
    require('dotenv').config();
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const name = await question('Admin name: ');
    const email = await question('Admin email: ');
    const password = await question('Admin password: ');
    const department = await question('Department (optional): ') || 'Administration';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User with this email already exists');
      return;
    }
    
    const admin = new User({
      name,
      email,
      password,
      role: 'admin',
      department,
      isFirstLogin: false,
      mustChangePassword: false
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

async function showSystemStatus() {
  console.log('📊 System Status');
  console.log('================\n');
  
  try {
    require('dotenv').config();
    
    // Check .env file
    const envExists = fs.existsSync(path.join(__dirname, '.env'));
    console.log(`Environment file: ${envExists ? '✅ Found' : '❌ Missing'}`);
    
    if (envExists) {
      const emailEnabled = process.env.EMAIL_ENABLED === 'true';
      console.log(`Email functionality: ${emailEnabled ? '✅ Enabled' : '❌ Disabled'}`);
      
      if (emailEnabled) {
        const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        console.log(`SMTP configuration: ${hasSmtpConfig ? '✅ Configured' : '❌ Incomplete'}`);
      }
    }
    
    // Check database connection
    try {
      const mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Database connection: ✅ Connected');
      
      // Check collections
      const User = require('./models/User');
      const Student = require('./models/Student');
      const Teacher = require('./models/Teacher');
      
      const userCount = await User.countDocuments();
      const studentCount = await Student.countDocuments();
      const teacherCount = await Teacher.countDocuments();
      
      console.log(`Users in database: ${userCount}`);
      console.log(`Students in database: ${studentCount}`);
      console.log(`Teachers in database: ${teacherCount}`);
      
      await mongoose.disconnect();
    } catch (dbError) {
      console.log('Database connection: ❌ Failed');
      console.log(`Error: ${dbError.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking system status:', error.message);
  }
}

async function main() {
  console.log('🚀 Timetable Generator - Mailing System Utility');
  console.log('================================================\n');
  
  console.log('Choose an option:');
  console.log('1. Setup email configuration');
  console.log('2. Test email setup');
  console.log('3. Create admin user');
  console.log('4. Show system status');
  console.log('5. Exit');
  
  const choice = await question('\nEnter your choice (1-5): ');
  
  switch (choice) {
    case '1':
      await setupEmailConfiguration();
      break;
    case '2':
      await testEmailSetup();
      break;
    case '3':
      await createAdminUser();
      break;
    case '4':
      await showSystemStatus();
      break;
    case '5':
      console.log('Goodbye! 👋');
      break;
    default:
      console.log('Invalid choice. Please run the script again.');
  }
  
  rl.close();
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🔄 Exiting...');
  rl.close();
  process.exit(0);
});

// Run the main function if script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script error:', error.message);
    rl.close();
    process.exit(1);
  });
}
