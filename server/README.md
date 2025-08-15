# Advanced Timetable Generation AI Tool - Server

A sophisticated, AI-powered academic timetable generation system built with Node.js, Express, and MongoDB. This server implements advanced algorithms including Genetic Algorithms, Constraint Satisfaction, and Heuristic approaches to solve complex academic scheduling problems.

## 🚀 Features

### Core Functionality
- **Advanced Timetable Generation**: Multiple algorithm implementations for optimal scheduling
- **Comprehensive Constraint Management**: Hard and soft constraints with configurable priorities
- **Multi-Scope Timetables**: Generate timetables for classes, teachers, rooms, divisions, and batches
- **Real-time Validation**: Constraint checking and conflict resolution
- **Flexible Scheduling**: Support for various academic structures and requirements

### Algorithm Implementations
- **Genetic Algorithm**: Evolutionary approach for complex constraint optimization
- **Constraint Satisfaction**: Systematic approach for strict requirement satisfaction
- **Heuristic Algorithm**: Fast greedy approach for quick results

### Data Management
- **Teacher Management**: Comprehensive teacher profiles with availability and preferences
- **Classroom Management**: Room types, capacities, and equipment tracking
- **Course Management**: Academic structure with prerequisites and batching
- **Student Management**: Division and batch handling for lab sessions

### Advanced Features
- **Batch Processing**: Support for splitting classes into multiple batches
- **Elective Handling**: Dynamic scheduling for student-selected courses
- **Room Optimization**: Intelligent room assignment based on requirements
- **Workload Balancing**: Fair distribution of teaching hours across faculty
- **Conflict Resolution**: Automatic detection and resolution of scheduling conflicts

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js with ES6+ modules
- **Framework**: Express.js with middleware architecture
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt
- **Validation**: Express-validator for request validation
- **Security**: Helmet, CORS, rate limiting, and input sanitization

### Project Structure
```
server/
├── config/           # Configuration files
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API route definitions
├── services/        # Business logic and algorithms
├── utils/           # Utility functions
├── uploads/         # File upload directory
├── logs/            # Application logs
├── server.js        # Main application entry point
├── package.json     # Dependencies and scripts
└── env.template     # Environment variables template
```

## 📋 Prerequisites

- **Node.js**: Version 16.0 or higher
- **MongoDB**: Version 5.0 or higher
- **npm** or **yarn**: Package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Time_Table_Generation_AI_Tool/server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp env.template .env

# Edit .env with your configuration
nano .env
```

### 4. Database Setup
```bash
# Start MongoDB (if not running as a service)
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## ⚙️ Configuration

### Environment Variables

#### Server Configuration
```env
PORT=8000
NODE_ENV=development
```

#### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/timetable_generator
```

#### JWT Configuration
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

#### Algorithm Configuration
```env
MAX_ITERATIONS=1000
POPULATION_SIZE=100
MUTATION_RATE=0.1
CROSSOVER_RATE=0.8
ELITE_SIZE=10
```

#### Timetable Constraints
```env
MAX_HOURS_PER_DAY=8
MAX_HOURS_PER_WEEK=40
BREAK_DURATION_MINUTES=15
LUNCH_DURATION_MINUTES=40
WORKING_HOURS_START=9
WORKING_HOURS_END=17
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Timetable Generation
- `POST /api/timetables/generate` - Generate timetable synchronously
- `POST /api/timetables/generate/async` - Generate timetable asynchronously
- `GET /api/timetables/generate/:id/progress` - Get generation progress
- `GET /api/timetables` - List all timetables
- `GET /api/timetables/:id` - Get specific timetable
- `PUT /api/timetables/:id` - Update timetable
- `DELETE /api/timetables/:id` - Delete timetable
- `PATCH /api/timetables/:id/status` - Update timetable status
- `POST /api/timetables/:id/validate` - Validate timetable constraints

### Data Management
- `GET /api/data/teachers` - List teachers
- `POST /api/data/teachers` - Create teacher
- `PUT /api/data/teachers/:id` - Update teacher
- `DELETE /api/data/teachers/:id` - Delete teacher
- `GET /api/data/classrooms` - List classrooms
- `POST /api/data/classrooms` - Create classroom
- `PUT /api/data/classrooms/:id` - Update classroom
- `DELETE /api/data/classrooms/:id` - Delete classroom
- `GET /api/data/courses` - List courses
- `POST /api/data/courses` - Create course
- `PUT /api/data/courses/:id` - Update course
- `DELETE /api/data/courses/:id` - Delete course
- `GET /api/data/validate` - Validate all data
- `GET /api/data/statistics` - Get data statistics

### Algorithm Configuration
- `GET /api/algorithm/algorithms` - Get available algorithms
- `GET /api/algorithm/constraints` - Get constraint types
- `GET /api/algorithm/optimization-goals` - Get optimization goals
- `POST /api/algorithm/validate-parameters` - Validate algorithm parameters
- `POST /api/algorithm/recommend` - Get algorithm recommendations

### Dashboard & Analytics
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/analytics/teachers` - Teacher analytics
- `GET /api/dashboard/analytics/classrooms` - Classroom analytics
- `GET /api/dashboard/analytics/courses` - Course analytics
- `GET /api/dashboard/analytics/timetables` - Timetable analytics
- `GET /api/dashboard/system-health` - System health check

## 🧬 Algorithm Details

### Genetic Algorithm
The genetic algorithm implements an evolutionary approach to timetable generation:

1. **Population Initialization**: Creates random timetable solutions
2. **Fitness Evaluation**: Scores solutions based on constraint satisfaction
3. **Selection**: Tournament selection for parent solutions
4. **Crossover**: Combines parent solutions to create offspring
5. **Mutation**: Randomly modifies solutions to maintain diversity
6. **Elitism**: Preserves best solutions across generations

**Parameters**:
- `maxIterations`: Maximum generations (100-10000)
- `populationSize`: Population size (20-500)
- `mutationRate`: Mutation probability (0.01-0.5)
- `crossoverRate`: Crossover probability (0.5-0.95)
- `eliteSize`: Elite preservation count (1-50)

### Constraint Satisfaction
Systematic approach focusing on hard constraint satisfaction:

1. **Variable Ordering**: Most-constrained variable first
2. **Value Ordering**: Least-constraining value first
3. **Backtracking**: Systematic search with backtracking
4. **Constraint Propagation**: Forward checking and arc consistency

### Heuristic Algorithm
Fast greedy approach using domain-specific rules:

1. **Priority Assignment**: Assigns priorities to courses and teachers
2. **Greedy Scheduling**: Schedules courses in priority order
3. **Conflict Resolution**: Resolves conflicts using heuristics
4. **Local Optimization**: Iterative improvement of solutions

## 🔒 Constraint System

### Hard Constraints (Must Satisfy)
- **Teacher Conflict**: No teacher scheduled for multiple classes simultaneously
- **Room Conflict**: No room occupied by multiple classes simultaneously
- **Teacher Availability**: Teachers only scheduled during available times
- **Room Availability**: Rooms only used during operational hours
- **Working Hours**: Classes within institutional working hours
- **Course Prerequisites**: Academic prerequisite requirements
- **Room Capacity**: Room must accommodate class size
- **Room Type Compatibility**: Room type matches subject requirements

### Soft Constraints (Preferred)
- **Teacher Workload Balance**: Even distribution of teaching hours
- **Room Utilization**: Efficient room usage without overloading
- **Day Distribution**: Even distribution across working days
- **Consecutive Hours**: Breaks between consecutive classes
- **Preferred Time Slots**: Subject-specific time preferences
- **Teacher Preferences**: Personal scheduling preferences
- **Room Preferences**: Preferred room assignments

## 📊 Data Models

### Teacher Model
```javascript
{
  teacherId: String,
  name: String,
  email: String,
  teacherType: 'core' | 'visiting',
  school: String,
  department: String,
  subjects: [{
    subjectCode: String,
    subjectName: String,
    subjectType: 'theory' | 'tutorial' | 'lab' | 'practical',
    hoursPerWeek: Number
  }],
  availability: {
    workingDays: [String],
    timeSlots: [TimeSlot],
    unavailableSlots: [TimeSlot]
  },
  maxHoursPerWeek: Number,
  priority: Number
}
```

### Classroom Model
```javascript
{
  roomId: String,
  roomName: String,
  building: String,
  floor: Number,
  capacity: Number,
  roomType: 'lecture' | 'lab' | 'computer' | 'tutorial' | 'seminar' | 'auditorium',
  equipment: [Equipment],
  features: {
    hasProjector: Boolean,
    hasAirConditioning: Boolean,
    hasInternet: Boolean
  },
  availability: {
    workingDays: [String],
    workingHours: { startTime: String, endTime: String }
  }
}
```

### Course Model
```javascript
{
  courseCode: String,
  courseName: String,
  school: String,
  program: String,
  academicYear: String,
  semester: String,
  courseType: 'core' | 'elective' | 'open_elective' | 'department_elective' | 'audit',
  weeklySchedule: {
    theoryHours: Number,
    practicalHours: Number,
    tutorialHours: Number,
    totalHours: Number
  },
  batching: {
    isRequired: Boolean,
    maxBatches: Number,
    batchType: 'fixed' | 'dynamic' | 'flexible'
  },
  enrolledStudents: {
    divisions: [{
      divisionName: String,
      studentCount: Number,
      batches: [Batch]
    }]
  }
}
```

### Timetable Model
```javascript
{
  timetableId: String,
  name: String,
  academicYear: String,
  semester: String,
  program: String,
  school: String,
  scope: 'class' | 'teacher' | 'room' | 'division' | 'batch',
  targetId: String,
  entries: [TimetableEntry],
  generationInfo: {
    algorithm: String,
    parameters: Object,
    startTime: Date,
    endTime: Date,
    iterations: Number,
    fitnessScore: Number
  },
  validation: {
    isValid: Boolean,
    errors: [ValidationError],
    warnings: [String]
  },
  status: 'draft' | 'generating' | 'generated' | 'validated' | 'approved' | 'published' | 'archived'
}
```

## 🚀 Usage Examples

### Generate Timetable
```javascript
const response = await fetch('/api/timetables/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    academicYear: '2025-26',
    semester: 'VII',
    program: 'B Tech (Artificial Intelligence & Data Science)',
    school: 'School of Technology Management & Engineering',
    algorithm: 'genetic',
    customConstraints: {
      preferredBreakTime: '11:05-11:15',
      lunchBreak: '13:20-14:00'
    }
  })
});

const result = await response.json();
console.log('Generated timetable:', result.data);
```

### Get Timetable Matrix
```javascript
const response = await fetch(`/api/timetables/${timetableId}?format=matrix`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const matrix = await response.json();
console.log('Timetable matrix:', matrix.data.matrix);
```

### Validate Data
```javascript
const response = await fetch('/api/data/validate', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const validation = await response.json();
console.log('Data validation:', validation.data);
```

## 🔧 Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

### Environment Setup
```bash
# Development
NODE_ENV=development npm run dev

# Production
NODE_ENV=production npm start
```

## 📈 Performance Considerations

### Algorithm Selection
- **Small datasets (< 50 entities)**: Use heuristic or constraint satisfaction
- **Medium datasets (50-200 entities)**: Use genetic algorithm
- **Large datasets (> 200 entities)**: Use genetic algorithm with optimized parameters

### Database Optimization
- **Indexes**: Proper indexing on frequently queried fields
- **Aggregation**: Use MongoDB aggregation for complex analytics
- **Pagination**: Implement pagination for large result sets

### Caching Strategy
- **Redis**: Cache frequently accessed data
- **Memory caching**: Cache algorithm results and validation results
- **CDN**: Serve static assets through CDN

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable rounds
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **SQL Injection Prevention**: MongoDB with parameterized queries

## 📝 Logging and Monitoring

### Log Levels
- **ERROR**: System errors and failures
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Monitoring Endpoints
- **Health Check**: `/health` - Basic system status
- **System Health**: `/api/dashboard/system-health` - Detailed health information
- **Metrics**: Dashboard analytics for performance monitoring

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up CI/CD pipeline

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://production-db:27017/timetable_generator
JWT_SECRET=very-long-random-secret-key
RATE_LIMIT_MAX_REQUESTS=1000
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Write unit tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **JWT Errors**: Check JWT secret configuration
3. **Validation Errors**: Verify request data format
4. **Algorithm Performance**: Adjust parameters based on dataset size

### Getting Help
- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning Integration**: AI-powered constraint learning
- **Real-time Collaboration**: Multi-user timetable editing
- **Advanced Analytics**: Predictive scheduling insights
- **Mobile API**: Mobile-optimized endpoints
- **WebSocket Support**: Real-time updates and notifications
- **Multi-language Support**: Internationalization
- **Advanced Reporting**: PDF/Excel export capabilities
- **Integration APIs**: LMS and ERP system integration

### Performance Improvements
- **Algorithm Optimization**: Enhanced genetic algorithm variants
- **Parallel Processing**: Multi-threaded timetable generation
- **Caching Layers**: Redis and in-memory caching
- **Database Sharding**: Horizontal scaling for large datasets
- **CDN Integration**: Global content delivery

---

**Built with ❤️ for academic institutions worldwide**
