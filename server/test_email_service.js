/**
 * Email Service Test Script
 * 
 * This script tests the email functionality of the mailing system.
 * Run this after configuring your email settings in .env
 */

const mongoose = require('mongoose');
const emailService = require('./utils/emailService');
const User = require('./models/User');
require('dotenv').config();

// Test data
const testStudentData = {
  studentId: 'TEST001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'test-student@example.com',
  rollNumber: 'CS2024001',
  department: 'Computer Science',
  program: 'B.Tech',
  year: 2,
  semester: 1,
  division: 'A',
  batch: 'Morning'
};

const testTeacherData = {
  id: 'T001',
  name: 'Dr. Jane Smith',
  email: 'test-teacher@example.com',
  department: 'Computer Science',
  designation: 'Professor',
  subjects: ['Data Structures', 'Algorithms'],
  maxHoursPerWeek: 20,
  qualification: 'Ph.D. Computer Science'
};

const testUserData = {
  name: 'Test User',
  email: 'test-user@example.com',
  role: 'student'
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testEmailConfiguration() {
  console.log('\n🔧 Testing email configuration...');
  
  const isConfigured = emailService.isConfigured();
  console.log(`Email service configured: ${isConfigured ? '✅ Yes' : '❌ No'}`);
  
  if (!isConfigured) {
    console.log('❌ Email service not configured. Please check your .env file.');
    return false;
  }
  
  const testResult = await emailService.testEmailConfiguration();
  console.log(`SMTP connection test: ${testResult ? '✅ Success' : '❌ Failed'}`);
  
  return testResult;
}

async function testStudentCredentialsEmail() {
  console.log('\n📧 Testing student credentials email...');
  
  try {
    const tempPassword = emailService.generateSecurePassword(10);
    console.log(`Generated temporary password: ${tempPassword}`);
    
    const result = await emailService.sendStudentCredentials(testStudentData, tempPassword);
    console.log(`Student credentials email: ${result ? '✅ Sent successfully' : '❌ Failed to send'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error sending student credentials email:', error.message);
    return false;
  }
}

async function testTeacherCredentialsEmail() {
  console.log('\n📧 Testing teacher credentials email...');
  
  try {
    const tempPassword = emailService.generateSecurePassword(10);
    console.log(`Generated temporary password: ${tempPassword}`);
    
    const result = await emailService.sendTeacherCredentials(testTeacherData, tempPassword);
    console.log(`Teacher credentials email: ${result ? '✅ Sent successfully' : '❌ Failed to send'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error sending teacher credentials email:', error.message);
    return false;
  }
}

async function testPasswordChangeConfirmation() {
  console.log('\n📧 Testing password change confirmation email...');
  
  try {
    const result = await emailService.sendPasswordChangeConfirmation(testUserData);
    console.log(`Password change confirmation: ${result ? '✅ Sent successfully' : '❌ Failed to send'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error sending password change confirmation:', error.message);
    return false;
  }
}

async function testBulkCreationSummary() {
  console.log('\n📧 Testing bulk creation summary email...');
  
  try {
    const testAccounts = [
      {
        studentId: 'TEST001',
        email: 'test1@example.com',
        tempPassword: emailService.generateSecurePassword(8)
      },
      {
        studentId: 'TEST002',
        email: 'test2@example.com',
        tempPassword: emailService.generateSecurePassword(8)
      }
    ];
    
    const adminEmail = 'admin@example.com'; // Change this to your email for testing
    const result = await emailService.sendBulkCreationSummary(testAccounts, adminEmail);
    console.log(`Bulk creation summary: ${result ? '✅ Sent successfully' : '❌ Failed to send'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Error sending bulk creation summary:', error.message);
    return false;
  }
}

async function testPasswordGeneration() {
  console.log('\n🔐 Testing password generation...');
  
  try {
    const passwords = [];
    for (let i = 0; i < 5; i++) {
      passwords.push(emailService.generateSecurePassword(10));
    }
    
    console.log('Generated passwords:');
    passwords.forEach((pwd, index) => {
      console.log(`  ${index + 1}. ${pwd}`);
    });
    
    // Check uniqueness
    const uniquePasswords = new Set(passwords);
    console.log(`Uniqueness check: ${uniquePasswords.size === passwords.length ? '✅ All unique' : '❌ Duplicates found'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing password generation:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Email Service Tests\n');
  console.log('Make sure you have configured your .env file with email settings');
  console.log('Update the test email addresses in this script to your actual email addresses\n');
  
  const results = {
    configuration: false,
    passwordGeneration: false,
    studentEmail: false,
    teacherEmail: false,
    passwordChangeEmail: false,
    bulkSummaryEmail: false
  };
  
  // Connect to database
  await connectDB();
  
  // Run tests
  results.configuration = await testEmailConfiguration();
  results.passwordGeneration = await testPasswordGeneration();
  
  if (results.configuration) {
    results.studentEmail = await testStudentCredentialsEmail();
    results.teacherEmail = await testTeacherCredentialsEmail();
    results.passwordChangeEmail = await testPasswordChangeConfirmation();
    results.bulkSummaryEmail = await testBulkCreationSummary();
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${testName}: ${status}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Your mailing system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check your configuration and try again.');
  }
  
  // Disconnect from database
  await mongoose.disconnect();
  console.log('\n✅ Disconnected from MongoDB');
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🔄 Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  testEmailConfiguration,
  testStudentCredentialsEmail,
  testTeacherCredentialsEmail,
  testPasswordChangeConfirmation,
  testBulkCreationSummary,
  runAllTests
};
