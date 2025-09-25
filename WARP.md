# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an AI-powered timetable generation system built with Node.js/Express backend and React frontend. The system uses genetic algorithms, constraint satisfaction problems (CSP), and other optimization techniques to automatically generate optimal class schedules for educational institutions.

**Technology Stack:**
- **Backend**: Node.js, Express, MongoDB with Mongoose
- **Frontend**: React 18 + Vite, Tailwind CSS, Material-UI
- **AI/Algorithms**: Custom Genetic Algorithm implementation, CSP Solver
- **Authentication**: JWT with role-based access (admin, faculty, student)
- **Real-time**: Socket.IO for live timetable generation progress
- **Email**: Nodemailer with automated credential distribution

## Development Commands

### Backend (Server)
```bash
cd server

# Development
npm run dev              # Start with nodemon (hot reload)
npm start               # Production start
npm test               # Run tests with Jest

# Database & Setup
npm run setup-mailing   # Configure email and create admin user
npm run test-email     # Test email configuration
npm run create-admin   # Create admin user

# Utilities
node check_database.js  # Verify database connection and collections
node check_users.js     # Check user accounts and roles
node create_admin.js    # Create admin user manually
```

### Frontend (Client)
```bash
cd client

# Development
npm run dev     # Start Vite dev server (usually port 3000 or 5173)
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # ESLint check
```

### Full Stack Development
```bash
# Terminal 1 (Backend)
cd server && npm run dev

# Terminal 2 (Frontend)
cd client && npm run dev
```

## Project Architecture

### Backend Architecture

**Core Components:**
- `server.js` - Express app with Socket.IO, middleware, and route setup
- `algorithms/` - AI optimization engines
  - `GeneticAlgorithm.js` - Main timetable optimization with population-based evolution
  - `CSPSolver.js` - Constraint satisfaction problem solver
  - `OptimizationEngine.js` - Orchestrates multiple algorithms
- `routes/` - API endpoints (auth, data, timetables, algorithms)
- `models/` - Mongoose schemas (User, Teacher, Student, Classroom, Course, Timetable)
- `utils/emailService.js` - Automated credential distribution system

**Key Features:**
- **Genetic Algorithm**: Uses population of 100+ candidates, tournament selection, crossover, mutation
- **Real-time Updates**: Socket.IO streams timetable generation progress
- **User Management**: Automated account creation with email delivery of credentials
- **Role-based Access**: admin, faculty, student with different permissions
- **Data Validation**: Express-validator for all input validation

### Frontend Architecture

**Structure:**
- `src/pages/` - Main application pages
- `src/components/` - Reusable UI components including auth components
- `src/context/` - React Context for auth and theme management
- **Routing**: React Router with protected routes based on user roles
- **State Management**: Context API for global state (auth, theme)

**Key Pages:**
- `AdminDashboard.jsx` - Main admin interface
- `CreateTimetable.jsx` - Timetable creation interface
- `TeachersManagement.jsx` - Teacher data management
- `StudentManagement.jsx` - Student data management
- `GenerateTimetable.jsx` - AI generation interface with real-time progress

### Database Schema Design

**Core Models:**
- **User** - Authentication (admin/faculty/student roles), password management
- **Teacher** - Faculty data, availability, constraints, preferences
- **Student** - Student records, academic info, program details  
- **Classroom** - Room capacity, features, availability
- **Course** - Subject info, sessions (theory/practical/tutorial), enrolled students
- **Timetable** - Generated schedules, fitness scores, generation metadata

**Critical Relationships:**
- Teachers ↔ Courses (many-to-many via assignedTeachers)
- Courses ↔ Students (enrollment tracking)
- Timetables contain Sessions (course + teacher + room + timeslot assignments)

### AI Algorithm Architecture

**Genetic Algorithm Flow:**
1. **Population Initialization** - Generate 100+ random timetable candidates
2. **Fitness Evaluation** - Multi-objective scoring:
   - Hard constraints (60%): teacher/room conflicts, capacity limits
   - Soft constraints (20%): teacher preferences, workload balance  
   - Optimization (20%): resource utilization, day distribution
3. **Selection** - Tournament selection for parent choosing
4. **Crossover** - Order crossover and uniform crossover strategies
5. **Mutation** - Swap, inversion, insertion operators
6. **Elitism** - Preserve best solutions across generations
7. **Convergence** - Auto-stop when optimal solution found

**Constraint Types:**
- **Hard**: Must be satisfied (teacher conflicts, room capacity, mandatory breaks)
- **Soft**: Optimized but not mandatory (preferences, workload balance)

## Important Implementation Details

### Authentication System
- **First-time Login Flow**: New users must change password on first login
- **Password Security**: bcrypt with salt rounds = 12, minimum 6 characters
- **Role-based Routing**: Different dashboards for admin/faculty/student
- **JWT Management**: Tokens for API authentication

### Email System Integration
- **Automatic Account Creation**: When teachers/students are added, user accounts are auto-created
- **Credential Distribution**: Professional welcome emails with login info
- **Security**: Temporary passwords with forced first-time change
- **Bulk Operations**: Support for bulk user creation with batch email sending

### Real-time Features
- **Socket.IO Integration**: Live progress updates during timetable generation
- **Progress Tracking**: Generation percentage, fitness scores, generation count
- **Room Management**: Clients join generation-specific rooms for updates

### File Upload System
- **CSV Import**: Bulk teacher/student data import via CSV files
- **Validation**: File type checking and data validation
- **Error Handling**: Comprehensive error reporting for failed imports

### Environment Configuration
Key environment variables:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing
- `SMTP_*` - Email configuration (Gmail app passwords supported)
- `CLIENT_URL` - Frontend URL for CORS

## Development Guidelines

### Working with the Genetic Algorithm
- **Fitness Function**: Located in `GeneticAlgorithm.js`, carefully tuned weights
- **Parameters**: Population size, mutation rate, crossover rate are configurable
- **Testing**: Use smaller datasets for algorithm testing (faster iterations)
- **Debugging**: Check `fitnessHistory` array for convergence analysis

### Database Operations
- **Connection**: Auto-connects via Mongoose, includes retry logic
- **Indexes**: Optimized for common queries (teacher.department, user.email)
- **Validation**: Mongoose schemas with comprehensive validation rules
- **Transactions**: Not currently used but can be added for multi-collection updates

### API Development Patterns
- **Validation**: All routes use express-validator middleware
- **Error Handling**: Centralized error middleware in server.js
- **Authentication**: All data routes require authentication via `authenticateToken`
- **Pagination**: Implemented on list endpoints (teachers, students)

### Frontend Development Patterns  
- **Protected Routes**: All authenticated pages wrapped in `ProtectedRoute` component
- **Context Usage**: Auth state managed globally via `AuthContext`
- **API Integration**: Axios for HTTP requests, centralized in services
- **Error Handling**: Try-catch blocks with user-friendly error messages

### Testing Strategy
- **Backend**: Jest for unit tests (existing structure in place)
- **Database**: Use test database for integration tests
- **Email**: Mock transporter for email testing
- **Frontend**: Testing setup ready in package.json but tests need implementation

## Common Development Tasks

### Adding New User Roles
1. Update `User.js` model enum
2. Modify `auth.js` routes for role-specific logic  
3. Update frontend `ProtectedRoute` component
4. Add role-specific dashboard pages

### Modifying the Genetic Algorithm
1. Key file: `server/algorithms/GeneticAlgorithm.js`
2. Fitness function is in `calculateFitness()` method
3. Crossover operations in `crossover()` method
4. Test with small datasets first

### Adding New Data Models
1. Create Mongoose schema in `models/`
2. Add CRUD routes in `routes/data.js`
3. Include validation middleware
4. Update frontend forms and API calls

### Email Template Customization
1. Templates are in `utils/emailService.js`
2. HTML email templates with inline CSS
3. Test templates with `npm run test-email`
4. Support for student and teacher welcome emails

## Security Considerations

- **Password Policy**: Enforced minimum length, complexity via validation
- **Rate Limiting**: Configured but disabled for development (can be re-enabled)
- **Input Validation**: All API inputs validated with express-validator
- **CORS**: Configured for specific frontend URLs only
- **Helmet**: Security headers enabled
- **Email Security**: App passwords for Gmail, TLS encryption

## Performance Notes

- **Database**: Indexes on frequently queried fields (email, department, status)
- **Algorithm**: Genetic algorithm can handle 100+ teachers, 200+ rooms, 500+ courses
- **Real-time**: Socket.IO namespaced to avoid unnecessary broadcasts
- **Frontend**: React.memo and useCallback used for optimization where needed

## Troubleshooting Common Issues

### Database Connection Issues
```bash
node server/check_database.js  # Verify MongoDB connection
```

### Email Configuration Problems  
```bash
npm run setup-mailing  # Interactive email setup
npm run test-email     # Test email functionality
```

### Authentication Issues
```bash
node server/check_users.js     # Verify user accounts
npm run create-admin          # Create admin user
```

### Algorithm Performance Issues
- Reduce population size in settings for testing
- Check constraint weights in fitness function
- Monitor convergence via fitness history logs