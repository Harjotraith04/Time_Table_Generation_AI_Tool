import fs from 'fs';
import path from 'path';

const envContent = `# Server Configuration
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
`;

const envPath = path.join(process.cwd(), '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please review and modify the .env file as needed before starting the server.');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('📝 Please create a .env file manually with the following content:');
  console.log('\n' + envContent);
}
