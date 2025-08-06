@echo off
echo 🚀 Setting up AI-Powered Timetable Generation Tool
echo =================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v18 or higher) first.
    pause
    exit /b 1
)

echo 📦 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

echo 📦 Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

echo ✅ Installation complete!
echo.
echo 🔧 Setup Instructions:
echo 1. Make sure MongoDB is running: mongod
echo 2. Start the server: cd server ^&^& npm run dev
echo 3. In another terminal, start the client: cd client ^&^& npm run dev
echo.
echo 🌐 The application will be available at:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:8000
echo.
echo 📚 Default login credentials:
echo    Email: admin@timetable.com
echo    Password: password
echo.
echo 🧬 Features:
echo    ✓ Advanced Genetic Algorithm for timetable optimization
echo    ✓ Real-time progress tracking during generation
echo    ✓ Comprehensive constraint handling (hard ^& soft)
echo    ✓ Teacher, classroom, and course management
echo    ✓ Data validation and conflict detection
echo    ✓ Multiple algorithm support (Genetic, Backtracking, Simulated Annealing)
echo.
echo Happy scheduling! 🎓
pause
