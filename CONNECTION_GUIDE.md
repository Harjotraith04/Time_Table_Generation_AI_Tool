# 🚀 Frontend-Backend Connection Guide

This guide will help you connect your React frontend with the Node.js backend and ensure all functionality is working properly.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or accessible)
- Git

## 🛠️ Backend Setup

### 1. Install Dependencies
```bash
cd Time_Table_Generation_AI_Tool/server
npm install
```

### 2. Environment Configuration
Run the setup script to create your `.env` file:
```bash
node setup-env.js
```

Or manually create a `.env` file in the server directory with:
```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/timetable_generator

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Algorithm Configuration
MAX_ITERATIONS=1000
POPULATION_SIZE=100
MUTATION_RATE=0.1
CROSSOVER_RATE=0.8
ELITE_SIZE=10

# Timetable Constraints
MAX_HOURS_PER_DAY=8
MAX_HOURS_PER_WEEK=40
BREAK_DURATION_MINUTES=15
LUNCH_DURATION_MINUTES=40
WORKING_HOURS_START=9
WORKING_HOURS_END=17
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows (if installed as a service)
# MongoDB should start automatically

# On macOS/Linux
mongod
```

### 4. Seed the Database
Populate the database with sample data:
```bash
npm run seed
```

This will create:
- Admin user: `admin@timetable.com` / `admin123`
- Student user: `student1@timetable.com` / `student123`
- Sample teachers, classrooms, and courses

### 5. Start the Backend Server
```bash
npm run dev
```

The server will start on `http://localhost:8000`

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd Time_Table_Generation_AI_Tool/client
npm install
```

### 2. Environment Configuration
Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Start the Frontend
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Data Management
- `GET /api/data/teachers` - Get teachers
- `POST /api/data/teachers` - Create teacher
- `POST /api/data/teachers/bulk-import` - Bulk import teachers
- `GET /api/data/classrooms` - Get classrooms
- `POST /api/data/classrooms` - Create classroom
- `POST /api/data/classrooms/bulk-import` - Bulk import classrooms
- `GET /api/data/courses` - Get courses
- `POST /api/data/courses` - Create course
- `POST /api/data/courses/bulk-import` - Bulk import courses

### Timetable Generation
- `POST /api/timetables/generate` - Generate timetable
- `GET /api/timetables` - Get all timetables
- `GET /api/timetables/:id` - Get specific timetable
- `PATCH /api/timetables/:id/status` - Update timetable status

### Algorithm & Constraints
- `GET /api/algorithm/algorithms` - Get available algorithms
- `GET /api/algorithm/constraints` - Get constraint information
- `GET /api/algorithm/optimization-goals` - Get optimization goals

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/analytics` - Get detailed analytics
- `GET /api/dashboard/health` - System health check

## 🧪 Testing the Connection

### 1. Test Backend Health
```bash
curl http://localhost:8000/api/dashboard/health
```

Expected response:
```json
{
  "success": true,
  "message": "System is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "database": "connected",
    "version": "1.0.0"
  }
}
```

### 2. Test Frontend Login
1. Open `http://localhost:5173` in your browser
2. Click "Login"
3. Use credentials: `admin@timetable.com` / `admin123`
4. You should be redirected to the admin dashboard

### 3. Test Data Creation
1. Navigate to "Teachers Data" from the admin dashboard
2. Try adding a new teacher
3. Check the browser's Network tab to see API calls
4. Verify the teacher appears in the list

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running and accessible

#### 2. CORS Error
```
Access to fetch at 'http://localhost:8000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution**: The backend is already configured with CORS. Check if the backend is running on port 8000.

#### 3. JWT Token Error
```
Invalid token
```
**Solution**: Check if the JWT_SECRET in your .env file matches between server restarts

#### 4. Frontend Build Error
```
Module not found: Can't resolve './components/SomeComponent'
```
**Solution**: Check if all component files exist and imports are correct

### Debug Steps

1. **Check Backend Logs**: Look at the terminal running the backend server
2. **Check Frontend Console**: Open browser DevTools and check the Console tab
3. **Check Network Tab**: Monitor API calls in the Network tab of DevTools
4. **Check Database**: Use MongoDB Compass or mongo shell to verify data

## 📱 Frontend Features

### Admin Dashboard
- View system overview
- Navigate to data management
- Access timetable generation
- View analytics

### Data Management
- **Teachers**: Add, edit, delete teachers with subjects and availability
- **Classrooms**: Manage room details, capacity, and equipment
- **Courses**: Set up academic programs and course structure
- **Bulk Import**: Upload CSV files for mass data entry

### Timetable Generation
- Configure generation parameters
- Select algorithms (Genetic, Constraint Satisfaction, Heuristic)
- Set constraints and preferences
- Generate and view timetables

### Student Dashboard
- View assigned timetables
- Check class schedules
- Access course information

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your production environment
2. Use a production MongoDB instance
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Use environment-specific variables

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update `VITE_API_URL` to point to your production backend
4. Ensure HTTPS is enabled for production

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the server logs
3. Check the browser console for errors
4. Verify all environment variables are set correctly
5. Ensure MongoDB is running and accessible

## 🎯 Next Steps

After successful connection:

1. **Test all CRUD operations** for teachers, classrooms, and courses
2. **Generate a sample timetable** using the genetic algorithm
3. **Test bulk import functionality** with CSV files
4. **Verify constraint checking** works properly
5. **Test user authentication** and role-based access control

---

**Happy Coding! 🎉**

Your advanced timetable generation system is now ready with a fully connected frontend and backend!
