#!/bin/bash

echo "🚀 Setting up AI-Powered Timetable Generation Tool"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start MongoDB with: mongod"
    read -p "Press Enter to continue anyway..."
fi

echo "📦 Installing server dependencies..."
cd server
npm install

echo "📦 Installing client dependencies..."
cd ../client
npm install

echo "✅ Installation complete!"
echo ""
echo "🔧 Setup Instructions:"
echo "1. Make sure MongoDB is running: mongod"
echo "2. Start the server: cd server && npm run dev"
echo "3. In another terminal, start the client: cd client && npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo ""
echo "📚 Default login credentials:"
echo "   Email: admin@timetable.com"
echo "   Password: password"
echo ""
echo "🧬 Features:"
echo "   ✓ Advanced Genetic Algorithm for timetable optimization"
echo "   ✓ Real-time progress tracking during generation"
echo "   ✓ Comprehensive constraint handling (hard & soft)"
echo "   ✓ Teacher, classroom, and course management"
echo "   ✓ Data validation and conflict detection"
echo "   ✓ Multiple algorithm support (Genetic, Backtracking, Simulated Annealing)"
echo ""
echo "Happy scheduling! 🎓"
