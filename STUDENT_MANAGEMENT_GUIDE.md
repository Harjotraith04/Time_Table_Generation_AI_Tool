# Student Management Features

## Overview
The Student Management system has been enhanced to support comprehensive student data management as part of the timetable creation process. This includes individual student registration, bulk imports, and automatic email notifications.

## New Features Added

### 1. Enhanced Student Model
- **Personal Information**: Name, email, phone, date of birth, gender, address
- **Academic Information**: Department, program, year, semester, division, batch, roll number, admission date
- **Guardian Information**: Name, relationship, contact details
- **Course Enrollment**: Track enrolled courses and enrollment status
- **Attendance Tracking**: Basic attendance percentage tracking

### 2. Student Management Interface
- **Location**: `/student-management`
- **Features**:
  - View all students with filtering and search
  - Add individual students with comprehensive form
  - Bulk student creation via CSV upload
  - Export student data to CSV
  - Real-time validation and error handling

### 3. Bulk Student Import
- **CSV Upload**: Upload student data via CSV files
- **Template**: Sample CSV provided with correct format
- **Validation**: Comprehensive data validation before import
- **Error Reporting**: Detailed error messages for failed imports

### 4. Email Integration
- **Automatic Credentials**: Send login credentials to new students
- **Admin Summary**: Bulk operation summaries sent to administrators
- **Welcome Emails**: Professional welcome emails with academic information
- **Security**: Temporary passwords with forced password change requirement

### 5. API Endpoints

#### Student Management
- `GET /api/data/students` - List students with filtering
- `POST /api/data/students` - Create individual student
- `POST /api/data/students/bulk-create` - Bulk create students
- `POST /api/data/students/upload` - CSV upload
- `GET /api/data/students/export` - Export to CSV
- `GET /api/data/students/stats` - Student statistics

## Usage Instructions

### Individual Student Creation
1. Navigate to Admin Dashboard
2. Click "Manage Students"
3. Click "Add Student"
4. Fill in the comprehensive form with:
   - Student ID and Roll Number
   - Personal Information (Name, Email, Phone, etc.)
   - Academic Information (Department, Program, Year, etc.)
   - Guardian Information (optional)
5. Submit to create student record

### Bulk Student Import
1. Prepare CSV file using the provided template format
2. Navigate to Student Management
3. Click "Bulk Add"
4. Upload CSV file
5. Choose whether to create user accounts and send credentials
6. Review results and handle any errors

### CSV Format Requirements
```csv
studentId,firstName,lastName,email,phone,dateOfBirth,gender,department,program,year,semester,division,batch,rollNumber,admissionDate,academicYear,guardianName,guardianPhone,guardianEmail,street,city,state,zipCode,country,courses
```

**Required Fields**:
- studentId, firstName, lastName, email
- department, program, year, semester, division, rollNumber
- academicYear, admissionDate

**Optional Fields**:
- phone, dateOfBirth, gender, batch
- Guardian information, address details, courses

### Email Configuration
To enable email functionality, configure the following environment variables in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**For Gmail**:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as SMTP_PASS

### Integration with Timetable Creation
The student management is now integrated into the timetable creation workflow:

1. **Step 1**: Basic Information (Year, Semester, Department, etc.)
2. **Step 2**: Teachers Data
3. **Step 3**: Students Data ← **NEW**
4. **Step 4**: Classrooms & Labs
5. **Step 5**: Programs & Courses
6. **Step 6**: Infrastructure & Policy

## Security Features

### Password Management
- Temporary passwords are automatically generated (8 characters)
- Students must change password on first login
- Passwords are securely hashed using bcrypt

### Email Security
- Professional email templates
- No sensitive information in plain text (except temporary passwords)
- Email delivery confirmation logging
- Admin summary emails for audit trail

### Data Validation
- Email format validation
- Phone number format validation (10 digits)
- Required field validation
- Duplicate prevention (student ID and email)

## Sample Data
A sample CSV file (`sample_students.csv`) has been created with example data showing the correct format for bulk imports.

## Troubleshooting

### Common Issues
1. **Email not sending**: Check SMTP configuration in environment variables
2. **CSV validation errors**: Ensure all required fields are present and properly formatted
3. **Duplicate students**: Check for existing student IDs or email addresses
4. **Invalid email format**: Ensure emails follow standard format (user@domain.com)

### Error Messages
- **"Student with this ID or email already exists"**: Use unique student IDs and emails
- **"CSV validation failed"**: Check CSV format and required fields
- **"Email configuration test failed"**: Verify SMTP settings

## Future Enhancements
- Student photo upload
- Academic transcript integration
- Parent/guardian portal access
- SMS notifications
- Integration with course management systems
- Attendance tracking improvements
