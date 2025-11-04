const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const OptimizationEngine = require('./algorithms/OptimizationEngine');
require('dotenv').config();

async function debugGeneration() {
  try {
    console.log('=== DEBUGGING TIMETABLE GENERATION ===\n');
    
    // Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Fetch data
    console.log('2. Fetching data from database...');
    const teachers = await Teacher.find({ status: 'active' });
    const classrooms = await Classroom.find({ status: 'available' });
    const courses = await Course.find({ isActive: true });

    console.log(`✓ Data fetched:`);
    console.log(`  - Teachers: ${teachers.length}`);
    console.log(`  - Classrooms: ${classrooms.length}`);
    console.log(`  - Courses: ${courses.length}\n`);

    // Log detailed information
    console.log('3. Data Details:');
    console.log('\nTeachers:');
    teachers.forEach(t => {
      console.log(`  - ${t.name} (${t.employeeId})`);
      console.log(`    Subjects: ${t.subjects.join(', ')}`);
      console.log(`    Availability: ${t.availability ? 'Yes' : 'No'}`);
    });

    console.log('\nClassrooms:');
    classrooms.forEach(c => {
      console.log(`  - ${c.name} (${c.roomNumber})`);
      console.log(`    Capacity: ${c.capacity}`);
      console.log(`    Type: ${c.type}`);
    });

    console.log('\nCourses:');
    courses.forEach(c => {
      console.log(`  - ${c.name} (${c.code})`);
      console.log(`    Assigned Teachers: ${c.assignedTeachers.length}`);
      console.log(`    Theory sessions: ${c.sessions?.theory?.sessionsPerWeek || 0}`);
      console.log(`    Practical sessions: ${c.sessions?.practical?.sessionsPerWeek || 0}`);
      console.log(`    Tutorial sessions: ${c.sessions?.tutorial?.sessionsPerWeek || 0}`);
    });

    // Initialize optimization engine
    console.log('\n4. Initializing OptimizationEngine...');
    const engine = new OptimizationEngine();
    console.log('✓ Engine initialized\n');

    // Validate data
    console.log('5. Validating input data...');
    const validation = engine.validateInputData(teachers, classrooms, courses);
    
    if (!validation.valid) {
      console.error('✗ VALIDATION FAILED!');
      console.error('\nIssues found:');
      validation.issues.forEach((issue, idx) => {
        console.error(`  ${idx + 1}. ${issue}`);
      });
      console.error('\nReason:', validation.reason);
      process.exit(1);
    }

    console.log('✓ Validation passed!\n');

    // Run generation with progress tracking
    console.log('6. Starting timetable generation...');
    console.log('Algorithm: greedy\n');

    const settings = {
      algorithm: 'greedy',
      maxIterations: 1000,
      populationSize: 100,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      optimizationGoals: ['minimize_conflicts', 'balanced_schedule'],
      allowBackToBack: true,
      enforceBreaks: true,
      balanceWorkload: true
    };

    const startTime = Date.now();
    
    const result = await engine.optimize(
      teachers,
      classrooms,
      courses,
      settings,
      (progress, step, generation, fitness) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Progress: ${progress.toFixed(1)}% | Step: ${step} | Elapsed: ${elapsed}s`);
        if (generation !== undefined) {
          console.log(`  Generation: ${generation}, Fitness: ${fitness?.toFixed(4) || 'N/A'}`);
        }
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n7. Generation Result:');
    console.log(`Duration: ${duration}s`);
    
    if (result.success) {
      console.log('✓ SUCCESS!');
      console.log('\nMetrics:');
      console.log(`  - Quality Score: ${result.metrics?.qualityMetrics?.overallScore || 'N/A'}`);
      console.log(`  - Conflicts: ${result.conflicts?.length || 0}`);
      console.log(`  - Schedule slots: ${Object.keys(result.solution || {}).length}`);
      
      if (result.conflicts && result.conflicts.length > 0) {
        console.log('\nConflicts found:');
        result.conflicts.slice(0, 5).forEach((conflict, idx) => {
          console.log(`  ${idx + 1}. ${conflict.type}: ${conflict.description}`);
        });
        if (result.conflicts.length > 5) {
          console.log(`  ... and ${result.conflicts.length - 5} more`);
        }
      }
    } else {
      console.error('✗ GENERATION FAILED!');
      console.error('Reason:', result.reason);
      if (result.validationErrors) {
        console.error('\nValidation Errors:');
        result.validationErrors.forEach((err, idx) => {
          console.error(`  ${idx + 1}. ${err}`);
        });
      }
    }

    console.log('\n=== DEBUG COMPLETE ===');

  } catch (error) {
    console.error('\n✗ ERROR during debugging:');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
}

debugGeneration();
