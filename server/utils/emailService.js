const nodemailer = require('nodemailer');
const logger = require('./logger');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '', // Your email
    pass: process.env.SMTP_PASS || ''  // Your email password or app password
  }
};

// Create transporter
let transporter = null;

const initializeTransporter = () => {
  try {
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      transporter = nodemailer.createTransport(emailConfig);
      logger.info('Email transporter initialized successfully');
    } else {
      logger.warn('Email credentials not configured. Email functionality will be disabled.');
    }
  } catch (error) {
    logger.error('Failed to initialize email transporter:', error);
  }
};

// Initialize transporter on module load
initializeTransporter();

/**
 * Generate a secure random password
 * @param {number} length - Password length
 * @returns {string} Generated password
 */
const generateSecurePassword = (length = 8) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Send student credentials via email
 * @param {Object} studentData - Student information
 * @param {string} temporaryPassword - Generated temporary password
 * @returns {Promise<boolean>} Success status
 */
const sendStudentCredentials = async (studentData, temporaryPassword) => {
  if (!transporter) {
    logger.warn('Email transporter not configured. Skipping email send.');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Academic System" <${emailConfig.auth.user}>`,
      to: studentData.email,
      subject: 'Welcome to Academic System - Your Student Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 30px; }
            .credentials { background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Academic System</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${studentData.firstName} ${studentData.lastName},</h2>
              
              <p>Welcome to our Academic Management System! Your student account has been successfully created.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Student ID:</strong> ${studentData.studentId}</p>
                <p><strong>Email:</strong> ${studentData.email}</p>
                <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
                <p><strong>Roll Number:</strong> ${studentData.rollNumber}</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                  <li>This is a temporary password. Please change it immediately after your first login.</li>
                  <li>Never share your login credentials with anyone.</li>
                  <li>If you didn't request this account, please contact the administration immediately.</li>
                </ul>
              </div>
              
              <p><strong>Academic Information:</strong></p>
              <ul>
                <li>Department: ${studentData.department}</li>
                <li>Program: ${studentData.program}</li>
                <li>Year: ${studentData.year}</li>
                <li>Semester: ${studentData.semester}</li>
                <li>Division: ${studentData.division}</li>
                ${studentData.batch ? `<li>Batch: ${studentData.batch}</li>` : ''}
              </ul>
              
              <p>You can access the system using the login page. Once logged in, you will be able to:</p>
              <ul>
                <li>View your academic schedule and timetable</li>
                <li>Access course materials and announcements</li>
                <li>Update your profile information</li>
                <li>Check academic calendar and important dates</li>
              </ul>
              
              <a href="#" class="button">Login to Academic System</a>
              
              <p>If you have any questions or need assistance, please contact the academic office or your system administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>Academic Management System © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Credentials email sent successfully to ${studentData.email}`, { messageId: result.messageId });
    return true;

  } catch (error) {
    logger.error(`Failed to send credentials email to ${studentData.email}:`, error);
    return false;
  }
};

/**
 * Send teacher credentials via email
 * @param {Object} teacherData - Teacher information
 * @param {string} temporaryPassword - Generated temporary password
 * @returns {Promise<boolean>} Success status
 */
const sendTeacherCredentials = async (teacherData, temporaryPassword) => {
  if (!transporter) {
    logger.warn('Email transporter not configured. Skipping email send.');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Academic System" <${emailConfig.auth.user}>`,
      to: teacherData.email,
      subject: 'Welcome to Academic System - Your Faculty Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 30px; }
            .credentials { background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; color: #856404; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Academic System</h1>
              <p>Faculty Access Portal</p>
            </div>
            
            <div class="content">
              <h2>Dear ${teacherData.name},</h2>
              
              <p>Welcome to our Academic Management System! Your faculty account has been successfully created by the administration.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Faculty ID:</strong> ${teacherData.id}</p>
                <p><strong>Email:</strong> ${teacherData.email}</p>
                <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
                <p><strong>Department:</strong> ${teacherData.department}</p>
                <p><strong>Designation:</strong> ${teacherData.designation}</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul>
                  <li>This is a temporary password. Please change it immediately after your first login.</li>
                  <li>Never share your login credentials with anyone.</li>
                  <li>If you didn't request this account, please contact the administration immediately.</li>
                </ul>
              </div>
              
              <p><strong>Your Teaching Information:</strong></p>
              <ul>
                <li>Department: ${teacherData.department}</li>
                <li>Designation: ${teacherData.designation}</li>
                <li>Subjects: ${teacherData.subjects ? teacherData.subjects.join(', ') : 'To be assigned'}</li>
                <li>Max Weekly Hours: ${teacherData.maxHoursPerWeek || 'Not specified'}</li>
                ${teacherData.qualification ? `<li>Qualification: ${teacherData.qualification}</li>` : ''}
              </ul>
              
              <p>As a faculty member, you will be able to:</p>
              <ul>
                <li>View and manage your teaching schedule</li>
                <li>Access your assigned courses and student lists</li>
                <li>Update your profile and availability</li>
                <li>Receive timetable updates and notifications</li>
                <li>Manage course content and materials</li>
              </ul>
              
              <a href="#" class="button">Login to Faculty Portal</a>
              
              <p>If you have any questions or need technical support, please contact the IT department or system administrator.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>Academic Management System © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Faculty credentials email sent successfully to ${teacherData.email}`, { messageId: result.messageId });
    return true;

  } catch (error) {
    logger.error(`Failed to send faculty credentials email to ${teacherData.email}:`, error);
    return false;
  }
};

/**
 * Send password change confirmation email
 * @param {Object} userData - User information
 * @returns {Promise<boolean>} Success status
 */
const sendPasswordChangeConfirmation = async (userData) => {
  if (!transporter) {
    logger.warn('Email transporter not configured. Skipping email send.');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Academic System" <${emailConfig.auth.user}>`,
      to: userData.email,
      subject: 'Password Changed Successfully - Academic System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8fafc; padding: 30px; }
            .success { background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; color: #065f46; }
            .warning { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully</h1>
            </div>
            
            <div class="content">
              <h2>Hello ${userData.name},</h2>
              
              <div class="success">
                <h3>✅ Password Update Confirmed</h3>
                <p>Your password has been successfully changed on ${new Date().toLocaleString()}.</p>
              </div>
              
              <p><strong>Account Details:</strong></p>
              <ul>
                <li>Email: ${userData.email}</li>
                <li>Role: ${userData.role}</li>
                <li>Change Date: ${new Date().toLocaleString()}</li>
              </ul>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>If you did not make this change, please contact the system administrator immediately and change your password again.</p>
              </div>
              
              <p>Your account remains secure. You can continue using the system with your new password.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated security notification. Please do not reply to this email.</p>
              <p>Academic Management System © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Password change confirmation sent to ${userData.email}`, { messageId: result.messageId });
    return true;

  } catch (error) {
    logger.error(`Failed to send password change confirmation to ${userData.email}:`, error);
    return false;
  }
};

/**
 * Send bulk credentials summary to admin
 * @param {Array} createdAccounts - Array of created student accounts
 * @param {string} adminEmail - Admin email address
 * @returns {Promise<boolean>} Success status
 */
const sendBulkCreationSummary = async (createdAccounts, adminEmail) => {
  if (!transporter || !createdAccounts.length) {
    return false;
  }

  try {
    const credentialsList = createdAccounts.map(account => 
      `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${account.studentId}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${account.email}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${account.tempPassword}</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: `"Academic System" <${emailConfig.auth.user}>`,
      to: adminEmail,
      subject: `Bulk Student Account Creation Summary - ${createdAccounts.length} accounts created`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f3f4f6; padding: 12px; border: 1px solid #ddd; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
            .warning { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bulk Student Account Creation Summary</h1>
            </div>
            
            <div class="content">
              <p>Hello Administrator,</p>
              
              <p>A bulk student account creation operation has been completed successfully. Here are the details:</p>
              
              <p><strong>Summary:</strong></p>
              <ul>
                <li>Total accounts created: ${createdAccounts.length}</li>
                <li>Date: ${new Date().toLocaleDateString()}</li>
                <li>Time: ${new Date().toLocaleTimeString()}</li>
              </ul>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> The temporary passwords below are automatically generated. Please ensure students change them on first login.
              </div>
              
              <h3>Created Student Accounts:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Temporary Password</th>
                  </tr>
                </thead>
                <tbody>
                  ${credentialsList}
                </tbody>
              </table>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Individual welcome emails have been sent to each student</li>
                <li>Students should change their passwords on first login</li>
                <li>Monitor the system for any login issues or support requests</li>
              </ul>
              
              <p>This summary email is for administrative purposes only. Please keep this information secure.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Bulk creation summary email sent to admin: ${adminEmail}`, { messageId: result.messageId });
    return true;

  } catch (error) {
    logger.error(`Failed to send bulk creation summary email to ${adminEmail}:`, error);
    return false;
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} Success status
 */
const testEmailConfiguration = async () => {
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    logger.info('Email configuration test successful');
    return true;
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    return false;
  }
};

module.exports = {
  generateSecurePassword,
  sendStudentCredentials,
  sendTeacherCredentials,
  sendPasswordChangeConfirmation,
  sendBulkCreationSummary,
  testEmailConfiguration,
  isConfigured: () => !!transporter
};
