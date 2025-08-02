# Login System Documentation

## Overview
This application now includes a complete login system with two user types: **Admin** and **Student**. Each user type has access to different dashboards with role-specific features.

## Features

### Authentication System
- **Dummy Authentication**: Currently accepts any email/password combination
- **User Type Selection**: Choose between Admin and Student roles during login
- **Session Management**: User sessions are stored in localStorage
- **Protected Routes**: Users can only access their designated dashboard

### Admin Dashboard
- **Overview**: Statistics, recent timetables, and notifications
- **Timetable Management**: Create, edit, and manage timetables
- **User Management**: View and manage students and teachers
- **Analytics**: Conflict tracking and room utilization

### Student Dashboard
- **Weekly Timetable**: View current week's class schedule
- **Course Management**: Track courses, grades, and progress
- **Assignments**: View upcoming assignments and due dates
- **Notifications**: Important updates and announcements

## How to Use

### 1. Access the Application
- Navigate to the landing page
- Click "Sign In" or "Start Creating Timetables"

### 2. Login Process
- Select your user type: **Admin** or **Student**
- Enter any email address (e.g., `admin@example.com`)
- Enter any password (e.g., `password123`)
- Click "Sign In"

### 3. Dashboard Access
- **Admin users** will be redirected to `/admin-dashboard`
- **Student users** will be redirected to `/student-dashboard`

### 4. Demo Credentials
The system accepts any email/password combination:
- **Email**: `any@email.com`
- **Password**: `any password`
- **User Type**: Select Admin or Student

## File Structure

```
src/
├── context/
│   └── AuthContext.jsx          # Authentication context
├── pages/
│   ├── Landing.jsx              # Landing page
│   ├── Login.jsx                # Login page
│   ├── AdminDashboard.jsx       # Admin dashboard
│   └── StudentDashboard.jsx     # Student dashboard
└── App.jsx                      # Main app with routing
```

## Technical Details

### Authentication Flow
1. User selects user type (Admin/Student)
2. User enters email and password
3. System validates input (currently accepts any input)
4. User data is stored in localStorage
5. User is redirected to appropriate dashboard

### Protected Routes
- `/admin-dashboard`: Only accessible by admin users
- `/student-dashboard`: Only accessible by student users
- Unauthorized access redirects to login page

### Session Management
- User data persists across browser sessions
- Logout clears session data
- Automatic session restoration on page reload

## Future Enhancements
- **OAuth Integration**: Google, Microsoft, or other OAuth providers
- **Backend API**: Real authentication with database
- **Password Security**: Proper password hashing and validation
- **Role-based Permissions**: More granular access control
- **Multi-factor Authentication**: Additional security layers

## Development Notes
- The current system uses dummy authentication for demonstration
- All user data is stored in localStorage (not secure for production)
- Dashboard data is hardcoded for demonstration purposes
- Ready for backend integration when needed 