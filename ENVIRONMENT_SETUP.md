# Environment Configuration Guide

This guide explains how to properly configure the environment variables for both the server and client applications to ensure proper connectivity and functionality.

## Quick Setup

### 1. Server Configuration

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Copy the environment template:
   ```bash
   copy .env.template .env
   ```

3. Edit `.env` with your specific configuration values.

### 2. Client Configuration

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Copy the environment template:
   ```bash
   copy .env.template .env
   ```

3. Edit `.env` with your specific configuration values.

## Critical Configuration Points

### API Connection

**Server Side (`server/.env`):**
```env
PORT=8000
CLIENT_URL=http://localhost:5173
```

**Client Side (`client/.env`):**
```env
VITE_API_URL=http://localhost:8000/api
```

**Important:** The `CLIENT_URL` in server config and `VITE_API_URL` in client config must match!

### Database Configuration

**Server Side (`server/.env`):**
```env
MONGODB_URI=mongodb://localhost:27017/timetable_generator
```

Make sure MongoDB is running on the specified URI before starting the server.

### Authentication

**Server Side (`server/.env`):**
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

**Important:** Change the JWT_SECRET in production environments!

### CORS Configuration

**Server Side (`server/.env`):**
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Add all client URLs that will access your API.

## API Endpoints Map

The following endpoints are available and used by the client:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify-token` - Verify JWT token

### Data Management Endpoints
- `GET /api/data/teachers` - Get teachers list
- `POST /api/data/teachers` - Create teacher
- `GET /api/data/teachers/:id` - Get specific teacher
- `PUT /api/data/teachers/:id` - Update teacher
- `DELETE /api/data/teachers/:id` - Delete teacher
- `POST /api/data/teachers/bulk-import` - Bulk import teachers

- `GET /api/data/classrooms` - Get classrooms list
- `POST /api/data/classrooms` - Create classroom
- `POST /api/data/classrooms/bulk-import` - Bulk import classrooms

- `GET /api/data/courses` - Get courses list
- `POST /api/data/courses` - Create course
- `POST /api/data/courses/bulk-import` - Bulk import courses

- `GET /api/data/validate` - Validate data integrity
- `GET /api/data/statistics` - Get data statistics

### Timetable Generation Endpoints
- `POST /api/timetables/generate` - Generate new timetable
- `GET /api/timetables/generate/:id/progress` - Get generation progress
- `GET /api/timetables` - Get timetables list
- `GET /api/timetables/:id` - Get specific timetable
- `PATCH /api/timetables/:id/status` - Update timetable status
- `DELETE /api/timetables/:id` - Delete timetable
- `POST /api/timetables/:id/comments` - Add comment
- `GET /api/timetables/statistics/overview` - Get statistics

### Algorithm Configuration Endpoints
- `GET /api/algorithm/algorithms` - Get available algorithms
- `GET /api/algorithm/constraints` - Get constraints
- `GET /api/algorithm/optimization-goals` - Get optimization goals
- `POST /api/algorithm/validate-parameters` - Validate parameters
- `POST /api/algorithm/recommend` - Get recommendations

### Health Check
- `GET /api/health` - Server health status

## Client-Server Integration

### 1. API Service Configuration

The client uses Axios with interceptors for API communication. The base URL is configured using `VITE_API_URL`:

```javascript
// client/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

### 2. Authentication Flow

1. User logs in via `POST /api/auth/login`
2. Server returns JWT token
3. Client stores token in localStorage
4. Subsequent requests include token in Authorization header
5. Token is verified on server using `JWT_SECRET`

### 3. Real-time Updates

Socket.IO is used for real-time timetable generation updates:

**Server Side:**
```javascript
// Configured in server.js
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  }
});
```

**Client Side:**
```env
VITE_SOCKET_URL=http://localhost:8000
```

### 4. File Uploads

File uploads are configured with size and type restrictions:

**Server Side:**
```env
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=text/csv,application/vnd.ms-excel
```

**Client Side:**
```env
VITE_MAX_UPLOAD_SIZE=5  # 5MB
```

## Development vs Production

### Development Configuration

**Server:**
```env
NODE_ENV=development
DEBUG_MODE=true
ENABLE_API_DOCS=true
LOG_LEVEL=info
```

**Client:**
```env
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### Production Configuration

**Server:**
```env
NODE_ENV=production
DEBUG_MODE=false
ENABLE_API_DOCS=false
LOG_LEVEL=warn
HELMET_ENABLED=true
```

**Client:**
```env
VITE_DEV_MODE=false
VITE_DEBUG=false
```

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure `CLIENT_URL` in server matches client's URL
   - Add client URL to `CORS_ORIGINS`

2. **API Connection Failed:**
   - Verify `VITE_API_URL` points to correct server
   - Check if server is running on specified port

3. **Authentication Issues:**
   - Ensure `JWT_SECRET` is set and consistent
   - Check token expiration settings

4. **Database Connection:**
   - Verify MongoDB is running
   - Check `MONGODB_URI` format and credentials

### Testing Configuration

Use the health check endpoint to verify server status:
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-21T...",
  "uptime": 123.456,
  "environment": "development"
}
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Restrict CORS origins** to known domains
5. **Use environment-specific database URIs**
6. **Enable security headers** with Helmet in production

## Optional Features

### Google OAuth (if needed)
```env
# Server
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Client
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Redis Caching (for production)
```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

### Email Notifications
```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

This configuration ensures proper connectivity between the client and server applications while maintaining security and flexibility for different deployment environments.
