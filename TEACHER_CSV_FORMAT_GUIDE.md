# Teacher CSV Upload Format Guide

This document explains the CSV format required for bulk teacher upload in the Timetable Generation System.

## CSV Template File

A sample CSV template file (`teacher_upload_template.csv`) is provided with example data. You can use this as a starting point for your teacher data.

## Required Fields

The following fields are **mandatory** and must be present in every row:

| Field Name | Description | Format/Example |
|------------|-------------|----------------|
| `id` | Unique teacher identifier | T001, TCH001, 2024CS001 |
| `name` | Teacher's full name | Dr. John Smith |
| `email` | Teacher's email (must be unique) | john.smith@example.com |
| `department` | Academic department | Computer Science |
| `designation` | Academic designation | Professor, Associate Professor, etc. |
| `subjects` | Subjects taught (comma-separated, quoted) | "Data Structures,Algorithms" |

## Optional Fields

The following fields are optional but recommended:

| Field Name | Description | Format/Example |
|------------|-------------|----------------|
| `phone` | Phone number | 9876543210 |
| `qualification` | Educational qualification | Ph.D. in Computer Science |
| `experience` | Years of experience | 15 years, 10+ years |
| `maxHoursPerWeek` | Maximum teaching hours per week | 20 (default), range: 1-40 |
| `priority` | Faculty priority level | low, medium, high |
| `status` | Current employment status | active, inactive, on_leave |

## Field Specifications

### Teacher ID (`id`)
- Must be unique across all teachers
- Alphanumeric characters allowed
- Example: T001, PROF_001, TCH2024_01

### Name (`name`)
- Full name of the teacher
- Can include titles (Dr., Prof., etc.)
- Example: Dr. John Smith, Prof. Sarah Johnson

### Email (`email`)
- Must be a valid email format: `username@domain.com`
- Must be unique (no duplicate emails)
- Will be used for login credentials
- Example: john.smith@university.edu

### Department (`department`)
- Academic department name
- Should match existing departments in the system
- Example: Computer Science, Mathematics, Physics

### Designation (`designation`)
- Must be one of the following:
  - `Professor`
  - `Associate Professor`
  - `Assistant Professor`
  - `Lecturer`
  - `Teaching Assistant`

### Subjects (`subjects`)
- **IMPORTANT**: Must be enclosed in double quotes if containing commas
- Comma-separated list of subjects
- Format: `"Subject1,Subject2,Subject3"`
- Example: `"Data Structures,Algorithms,Programming"`

### Phone (`phone`)
- Phone number in international format
- Can start with + followed by country code
- Must start with 1-9 and contain only digits
- Example: 9876543210, +919876543210

### Qualification (`qualification`)
- Educational qualifications
- Can be detailed or abbreviated
- Example: Ph.D. in Computer Science, M.Tech, B.E.

### Experience (`experience`)
- Teaching or industry experience
- Free text format
- Example: 15 years, 10+ years, 5 years teaching

### Max Hours Per Week (`maxHoursPerWeek`)
- Number of hours teacher can teach per week
- Must be between 1 and 40
- Default: 20
- Example: 18, 20, 24

### Priority (`priority`)
- Teaching priority level
- Must be one of: `low`, `medium`, `high`
- Default: medium
- High priority teachers are preferred in scheduling

### Status (`status`)
- Current employment status
- Must be one of: `active`, `inactive`, `on_leave`
- Default: active
- Only active teachers appear in timetable generation

## CSV File Requirements

1. **First row must be header row** with exact field names as shown above
2. **Encoding**: UTF-8
3. **Line endings**: Any (Windows CRLF or Unix LF)
4. **File extension**: `.csv`
5. **Maximum file size**: 5MB
6. **Empty fields**: Leave empty if optional field is not available (don't use "N/A" or "null")
7. **Fields with commas**: Enclose in double quotes (especially subjects field)

## Example CSV Structure

```csv
id,name,email,phone,department,designation,qualification,experience,subjects,maxHoursPerWeek,priority,status
T001,Dr. John Smith,john.smith@example.com,9876543210,Computer Science,Professor,Ph.D. in Computer Science,15 years,"Data Structures,Algorithms,Programming",20,high,active
T002,Dr. Sarah Johnson,sarah.j@example.com,9876543220,Computer Science,Associate Professor,Ph.D. in Software Engineering,10 years,"Web Development,Database Systems",18,high,active
T003,Michael Brown,michael.b@example.com,9876543230,Electrical Engineering,Assistant Professor,M.Tech in Electronics,5 years,"Circuit Theory,Digital Electronics",20,medium,active
```

## User Account Creation

When teachers are uploaded via CSV:

1. **Automatic User Account**: A user account is created for each teacher with role 'faculty'
2. **Temporary Password**: A secure random password is generated
3. **Email Notification**: If "Send Credentials" is enabled, an email is sent with login details
4. **First Login**: Teachers must change their password on first login

## Email Credentials

If "Send Credentials via Email" is checked during upload:
- Each teacher receives an email at their provided email address
- Email contains: Teacher ID, email, temporary password, department, designation
- Password must be changed on first login for security

## Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Required column missing | Ensure all required fields have values |
| "Invalid email format" | Email doesn't match pattern | Use valid email: user@domain.com |
| "Teacher already exists" | Duplicate ID or email | Check for duplicates in your CSV |
| "Invalid designation" | Wrong designation value | Use only: Professor, Associate Professor, Assistant Professor, Lecturer, Teaching Assistant |
| "Email already exists in user accounts" | Email used by another user | Use a unique email address |
| "columns length is X, got Y" | Subjects not quoted | Wrap comma-separated subjects in quotes: "Subject1,Subject2" |

## Tips for Successful Upload

1. ✅ Use the provided template file as starting point
2. ✅ Verify all emails are unique before uploading
3. ✅ Quote the subjects field if it contains commas
4. ✅ Test with 1-2 records first before bulk upload
5. ✅ Keep a backup of your original data
6. ✅ Check "Send Credentials" to email login details to teachers

## After Upload

- Teachers will appear in the Teachers Management list
- User accounts are created with 'faculty' role
- Teachers can log in using their email and temporary password
- They will be prompted to change password on first login
- Teachers can be assigned to courses and scheduled in timetables

## Support

If you encounter issues during CSV upload:
- Check the error message for specific row numbers
- Verify your CSV matches the format exactly
- Ensure no special characters in required fields
- Contact system administrator for assistance
