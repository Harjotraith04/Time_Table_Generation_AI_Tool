/**
 * Quick test of timetable generation flow
 * This bypasses the API and directly tests the algorithm
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const OptimizationEngine = require('./algorithms/OptimizationEngine');

async function testGeneration() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    console.log('📊 Fetching data...');
    const startFetch = Date.now();
    
    const [teachers, classrooms, courses] = await Promise.all([
      Teacher.find({ status: 'active' }),
      Classroom.find({ status: 'available' }),
      Course.find({ isActive: true })
    ]);
    
    const fetchTime = Date.now() - startFetch;
    console.log(`✅ Data fetched in ${fetchTime}ms`);
    console.log(`   Teachers: ${teachers.length}`);
    console.log(`   Classrooms: ${classrooms.length}`);
    console.log(`   Courses: ${courses.length}\n`);

    console.log('🔍 Running validation...');
    const startValidation = Date.now();
    
    const engine = new OptimizationEngine();
    const validation = engine.validateInputData(teachers, classrooms, courses);
    
    const validationTime = Date.now() - startValidation;
    console.log(`✅ Validation completed in ${validationTime}ms`);
    console.log(`   Valid: ${validation.valid}`);
    console.log(`   Issues: ${validation.issues.length}`);
    console.log(`   Warnings: ${validation.warnings ? validation.warnings.length : 0}\n`);

    if (!validation.valid) {
      console.log('❌ Validation failed:');
      validation.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      process.exit(1);
    }

    console.log('🚀 Starting optimization...');
    const startOptimization = Date.now();

    const settings = {
      algorithm: 'csp',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60,
      breakSlots: ['12:30-13:30'],
      enforceBreaks: true,
      maxBacktrackingSteps: 5000
    };

    let lastProgress = 0;
    const progressCallback = (progress, step, generation, fitness) => {
      if (Math.floor(progress / 10) > Math.floor(lastProgress / 10)) {
        console.log(`   Progress: ${Math.floor(progress)}% - ${step}`);
        lastProgress = progress;
      }
    };

    const result = await engine.optimize(
      teachers,
      classrooms,
      courses,
      settings,
      progressCallback
    );

    const optimizationTime = Date.now() - startOptimization;
    const totalTime = Date.now() - startFetch;

    console.log('\n📊 RESULTS:');
    console.log('═══════════════════════════════════════');
    console.log(`Success: ${result.success}`);
    console.log(`Optimization Time: ${optimizationTime}ms (${(optimizationTime/1000).toFixed(2)}s)`);
    console.log(`Total Time: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    
    if (result.success) {
      console.log(`\n✅ Timetable generated successfully!`);
      console.log(`   Schedule entries: ${result.solution.length}`);
      console.log(`   Conflicts: ${result.conflicts ? result.conflicts.length : 0}`);
      console.log(`   Quality score: ${result.metrics?.qualityMetrics?.overallScore || 'N/A'}`);
      
      if (result.metrics) {
        console.log('\n📈 Metrics:');
        console.log(`   Duration: ${result.metrics.duration || result.metrics.totalDuration}ms`);
        console.log(`   Variables: ${result.metrics.totalVariables || 'N/A'}`);
        console.log(`   Assigned: ${result.metrics.variablesAssigned || 'N/A'}`);
        console.log(`   Backtrack count: ${result.metrics.backtrackCount || 'N/A'}`);
      }
    } else {
      console.log(`\n❌ Generation failed!`);
      console.log(`   Reason: ${result.reason}`);
      if (result.validationErrors) {
        console.log('\n   Validation Errors:');
        result.validationErrors.forEach((err, i) => {
          console.log(`     ${i + 1}. ${err}`);
        });
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log('╔════════════════════════════════════════╗');
console.log('║  TIMETABLE GENERATION TEST             ║');
console.log('╚════════════════════════════════════════╝\n');

testGeneration();
