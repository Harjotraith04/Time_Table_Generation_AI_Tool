# 🎓 AlmanacAI - AI-Powered Timetable Generation System

<div align="center">

![AlmanacAI Banner](https://img.shields.io/badge/AlmanacAI-Timetable%20Generator-blue?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://timetable-frontend-psi.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A Revolutionary AI-Powered Timetable Scheduling Platform for Educational Institutions**

[Features](#-features) • [Demo](#-live-demo) • [Installation](#-installation--setup) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 About

AlmanacAI is a sophisticated full-stack timetable generation system that leverages **Genetic Algorithms** and advanced optimization techniques to automatically create conflict-free, optimal class schedules for educational institutions. Built with modern web technologies, it provides real-time generation tracking, intelligent conflict resolution, and comprehensive analytics.

This project implements a sophisticated timetable generation system using genetic algorithms and other optimization techniques. It provides a comprehensive solution for educational institutions to automatically generate optimal class schedules while considering multiple constraints and preferences.

### 🎯 Key Highlights

- 🧬 **Advanced Genetic Algorithm**: Evolutionary optimization for superior timetable quality
- 🤖 **AI-Powered Assistant**: Gemini AI chatbot for instant query resolution
- � **Real-time Analytics**: Comprehensive dashboards for admins, faculty, and students
- 🔄 **Live Progress Tracking**: Watch the generation process in real-time with WebSocket updates
- 📧 **Automated Notifications**: Email system for timetable updates and announcements
- 📱 **Responsive Design**: Modern UI built with React and Tailwind CSS
- 🌐 **Production Ready**: Deployed on Vercel (frontend) and Render (backend)

---

## 🌟 Features

### 🎓 For Educational Institutions
### 🎓 For Educational Institutions

#### 🔄 Timetable Generation
- **Advanced Genetic Algorithm**: Sophisticated evolutionary algorithm for optimal timetable generation
- **Multiple Algorithm Support**: Genetic Algorithm, Backtracking, and Simulated Annealing
- **Real-time Progress Tracking**: Live updates during generation with WebSocket connections
- **Batch Processing**: Handle 100+ teachers, 200+ classrooms, 500+ courses simultaneously
- **Smart Conflict Detection**: Intelligent detection and automatic resolution of scheduling conflicts
- **Data Validation**: Comprehensive validation of input data before generation
- **Export Capabilities**: Export timetables in PDF, Excel, and CSV formats

#### 👥 User Management
- **Role-Based Access Control**: Separate dashboards for Admin, Faculty, and Students
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **CSV Bulk Import**: Import teachers and students via CSV files
- **Profile Management**: Update availability, preferences, and contact information

#### 🤖 AI-Powered Features
- **Gemini AI Chatbot**: Intelligent assistant for answering queries about timetables
- **Query Resolution System**: Students and faculty can ask questions and get instant answers
- **Natural Language Processing**: Understand and respond to complex scheduling queries
- **Context-Aware Responses**: AI understands user role and provides relevant information

#### 📊 Analytics & Insights
- **Resource Utilization**: Track classroom and teacher usage statistics
- **Workload Analysis**: Monitor teacher workload distribution
- **Conflict Reports**: Detailed reports on scheduling conflicts and resolutions
- **Performance Metrics**: Generation time, success rates, and optimization scores

#### 📧 Communication System
- **Email Notifications**: Automated emails for timetable updates
- **SMTP Integration**: Configurable email service (Gmail, Outlook, custom SMTP)
- **Bulk Messaging**: Send announcements to all users or specific roles
- **Query Notifications**: Alert users when their queries are answered

### ⚙️ Constraint Management

#### **Hard Constraints** (Must be satisfied):
  - Teacher conflicts (no teacher in multiple classes simultaneously)
  - Classroom conflicts (no room double-booking)
  - Student group conflicts (no overlapping classes for same group)
  - Room capacity limits
  - Mandatory break enforcement

- **Soft Constraints** (Optimized but not mandatory):
  - Teacher availability preferences
  - Workload balance among teachers
  - Consecutive hours limits
  - Room type matching
  - Day distribution optimization

---

## 🚀 Live Demo

**Frontend**: [https://timetable-frontend-psi.vercel.app](https://timetable-frontend-psi.vercel.app)  
**Backend API**: [https://timetable-backend-2h6m.onrender.com/api/health](https://timetable-backend-2h6m.onrender.com/api/health)

### Demo Credentials
- **Admin**: `admin@example.com` / `admin123`
- **Faculty**: `faculty@example.com` / `faculty123`
- **Student**: `student@example.com` / `student123`

---

## 🛠️ Tech Stack

### Frontend (Client)
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with modern hooks and state management |
| **Vite** | Lightning-fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework for responsive design |
| **Material-UI (MUI)** | Pre-built React components for enterprise UI |
| **React Router v6** | Client-side routing and navigation |
| **Axios** | Promise-based HTTP client for API calls |
| **Lucide React** | Beautiful icon library |
| **Recharts** | Charting library for analytics visualization |
| **Three.js + OGL** | 3D graphics for interactive landing page |

### Backend (Server)
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime for server-side logic |
| **Express.js** | Web framework for RESTful API |
| **MongoDB** | NoSQL database for flexible data storage |
| **Mongoose** | ODM for MongoDB with schema validation |
| **Socket.io** | WebSocket for real-time progress updates |
| **JWT** | JSON Web Tokens for secure authentication |
| **Bcrypt** | Password hashing and security |
| **Nodemailer** | Email service for notifications |
| **Google Gemini AI** | AI chatbot integration for query resolution |
| **Winston** | Logging framework for debugging |
| **Helmet** | Security middleware for Express |

### DevOps & Deployment
| Tool | Purpose |
|------|---------|
| **Vercel** | Frontend hosting with automatic deployments |
| **Render** | Backend hosting with health checks |
| **MongoDB Atlas** | Cloud-hosted MongoDB database |
| **GitHub** | Version control and CI/CD trigger |
| **Git** | Source code management |

---

## 📂 Project Structure

```
Time_Table_Generation_AI_Tool/
│
├── 📁 client/                          # React Frontend
│   ├── 📁 public/                      # Static assets
│   │   └── logo.png
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── AdminDashboard.jsx      # Admin control panel
│   │   │   ├── StudentDashboard.jsx    # Student interface
│   │   │   ├── TeacherDashboard.jsx    # Faculty interface
│   │   │   ├── Auth.jsx                # Login/Register forms
│   │   │   ├── ChatbotInterface.jsx    # AI chatbot UI
│   │   │   ├── Landing.jsx             # Landing page with 3D graphics
│   │   │   ├── Navbar.jsx              # Navigation bar
│   │   │   └── Sidebar.jsx             # Dashboard sidebar
│   │   ├── 📁 services/                # API integration
│   │   │   └── api.js                  # Axios instance & API calls
│   │   ├── 📁 assets/                  # Images, fonts, etc.
│   │   ├── App.jsx                     # Main app component with routing
│   │   ├── index.jsx                   # React entry point
│   │   └── index.css                   # Global styles
│   ├── .env.example                    # Environment variables template
│   ├── vercel.json                     # Vercel deployment config
│   ├── package.json                    # Dependencies & scripts
│   ├── vite.config.js                  # Vite configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   └── postcss.config.js               # PostCSS config
│
├── 📁 server/                          # Node.js Backend
│   ├── 📁 routes/                      # API endpoints
│   │   ├── auth.js                     # Authentication routes
│   │   ├── data.js                     # CRUD for teachers, rooms, courses
│   │   ├── timetables.js               # Timetable generation & management
│   │   ├── algorithms.js               # Algorithm selection endpoints
│   │   ├── queries.js                  # Query resolution system
│   │   └── chatbot.js                  # AI chatbot endpoints
│   ├── 📁 models/                      # Mongoose schemas
│   │   ├── User.js                     # User model (admin, faculty, student)
│   │   ├── Teacher.js                  # Teacher details & availability
│   │   ├── Classroom.js                # Classroom/room information
│   │   ├── Course.js                   # Course/subject details
│   │   ├── Timetable.js                # Generated timetables
│   │   ├── Query.js                    # User queries
│   │   └── Student.js                  # Student information
│   ├── 📁 algorithms/                  # Optimization algorithms
│   │   ├── genetic.js                  # Genetic Algorithm implementation
│   │   ├── backtracking.js             # Backtracking algorithm
│   │   └── simulated_annealing.js      # Simulated Annealing
│   ├── 📁 middleware/                  # Express middleware
│   │   ├── auth.js                     # JWT verification
│   │   └── errorHandler.js             # Global error handling
│   ├── 📁 utils/                       # Utility functions
│   │   ├── emailService.js             # Email sending logic
│   │   ├── validator.js                # Data validation helpers
│   │   └── logger.js                   # Winston logger config
│   ├── 📁 scripts/                     # Utility scripts
│   │   ├── create_admin.js             # Create admin user
│   │   ├── setup_mailing.js            # Configure email service
│   │   └── populate_test_data.js       # Seed database
│   ├── .env.example                    # Environment variables template
│   ├── server.js                       # Express server entry point
│   ├── package.json                    # Dependencies & scripts
│   └── README.md                       # Backend documentation
│
├── 📄 DEPLOYMENT.md                    # Deployment guide
├── 📄 GEMINI_AI_INTEGRATION.md         # AI chatbot setup
├── 📄 MAILING_SYSTEM_GUIDE.md          # Email system docs
├── 📄 QUERY_RESOLUTION_SYSTEM.md       # Query system docs
├── 📄 STUDENT_MANAGEMENT_GUIDE.md      # Student module docs
├── 📄 README.md                        # This file
├── 📄 vercel.json                      # Root Vercel config
└── 📄 .gitignore                       # Git ignore rules
```

---

## 🛠️ Installation & Setup


### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### 🔧 Local Development Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Harjotraith04/Time_Table_Generation_AI_Tool.git
cd Time_Table_Generation_AI_Tool
```

#### 2️⃣ Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI (MongoDB connection string)
# - JWT_SECRET (Random secret key)
# - GEMINI_API_KEY (Google Gemini AI key)
# - SMTP credentials (for email service)
```

**Sample `.env` file:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/timetable_generator
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timetable_generator

# Server
PORT=8000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Email Service
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=AlmanacAI <noreply@almanacai.com>
```

```bash
# Create admin user (optional)
npm run create-admin

# Start development server
npm run dev
```

Server will run on **http://localhost:8000**

#### 3️⃣ Frontend Setup

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
# VITE_API_URL=http://localhost:8000/api
```

**Sample `.env.local` file:**

```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api
```

```bash
# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

#### 4️⃣ Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/health

---

### 🌐 Production Deployment

#### Deploy to Vercel (Frontend)

1. **Push code to GitHub**
2. **Import project** in [Vercel Dashboard](https://vercel.com)
3. **Configure settings**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add environment variable**:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
5. **Deploy** - Vercel will auto-deploy on git push

#### Deploy to Render (Backend)

1. **Create Web Service** in [Render Dashboard](https://render.com)
2. **Connect GitHub repository**
3. **Configure settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
4. **Add environment variables** (all from `.env.example`)
5. **Deploy** - Render will auto-deploy on git push

📖 **Full deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Documentation

### Quick Start Guides
- [🚀 Quick Start Guide](QUICK_START_GUIDE.md) - Get started in 5 minutes
- [📖 Environment Setup](ENVIRONMENT_SETUP.md) - Detailed environment configuration
- [🗄️ MongoDB Setup](MONGODB_SETUP.md) - Database setup and seeding

### Feature Guides
- [🤖 Gemini AI Integration](GEMINI_AI_INTEGRATION.md) - Set up AI chatbot
- [📧 Mailing System](MAILING_SYSTEM_GUIDE.md) - Configure email notifications
- [❓ Query Resolution System](QUERY_RESOLUTION_SYSTEM.md) - How the query system works
- [👥 Student Management](STUDENT_MANAGEMENT_GUIDE.md) - Manage students and CSV imports
- [📊 Analytics Dashboard](ADMIN_DASHBOARD_ENHANCEMENT.md) - Admin dashboard features

### Developer Guides
- [🧬 Algorithm Implementation](ALGORITHM_IMPLEMENTATION_GUIDE.md) - Understanding the genetic algorithm
- [📊 Algorithm Test Results](ALGORITHM_TEST_RESULTS.md) - Performance benchmarks
- [🔧 API Documentation](API_CONNECTION_GUIDE.md) - API endpoints and usage
- [🐛 Troubleshooting](DEPLOYMENT.md#troubleshooting) - Common issues and solutions

---

## 🧬 Genetic Algorithm Implementation

The genetic algorithm is the core of this timetable generation system. It uses evolutionary principles to find optimal solutions.

### Algorithm Flow

```
1. Initialize Population (100+ random timetables)
   ↓
2. Evaluate Fitness (check constraints & conflicts)
   ↓
3. Selection (tournament selection)
   ↓
4. Crossover (combine parent solutions)
   ↓
5. Mutation (random changes for diversity)
   ↓
6. Elitism (preserve best solutions)
   ↓
7. Repeat until convergence or max generations
```

### Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Population Size** | 100-200 | Number of candidate solutions |
| **Generations** | 500-1000 | Maximum iterations |
| **Crossover Rate** | 0.8 (80%) | Probability of combining parents |
| **Mutation Rate** | 0.1 (10%) | Probability of random changes |
| **Elite Size** | 10% | Best solutions preserved |
| **Tournament Size** | 5 | Selection pool size |

### Performance Metrics

- ✅ **Handles**: 100+ teachers, 200+ classrooms, 500+ courses
- ⚡ **Generation Time**: 2-5 minutes for complex timetables
- 🎯 **Constraint Satisfaction**: 95%+ hard constraints met
- 📈 **Optimization**: Maximizes resource utilization and teacher preferences

### Fitness Function

```javascript
Fitness = (Hard Constraint Score × 10) + (Soft Constraint Score × 1)

Hard Constraints (0 or 1):
- No teacher conflicts
- No classroom conflicts  
- No student group conflicts
- Room capacity respected
- Break enforcement

Soft Constraints (0 to 1):
- Teacher availability preferences
- Workload balance
- Consecutive hours limits
- Room type matching
- Day distribution
```

---

## 🎯 Usage Guide

### For Administrators

1. **Login** with admin credentials
2. **Add Data**:
   - Upload teachers via CSV or add manually
   - Add classrooms with capacity and type
   - Create courses with duration and requirements
3. **Generate Timetable**:
   - Select algorithm (Genetic recommended)
   - Set parameters (optional)
   - Click "Generate"
   - Watch real-time progress
4. **Review & Export**:
   - Check for conflicts
   - Review analytics
   - Export to PDF/Excel/CSV
5. **Manage Users**:
   - Add/edit students and faculty
   - Assign roles and permissions
   - Monitor system usage

### For Faculty

1. **Login** with faculty credentials
2. **View Schedule**: See your teaching timetable
3. **Update Availability**: Set preferred working hours
4. **Ask Questions**: Use AI chatbot for queries
5. **Download**: Export your personal timetable

### For Students

1. **Login** with student credentials
2. **View Timetable**: See your class schedule
3. **Download**: Export to PDF or add to calendar
4. **Ask Questions**: Query the AI about class timings
5. **Check Conflicts**: Verify no scheduling issues

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
POST   /api/auth/logout         # Logout user
GET    /api/auth/me             # Get current user
```

### Timetable Management
```
POST   /api/timetables/generate              # Generate new timetable
GET    /api/timetables                       # Get all timetables
GET    /api/timetables/:id                   # Get specific timetable
PUT    /api/timetables/:id                   # Update timetable
DELETE /api/timetables/:id                   # Delete timetable
GET    /api/timetables/:id/conflicts         # Check conflicts
POST   /api/timetables/:id/export            # Export timetable
GET    /api/timetables/:id/progress          # Get generation progress (WebSocket)
```

### Data Management
```
GET    /api/teachers            # Get all teachers
POST   /api/teachers            # Create teacher
PUT    /api/teachers/:id        # Update teacher
DELETE /api/teachers/:id        # Delete teacher
POST   /api/teachers/import     # Import teachers from CSV

GET    /api/classrooms          # Get all classrooms
POST   /api/classrooms          # Create classroom
PUT    /api/classrooms/:id      # Update classroom
DELETE /api/classrooms/:id      # Delete classroom

GET    /api/courses             # Get all courses
POST   /api/courses             # Create course
PUT    /api/courses/:id         # Update course
DELETE /api/courses/:id         # Delete course

GET    /api/students            # Get all students
POST   /api/students            # Create student
POST   /api/students/import     # Import students from CSV
```

### Query & Chatbot
```
POST   /api/queries             # Submit new query
GET    /api/queries             # Get user's queries
POST   /api/chatbot/message     # Send message to AI chatbot
GET    /api/chatbot/history     # Get chat history
```

### Analytics
```
GET    /api/analytics/dashboard         # Dashboard summary
GET    /api/analytics/utilization       # Resource utilization
GET    /api/analytics/conflicts         # Conflict statistics
GET    /api/analytics/teacher-workload  # Teacher workload distribution
```

---

## ⚙️ Configuration

### Client Environment Variables

```env
# .env.local in client/
VITE_API_URL=http://localhost:8000/api
```

### Server Environment Variables

```env
# .env in server/

# Database
MONGODB_URI=mongodb://localhost:27017/timetable_generator

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your-api-key-here

# Email (Gmail example)
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=AlmanacAI <noreply@almanacai.com>

# Algorithm Parameters (optional)
GA_POPULATION_SIZE=100
GA_MAX_GENERATIONS=1000
GA_CROSSOVER_RATE=0.8
GA_MUTATION_RATE=0.1
```

---

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

### Manual Testing

1. **Health Check**: Visit `http://localhost:8000/api/health`
2. **API Testing**: Use Postman or cURL
3. **Frontend**: Navigate through all pages
4. **Generation**: Create test data and generate timetable

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation
- Keep PRs focused on single features

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Harjot Singh** - [GitHub](https://github.com/Harjotraith04)

---

## 🙏 Acknowledgments

- Google Gemini AI for chatbot capabilities
- MongoDB for flexible data storage
- Vercel & Render for seamless deployment
- React & Vite teams for excellent developer experience
- Open source community for amazing libraries

---

## 📞 Support

For support, questions, or feedback:

- 📧 Email: support@almanacai.com
- 🐛 Issues: [GitHub Issues](https://github.com/Harjotraith04/Time_Table_Generation_AI_Tool/issues)
- 📖 Docs: Check the documentation files in the repository
- 💬 Discussions: [GitHub Discussions](https://github.com/Harjotraith04/Time_Table_Generation_AI_Tool/discussions)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

Made with ❤️ by AlmanacAI Team

</div> 