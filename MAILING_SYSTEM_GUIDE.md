# Mailing System Documentation

## Overview

The Time Table Generation AI Tool now includes a comprehensive mailing system that automatically sends login credentials to students and teachers when they are added to the system. This document explains how to set up and use the mailing system.

## Features

### 🔧 **Core Functionality**
- **Automatic Credential Sending**: When admins add students or teachers, login credentials are automatically generated and sent via email
- **Secure Password Generation**: Uses cryptographically secure random passwords
- **User Account Management**: Automatically creates user accounts with proper roles (student/faculty)
- **First Login Handling**: Forces password change on first login for security
- **Email Notifications**: Sends confirmation emails when passwords are changed

### 📧 **Email Types**
1. **Student Welcome Email**: Contains student ID, temporary password, and academic information
2. **Teacher Welcome Email**: Contains faculty ID, temporary password, and department information
3. **Password Change Confirmation**: Sent when users change their passwords
4. **Bulk Creation Summary**: Admin receives summary of all accounts created in bulk operations

### 🔐 **Security Features**
- Temporary passwords are generated with secure randomization
- Users must change password on first login
- Email confirmations for all password changes
- Secure password hashing with bcrypt
- JWT-based authentication

## Setup Instructions

### 1. Email Service Configuration

#### For Gmail (Recommended):
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Navigate to 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the 16-character password (without spaces)
3. Configure your `.env` file:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=noreply@yourdomain.com
```

#### For Other Email Providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure your email settings

3. Restart the server:
   ```bash
   npm run dev
   ```

### 3. Testing Email Configuration

You can test your email configuration using the server logs or by creating a test user and observing if emails are sent.

## API Usage

### Individual Student Creation

**POST** `/api/data/students`

Creates a student and automatically:
- Generates a user account
- Creates a secure temporary password
- Sends welcome email with credentials

```json
{
  "studentId": "2024001",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890"
  },
  "academicInfo": {
    "department": "Computer Science",
    "program": "B.Tech",
    "year": 2,
    "semester": 1,
    "division": "A",
    "rollNumber": "CS2024001",
    "admissionDate": "2024-08-01",
    "academicYear": "2024-25"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student created successfully and credentials sent via email",
  "data": {
    "student": { /* student object */ },
    "userAccount": {
      "id": "user_id",
      "email": "john.doe@example.com",
      "role": "student"
    },
    "emailSent": true
  }
}
```

### Individual Teacher Creation

**POST** `/api/data/teachers`

Creates a teacher and automatically:
- Generates a user account
- Creates a secure temporary password
- Sends welcome email with credentials

```json
{
  "id": "T001",
  "name": "Dr. Jane Smith",
  "email": "jane.smith@college.edu",
  "department": "Computer Science",
  "designation": "Professor",
  "phone": "9876543210",
  "qualification": "Ph.D. Computer Science",
  "subjects": ["Data Structures", "Algorithms"],
  "maxHoursPerWeek": 20
}
```

### Bulk Student Creation

**POST** `/api/data/students/bulk-create`

```json
{
  "sendCredentials": true,
  "students": [
    {
      "studentId": "2024001",
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "academicInfo": {
        "department": "Computer Science",
        "program": "B.Tech",
        "year": 2,
        "semester": 1,
        "division": "A",
        "rollNumber": "CS2024001",
        "academicYear": "2024-25"
      }
    }
    // ... more students
  ]
}
```

### Bulk Teacher Creation

**POST** `/api/data/teachers/bulk-create`

```json
{
  "sendCredentials": true,
  "teachers": [
    {
      "id": "T001",
      "name": "Dr. Jane Smith",
      "email": "jane.smith@college.edu",
      "department": "Computer Science",
      "designation": "Professor",
      "subjects": ["Data Structures", "Algorithms"],
      "maxHoursPerWeek": 20
    }
    // ... more teachers
  ]
}
```

## Password Management

### First-Time Login Process

1. **User receives email** with temporary credentials
2. **User logs in** with temporary password
3. **System detects first login** (`isFirstLogin: true`)
4. **User is prompted** to change password
5. **Password change is mandatory** before accessing other features

### Password Change Endpoints

#### Regular Password Change
**PUT** `/api/auth/change-password`

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

#### First-Time Password Change
**PUT** `/api/auth/first-time-password-change`

```json
{
  "newPassword": "new_secure_password",
  "confirmPassword": "new_secure_password"
}
```

*Note: This endpoint doesn't require the current password and is only available for users with `mustChangePassword: true`*

## Frontend Integration

### Login Response Handling

When users log in, check the response for password change requirements:

```javascript
const loginResponse = await api.post('/auth/login', credentials);

if (loginResponse.data.user.mustChangePassword || loginResponse.data.user.isFirstLogin) {
  // Redirect to password change page
  navigate('/change-password');
} else {
  // Proceed to dashboard
  navigate('/dashboard');
}
```

### Password Change Components

Create appropriate UI components to handle:
- First-time password change (no current password required)
- Regular password change (current password required)
- Password strength indicators
- Confirmation matching

## Database Schema Updates

### User Model Enhancements

The User model now includes:
```javascript
{
  isFirstLogin: { type: Boolean, default: true },
  mustChangePassword: { type: Boolean, default: false },
  passwordChangedAt: { type: Date },
  // ... existing fields
}
```

## Email Templates

### Student Welcome Email
- Academic information (department, program, year)
- Login credentials (student ID, email, temporary password)
- Security instructions
- Next steps guidance

### Teacher Welcome Email
- Professional information (department, designation)
- Login credentials (faculty ID, email, temporary password)
- Teaching information (subjects, max hours)
- Faculty portal access instructions

### Password Change Confirmation
- Confirmation of successful password change
- Security notice if change was unauthorized
- Account details and timestamp

## Security Considerations

### Password Security
- Passwords are hashed using bcrypt with salt rounds = 12
- Temporary passwords use cryptographically secure randomization
- Password change tracking with timestamps

### Email Security
- Uses TLS encryption for SMTP connections
- App passwords recommended over account passwords
- No sensitive information stored in logs

### Access Control
- Only admins can create student/teacher accounts
- Users can only change their own passwords
- Role-based access for different user types

## Troubleshooting

### Common Issues

#### Emails Not Sending
1. **Check email configuration** in `.env` file
2. **Verify SMTP credentials** are correct
3. **Check server logs** for detailed error messages
4. **Test with different email provider** if needed

#### Password Issues
1. **Temporary password not working**: Check email for correct password
2. **Forced password change**: Use `/first-time-password-change` endpoint
3. **Password requirements**: Ensure minimum 6 characters

#### User Account Issues
1. **Duplicate email error**: Email already exists in system
2. **Role mismatch**: Verify user role matches intended access level

### Log Monitoring

Monitor server logs for:
- Email sending success/failure
- User account creation
- Password change events
- Authentication attempts

## Production Deployment

### Security Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Use dedicated email service account
- [ ] Enable email rate limiting
- [ ] Set up email delivery monitoring
- [ ] Configure proper error handling
- [ ] Set up database backups
- [ ] Enable HTTPS in production

### Monitoring
- Set up alerts for failed email deliveries
- Monitor user account creation rates
- Track password change patterns
- Log security events

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify email service configuration
3. Test with minimal setup first
4. Contact system administrator for production issues

---

This mailing system ensures secure, automated credential distribution while maintaining high security standards and providing excellent user experience.
