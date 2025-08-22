# MongoDB Installation Guide for Windows

## Option 1: MongoDB Community Server (Local Installation)

### Download and Install:
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 8.0.x (Current)
   - Platform: Windows x64
   - Package: msi
3. Download and run the installer
4. During installation:
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

### Verify Installation:
```powershell
# Check if MongoDB service is running
Get-Service -Name "MongoDB"

# Connect to MongoDB (if installed)
mongo --version
```

## Option 2: MongoDB Atlas (Cloud Database)

### Setup MongoDB Atlas:
1. Visit: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0 Sandbox)
4. Get connection string
5. Update .env file:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/timetable_generator?retryWrites=true&w=majority
```

## Option 3: Docker (If you have Docker installed)

```powershell
# Run MongoDB in Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After MongoDB Setup:

1. Update your .env file with correct MONGODB_URI
2. Start the server: `npm run dev`
3. Test: Visit http://localhost:8000/api/health
