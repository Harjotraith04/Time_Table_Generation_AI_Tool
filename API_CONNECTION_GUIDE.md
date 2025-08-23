# API Connection Guide - Timetable Generation System

## Overview
All frontend components are now fully connected to the backend API endpoints. The website is fully functional with complete CRUD operations, data validation, and real-time timetable generation.

**Authentication Model**: 
- Only administrators can register accounts through the registration page
- Teachers and students receive login credentials from administrators
- Hierarchical user management system with role-based access control

## Connected Features

### ✅ Authentication System
- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register` (Admin only)
- **Profile Management**: `GET /api/auth/profile`, `PUT /api/auth/profile`
- **Token Verification**: `GET /api/auth/verify-token`

### ✅ User Management System (Admin Only)
- **Create Users**: Admin creates teacher and student accounts
- **User Listing**: View all users with filtering by role and department
- **Account Deletion**: Remove teacher and student accounts
- **Credential Distribution**: Auto-generated login credentials for new users
- **Frontend**: `UserManagement.jsx` → Backend: `/api/auth/create-user`, `/api/auth/users/*`

### ✅ Teachers Data Management
- **CRUD Operations**: Create, Read, Update, Delete teachers
- **Bulk Import**: CSV file upload with validation
- **Export**: CSV export functionality
- **Real-time Loading**: Async data loading with error handling
- **Frontend**: `TeachersData.jsx` → Backend: `/api/data/teachers/*`

### ✅ Classrooms Data Management
- **CRUD Operations**: Create, Read, Update, Delete classrooms
- **Bulk Import**: CSV file upload with validation
- **Export**: CSV export functionality
- **Real-time Loading**: Async data loading with error handling
- **Frontend**: `ClassroomsData.jsx` → Backend: `/api/data/classrooms/*`

### ✅ Courses/Programs Data Management
- **CRUD Operations**: Create, Read, Update, Delete courses
- **Bulk Import**: CSV file upload with validation
- **Export**: CSV export functionality
- **Teacher Assignment**: Link courses to teachers
- **Frontend**: Data components → Backend: `/api/data/courses/*`

### ✅ Timetable Generation
- **Algorithm Selection**: Multiple algorithms (Genetic, CSP, Hybrid)
- **Real-time Progress**: WebSocket connection for generation status
- **Settings Configuration**: Advanced algorithm parameters
- **Data Validation**: Pre-generation data checks
- **Frontend**: `GenerateTimetable.jsx` → Backend: `/api/timetables/*`

### ✅ Algorithm Management
- **Algorithm Information**: `GET /api/algorithm/algorithms`
- **Constraints**: `GET /api/algorithm/constraints`
- **Optimization Goals**: `GET /api/algorithm/optimization-goals`
- **Parameter Validation**: `POST /api/algorithm/validate-parameters`
- **Recommendations**: `POST /api/algorithm/recommend`

## API Endpoint Summary

### Authentication Endpoints
```
POST   /api/auth/login           - User login
POST   /api/auth/register        - Admin registration only
POST   /api/auth/logout          - User logout
GET    /api/auth/profile         - Get user profile
PUT    /api/auth/profile         - Update user profile
PUT    /api/auth/change-password - Change password
GET    /api/auth/verify-token    - Verify JWT token

# User Management (Admin Only)
POST   /api/auth/create-user     - Admin creates teacher/student accounts
GET    /api/auth/users          - Get all users (with filtering)
DELETE /api/auth/users/:id      - Delete user account
```

### Data Management Endpoints
```
# Teachers
GET    /api/data/teachers         - Get all teachers
POST   /api/data/teachers         - Create teacher
GET    /api/data/teachers/:id     - Get specific teacher
PUT    /api/data/teachers/:id     - Update teacher
DELETE /api/data/teachers/:id     - Delete teacher
POST   /api/data/teachers/bulk-import - CSV import
GET    /api/data/teachers/export  - CSV export

# Classrooms
GET    /api/data/classrooms       - Get all classrooms
POST   /api/data/classrooms       - Create classroom
PUT    /api/data/classrooms/:id   - Update classroom
DELETE /api/data/classrooms/:id   - Delete classroom
POST   /api/data/classrooms/bulk-import - CSV import
GET    /api/data/classrooms/export - CSV export

# Courses
GET    /api/data/courses          - Get all courses
POST   /api/data/courses          - Create course
PUT    /api/data/courses/:id      - Update course
DELETE /api/data/courses/:id      - Delete course
POST   /api/data/courses/bulk-import - CSV import
GET    /api/data/courses/export   - CSV export

# Data Validation
GET    /api/data/validate         - Validate all data
GET    /api/data/statistics       - Get data statistics
```

### Timetable Endpoints
```
POST   /api/timetables/generate   - Start generation
GET    /api/timetables/generate/:id/progress - Get progress
GET    /api/timetables            - Get all timetables
GET    /api/timetables/:id        - Get specific timetable
PATCH  /api/timetables/:id/status - Update status
DELETE /api/timetables/:id        - Delete timetable
POST   /api/timetables/:id/comments - Add comment
GET    /api/timetables/statistics/overview - Statistics
```

### Algorithm Endpoints
```
GET    /api/algorithm/algorithms  - Get available algorithms
GET    /api/algorithm/constraints - Get constraint types
GET    /api/algorithm/optimization-goals - Get optimization goals
POST   /api/algorithm/validate-parameters - Validate parameters
POST   /api/algorithm/recommend   - Get algorithm recommendations
```

## How to Run the Connected System

### 1. Server Setup
```bash
cd server
npm install
npm start
```
Server runs on: `http://localhost:8000`

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
Client runs on: `http://localhost:5173`

### 3. Database Setup
Make sure MongoDB is running and accessible. The server will connect to:
- Default: `mongodb://localhost:27017/timetable_generator`
- Or set `MONGODB_URI` environment variable

### 4. Environment Variables
Create `.env` file in server directory:
```
MONGODB_URI=mongodb://localhost:27017/timetable_generator
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
PORT=8000
```

## Testing the Connection

### 1. Authentication Test
1. Open `http://localhost:5173`
2. Register a new user
3. Login with credentials
4. Verify profile access

### 2. Data Management Test
1. Navigate to Teachers Data
2. Add a new teacher
3. Verify data appears in real-time
4. Try CSV import/export
5. Repeat for Classrooms and Courses

### 3. Timetable Generation Test
1. Add sample data (teachers, classrooms, courses)
2. Navigate to Generate Timetable
3. Configure algorithm settings
4. Start generation
5. Monitor real-time progress
6. View generated timetable

## Key Improvements Made

1. **Real Data Loading**: Removed all hardcoded mock data
2. **Error Handling**: Added comprehensive error states and loading indicators
3. **API Integration**: Connected all frontend components to backend endpoints
4. **File Operations**: Working CSV import/export functionality
5. **Real-time Updates**: Live data refresh after CRUD operations
6. **Validation**: Server-side data validation with client feedback
7. **Authentication**: Secure API access with JWT tokens
8. **Progress Tracking**: Real-time timetable generation monitoring

## Notes

- All endpoints require authentication (JWT token)
- File uploads support CSV format only
- Real-time updates use HTTP polling (every 2 seconds during generation)
- All CRUD operations immediately refresh data from server
- Comprehensive error handling with user-friendly messages
- Loading states prevent user confusion during data operations

The website is now fully functional with complete frontend-backend integration!
