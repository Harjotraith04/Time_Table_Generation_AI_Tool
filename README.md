# AI Timetable Generator

A full-stack application for generating optimized timetables using artificial intelligence. Built with React (Vite) frontend and FastAPI backend with MongoDB.

## Features

- **AI-Powered Generation**: Uses genetic algorithms to optimize timetable scheduling
- **Conflict Resolution**: Automatically detects and resolves scheduling conflicts
- **Resource Management**: Manages teachers, rooms, subjects, and time slots
- **Analytics Dashboard**: Provides insights on resource utilization and optimization
- **Export Functionality**: Export timetables in various formats (PDF, Excel, CSV)
- **Responsive UI**: Modern React interface with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** for high-performance API
- **MongoDB** with **Motor** for async database operations
- **Pydantic** for data validation
- **NumPy** and **scikit-learn** for AI algorithms
- **OR-Tools** for optimization

## Project Structure

```
Capstone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                 # FastAPI backend
    ├── app/
    │   ├── api/            # API routes
    │   │   └── endpoints/  # Endpoint definitions
    │   ├── core/           # Core configuration
    │   ├── models/         # Pydantic models
    │   ├── services/       # Business logic
    │   └── utils/          # Utility functions
    ├── main.py             # FastAPI application
    ├── requirements.txt
    └── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+
- MongoDB 4.4+

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection string and other settings
   ```

5. **Run the server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## API Endpoints

### Timetables
- `POST /api/timetables/generate` - Generate new timetable
- `GET /api/timetables/` - Get all timetables
- `GET /api/timetables/{id}` - Get specific timetable
- `PUT /api/timetables/{id}` - Update timetable
- `DELETE /api/timetables/{id}` - Delete timetable
- `POST /api/timetables/{id}/analyze` - Analyze conflicts
- `GET /api/timetables/{id}/export` - Export timetable

### Analytics
- `GET /api/analytics/{timetable_id}` - Get timetable analytics
- `GET /api/analytics/dashboard/summary` - Dashboard summary
- `GET /api/analytics/utilization/teachers` - Teacher utilization
- `GET /api/analytics/utilization/rooms` - Room utilization

## AI Algorithm

The application uses a **Genetic Algorithm** for timetable optimization:

1. **Population Initialization**: Random timetable solutions
2. **Fitness Evaluation**: Scores based on constraints and conflicts
3. **Selection**: Tournament selection for breeding
4. **Crossover**: Combines parent solutions
5. **Mutation**: Random changes to prevent local optima
6. **Elitism**: Preserves best solutions across generations

### Optimization Criteria
- **Conflict Minimization**: No teacher/room double-booking
- **Constraint Satisfaction**: Respect working hours and availability
- **Load Balancing**: Even distribution of workload
- **Resource Utilization**: Optimal use of rooms and time slots

## Configuration

### Environment Variables

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=timetable_generator

# API Configuration
HOST=localhost
PORT=8000
DEBUG=True
SECRET_KEY=your-secret-key-here

# AI/ML Parameters
MAX_OPTIMIZATION_TIME=300
DEFAULT_POPULATION_SIZE=100
MUTATION_RATE=0.1
```

## Development

### Running Tests
```bash
# Backend tests
cd server
pytest

# Frontend tests
cd client
npm test
```

### Code Quality
```bash
# Backend linting
cd server
flake8 app/

# Frontend linting
cd client
npm run lint
```

## Deployment

### Using Docker
```bash
# Build and run with docker-compose
docker-compose up --build
```

### Manual Deployment
1. Set up MongoDB instance
2. Deploy FastAPI backend to cloud service
3. Build and deploy React frontend to static hosting
4. Configure environment variables for production

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the code examples in the repository 