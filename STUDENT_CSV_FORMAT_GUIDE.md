# Student CSV Upload Format Guide

This document explains the CSV format required for bulk student upload in the Timetable Generation System.

## CSV Template File

A sample CSV template file (`student_upload_template.csv`) is provided with example data. You can use this as a starting point for your student data.

## Required Fields

The following fields are **mandatory** and must be present in every row:

| Field Name | Description | Format/Example |
|------------|-------------|----------------|
| `studentId` | Unique student identifier | STU001, 2024CSE001 |
| `firstName` | Student's first name | John |
| `lastName` | Student's last name | Doe |
| `email` | Student's email (must be unique) | john.doe@example.com |
| `department` | Academic department | Computer Science |
| `program` | Academic program | B.Tech, M.Tech, BCA |
| `year` | Current year of study | 1, 2, 3, 4, 5 |
| `semester` | Current semester | 1, 2 |
| `division` | Class division | A, B, C |
| `rollNumber` | Roll number within division | 26, 01, 15 |
| `academicYear` | Academic year | 2024-2025 |

## Optional Fields

The following fields are optional but recommended:

### Personal Information
| Field Name | Description | Format/Example |
|------------|-------------|----------------|
| `phone` | 10-digit phone number | 9876543210 |
| `dateOfBirth` | Date of birth | 2005-05-15 (YYYY-MM-DD) |
| `gender` | Gender | Male, Female, Other |

### Address Information
| Field Name | Description | Example |
|------------|-------------|---------|
| `street` | Street address | 123 Main Street |
| `city` | City name | Mumbai |
| `state` | State/Province | Maharashtra |
| `zipCode` | Postal/ZIP code | 400001 |
| `country` | Country name (default: India) | India |

### Academic Information
| Field Name | Description | Format/Example |
|------------|-------------|----------------|
| `batch` | Lab/Tutorial batch | A1, B2, C1 |
| `admissionDate` | Date of admission | 2024-07-01 (YYYY-MM-DD) |
| `courses` | Enrolled course IDs (comma-separated) | CSE101,CSE102,CSE103 |

### Guardian Information
| Field Name | Description | Example |
|------------|-------------|---------|
| `guardianName` | Guardian's full name | Jane Doe |
| `guardianRelation` | Relationship | Mother, Father, Guardian |
| `guardianPhone` | Guardian's phone number | 9876543211 |
| `guardianEmail` | Guardian's email | jane.doe@example.com |

## Important Rules

### Email Format
- Must be a valid email format: `username@domain.com`
- Must be unique (no duplicate emails)
- Will be used for login credentials

### Phone Number Format
- Must be exactly 10 digits
- No spaces, dashes, or special characters
- Example: `9876543210`

### Date Format
- All dates must be in `YYYY-MM-DD` format
- Example: `2005-05-15` for May 15, 2005

### Year and Semester
- `year`: Integer between 1 and 5
- `semester`: Either 1 or 2

### Course IDs
- Multiple courses separated by commas **within quotes**
- Format: `"CSE101,CSE102,CSE103"`
- The entire comma-separated list must be enclosed in double quotes
- Leave empty if no courses to assign initially

## CSV File Requirements

1. **First row must be header row** with exact field names as shown above
2. **Encoding**: UTF-8
3. **Line endings**: Any (Windows CRLF or Unix LF)
4. **File extension**: `.csv`
5. **Maximum file size**: 5MB
6. **Empty fields**: Leave empty if optional field is not available (don't use "N/A" or "null")
7. **Fields with commas**: Enclose in double quotes (e.g., courses field)

## Example CSV Structure

```csv
studentId,firstName,lastName,email,phone,dateOfBirth,gender,department,program,year,semester,division,batch,rollNumber,academicYear,admissionDate,street,city,state,zipCode,country,guardianName,guardianRelation,guardianPhone,guardianEmail,courses
STU001,John,Doe,john.doe@example.com,9876543210,2005-05-15,Male,Computer Science,B.Tech,1,1,A,A1,26,2024-2025,2024-07-01,123 Main St,Mumbai,Maharashtra,400001,India,Jane Doe,Mother,9876543211,jane.doe@example.com,"CSE101,CSE102"
STU002,Jane,Smith,jane.smith@example.com,9876543220,2005-08-20,Female,Computer Science,B.Tech,1,1,A,A2,27,2024-2025,2024-07-01,456 Park Ave,Mumbai,Maharashtra,400002,India,Robert Smith,Father,9876543221,robert.smith@example.com,"CSE101,CSE102"
```

## What Happens After Upload

1. **Validation**: Each row is validated for:
   - Required fields presence
   - Email format and uniqueness
   - Phone number format (if provided)
   - Date formats
   - Year and semester values

2. **Student Creation**: For each valid row:
   - Student record is created in the database
   - User account is automatically created
   - Temporary password is generated

3. **Credential Distribution**: If enabled:
   - Welcome email is sent to each student
   - Email contains login credentials
   - Students are prompted to change password on first login

4. **Result Summary**: After upload, you'll see:
   - Number of students successfully created
   - Number of students failed
   - Details of any errors encountered
   - List of created user accounts

## Common Errors and Solutions

### "Email already exists"
- **Cause**: Email is already registered in the system
- **Solution**: Use a unique email address for each student

### "Phone must be 10 digits"
- **Cause**: Phone number is not exactly 10 digits
- **Solution**: Ensure phone numbers are exactly 10 digits (e.g., 9876543210)

### "Invalid email format"
- **Cause**: Email doesn't follow standard format
- **Solution**: Use format like `username@domain.com`

### "Required field missing"
- **Cause**: One or more required fields are empty
- **Solution**: Fill in all mandatory fields listed above

### "Year must be between 1 and 5"
- **Cause**: Year value is outside valid range
- **Solution**: Use values 1, 2, 3, 4, or 5

### "Semester must be 1 or 2"
- **Cause**: Semester value is not 1 or 2
- **Solution**: Use only 1 or 2 for semester

## Tips for Creating Your CSV

1. **Use Excel or Google Sheets**:
   - Open the template file
   - Replace sample data with your actual data
   - Save as CSV (UTF-8)

2. **Keep It Simple**:
   - Fill required fields first
   - Add optional fields as needed
   - Don't leave spaces after commas in course lists

3. **Test with Small Batch**:
   - Upload 2-3 students first
   - Verify everything works correctly
   - Then upload the full list

4. **Backup Your Data**:
   - Keep a copy of your original CSV file
   - Save the upload results for reference

## Support

If you encounter any issues with the CSV upload:
1. Check this guide for format requirements
2. Verify your CSV file against the template
3. Review error messages carefully
4. Contact system administrator if problems persist

## File Location

- **Template File**: `student_upload_template.csv` (in project root)
- **This Guide**: `STUDENT_CSV_FORMAT_GUIDE.md`

---

**Last Updated**: October 29, 2025
