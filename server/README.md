# Advanced AI Timetable Generation Server

A sophisticated server-side implementation for college timetable generation using advanced AI algorithms including Constraint Satisfaction Problem (CSP) solving, Genetic Algorithms, and hybrid optimization techniques.

## 🚀 Features

### Core Algorithms
- **Constraint Satisfaction Problem (CSP) Solver** - Systematic approach with arc consistency and backtracking
- **Genetic Algorithm** - Evolutionary optimization with multiple crossover and mutation strategies
- **Hybrid CSP-GA** - Combines CSP for feasibility with GA for optimization
- **Simulated Annealing** - Probabilistic optimization for escaping local optima
- **Backtracking Search** - Classic systematic search for simple problems

### Advanced Capabilities
- **Multi-objective Optimization** - Balance multiple competing goals
- **Real-time Progress Tracking** - WebSocket-based progress updates
- **Conflict Detection & Resolution** - Advanced conflict analysis and automatic resolution
- **Dynamic Parameter Optimization** - Automatic algorithm parameter tuning based on problem characteristics
- **Scalable Architecture** - Handles small to large-scale scheduling problems

### Data Management
- **Comprehensive Models** - Teachers, classrooms, courses, and timetables
- **Bulk Import/Export** - CSV-based data import and export
- **Data Validation** - Extensive validation and constraint checking
- **User Management** - Role-based authentication and authorization

## 🏗️ Architecture

```
server/
├── algorithms/           # AI algorithms and optimization engines
│   ├── CSPSolver.js     # Constraint Satisfaction Problem solver
│   ├── GeneticAlgorithm.js # Genetic Algorithm implementation
│   └── OptimizationEngine.js # Main optimization orchestrator
├── models/              # Database models
│   ├── User.js         # User authentication model
│   ├── Teacher.js      # Teacher data model
│   ├── Classroom.js    # Classroom/lab model
│   ├── Course.js       # Course and session model
│   └── Timetable.js    # Generated timetable model
├── routes/             # API endpoints
│   ├── auth.js         # Authentication routes
│   ├── data.js         # Data management routes
│   ├── timetables.js   # Timetable generation routes
│   └── algorithms.js   # Algorithm configuration routes
├── config/             # Configuration files
├── utils/              # Utility functions
└── logs/               # Application logs
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example configuration
   cp config/config.js.example config/config.js
   
   # Edit configuration with your settings
   nano config/config.js
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   
   # The application will automatically create the database
   ```

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Algorithm Comparison

| Algorithm | Best For | Time Complexity | Solution Quality | Scalability |
|-----------|----------|----------------|------------------|-------------|
| **CSP** | Well-constrained problems | O(d^n) | Optimal | Medium |
| **Genetic Algorithm** | Large, complex problems | O(g×p×f) | Very Good | High |
| **Hybrid CSP-GA** | All problem types | O(CSP + GA) | Excellent | High |
| **Simulated Annealing** | Continuous optimization | O(n×k) | Good | Medium |
| **Backtracking** | Simple problems | O(b^d) | Optimal | Low |

*Where: d=domain size, n=variables, g=generations, p=population, f=fitness eval time, k=iterations, b=branching factor*

## 🔄 API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout
GET    /api/auth/profile        # Get user profile
PUT    /api/auth/profile        # Update user profile
```

### Data Management
```
GET    /api/data/teachers        # Get all teachers
POST   /api/data/teachers        # Create teacher
PUT    /api/data/teachers/:id    # Update teacher
DELETE /api/data/teachers/:id    # Delete teacher
POST   /api/data/teachers/bulk-import # Bulk import from CSV

GET    /api/data/classrooms      # Get all classrooms
POST   /api/data/classrooms      # Create classroom
PUT    /api/data/classrooms/:id  # Update classroom
DELETE /api/data/classrooms/:id  # Delete classroom

GET    /api/data/courses         # Get all courses
POST   /api/data/courses         # Create course
PUT    /api/data/courses/:id     # Update course
DELETE /api/data/courses/:id     # Delete course

GET    /api/data/validate        # Validate all data
GET    /api/data/statistics      # Get data statistics
```

### Timetable Generation
```
POST   /api/timetables/generate           # Start generation
GET    /api/timetables/generate/:id/progress # Get progress
GET    /api/timetables                    # List timetables
GET    /api/timetables/:id                # Get specific timetable
PATCH  /api/timetables/:id/status         # Update status
DELETE /api/timetables/:id                # Delete timetable
POST   /api/timetables/:id/comments       # Add comment
```

### Algorithm Configuration
```
GET    /api/algorithm/algorithms          # Get available algorithms
GET    /api/algorithm/constraints         # Get constraint types
GET    /api/algorithm/optimization-goals  # Get optimization goals
POST   /api/algorithm/validate-parameters # Validate parameters
POST   /api/algorithm/recommend           # Get algorithm recommendations
```

## 🎯 Constraint Types

### Hard Constraints (Must be satisfied)
- **Teacher Conflicts** - No teacher in multiple places simultaneously
- **Room Conflicts** - No double-booking of classrooms
- **Student Conflicts** - No overlapping classes for same student group
- **Availability** - Respect teacher and room availability windows
- **Capacity** - Ensure adequate room capacity for enrolled students
- **Requirements** - Match required features (labs, projectors, etc.)

### Soft Constraints (Preferred but flexible)
- **Teacher Preferences** - Preferred time slots and teaching patterns
- **Workload Balance** - Even distribution of teaching hours
- **Student Convenience** - Minimize gaps between classes
- **Resource Optimization** - Efficient use of classrooms
- **Time Preferences** - Optimal scheduling of different session types

### Preferences (Nice-to-have)
- **Department Clustering** - Group related courses
- **Senior Faculty Priority** - Preference for experienced teachers
- **Specialized Sessions** - Optimal timing for labs and practicals

## 🔮 Optimization Goals

1. **Minimize Conflicts** - Eliminate all scheduling conflicts
2. **Balanced Schedule** - Even distribution across time periods
3. **Teacher Satisfaction** - Respect preferences and availability
4. **Resource Utilization** - Optimize classroom and facility usage
5. **Student Convenience** - Minimize travel and gaps
6. **Energy Efficiency** - Cluster activities to reduce building usage

## 🚦 Generation Process

### Phase 1: Data Validation
- Verify all input data integrity
- Check constraint feasibility
- Identify potential conflicts

### Phase 2: Algorithm Selection
- Analyze problem characteristics
- Recommend optimal algorithm
- Configure parameters automatically

### Phase 3: Solution Generation
- Apply selected algorithm
- Monitor progress in real-time
- Handle conflicts and constraints

### Phase 4: Optimization
- Refine initial solution
- Apply optimization goals
- Resolve remaining conflicts

### Phase 5: Quality Assessment
- Calculate quality metrics
- Generate recommendations
- Prepare final output

## 📈 Performance Metrics

### Quality Scores
- **Overall Score** (0-100) - Weighted combination of all metrics
- **Constraint Compliance** (0-100) - Percentage of satisfied constraints
- **Teacher Satisfaction** (0-100) - Adherence to preferences
- **Room Utilization** (0-100) - Efficiency of space usage
- **Student Convenience** (0-100) - Convenience for student schedules

### Performance Indicators
- **Generation Time** - Time to produce solution
- **Convergence Rate** - Speed of algorithm convergence
- **Memory Usage** - Peak memory consumption
- **Conflict Resolution** - Number and types of conflicts resolved

## 🔧 Configuration

### Algorithm Parameters

#### Genetic Algorithm
```javascript
{
  populationSize: 100,      // Population size
  maxGenerations: 1000,     // Maximum generations
  crossoverRate: 0.8,       // Crossover probability
  mutationRate: 0.1,        // Mutation probability
  eliteSize: 10,            // Elite individuals preserved
  tournamentSize: 5         // Tournament selection size
}
```

#### CSP Solver
```javascript
{
  maxBacktrackingSteps: 10000,  // Maximum backtrack steps
  variableOrdering: 'MRV',      // Variable ordering heuristic
  valueOrdering: 'LCV',         // Value ordering heuristic
  arcConsistency: true,         // Enable arc consistency
  forwardChecking: true         // Enable forward checking
}
```

### Timetable Settings
```javascript
{
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 60,             // Minutes per slot
  breakSlots: ['12:00-13:00'],  // Break time ranges
  enforceBreaks: true,
  balanceWorkload: true
}
```

## 🔍 Monitoring & Debugging

### Real-time Progress
- WebSocket-based progress updates
- Generation step tracking
- Performance metrics monitoring
- Error reporting and handling

### Logging
- Structured logging with Winston
- Multiple log levels (error, warn, info, debug)
- File and console output
- Request/response logging

### Health Checks
- Application health monitoring
- Database connectivity checks
- Algorithm performance tracking
- Resource usage monitoring

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:algorithms
npm run test:api
npm run test:models

# Run with coverage
npm run test:coverage
```

## 📝 Data Models

### Teacher Model
```javascript
{
  id: String,                    // Unique identifier
  name: String,                  // Full name
  email: String,                 // Email address
  department: String,            // Department name
  subjects: [String],            // Teachable subjects
  maxHoursPerWeek: Number,       // Maximum teaching hours
  availability: {                // Weekly availability
    monday: { available: Boolean, startTime: String, endTime: String },
    // ... other days
  },
  priority: String,              // Scheduling priority
  preferences: Object            // Teaching preferences
}
```

### Classroom Model
```javascript
{
  id: String,                    // Room identifier
  name: String,                  // Room name
  building: String,              // Building name
  capacity: Number,              // Student capacity
  type: String,                  // Room type (lab, lecture, etc.)
  features: [String],            // Available features
  availability: Object,          // Time availability
  priority: String               // Usage priority
}
```

### Course Model
```javascript
{
  id: String,                    // Course identifier
  name: String,                  // Course name
  code: String,                  // Course code
  department: String,            // Department
  year: Number,                  // Academic year
  semester: Number,              // Semester number
  sessions: {                    // Session requirements
    theory: { duration: Number, sessionsPerWeek: Number },
    practical: { duration: Number, sessionsPerWeek: Number },
    tutorial: { duration: Number, sessionsPerWeek: Number }
  },
  assignedTeachers: [Object],    // Assigned teachers
  enrolledStudents: Number,      // Student count
  constraints: Object            // Course-specific constraints
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Different access levels for admin/faculty
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Protection against abuse
- **CORS Configuration** - Cross-origin request handling
- **Helmet Security** - Security headers and protection

## 🚀 Deployment

### Production Setup
```bash
# Set environment to production
export NODE_ENV=production

# Install only production dependencies
npm ci --only=production

# Start with PM2 for process management
pm2 start server.js --name timetable-server

# Set up reverse proxy (nginx example)
# Configure SSL certificates
# Set up monitoring and logging
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 📊 Monitoring & Analytics

### Metrics Tracked
- Generation success rates
- Average generation time
- Algorithm performance comparison
- User activity patterns
- System resource usage

### Alerts & Notifications
- Generation failures
- Performance degradation
- System errors
- Resource exhaustion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples
- Contact the development team

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core algorithm implementations
- Basic API endpoints
- Authentication system
- Real-time progress tracking

### Planned Features
- Machine Learning optimization
- Advanced constraint learning
- Multi-campus support
- Mobile API
- Advanced analytics dashboard
