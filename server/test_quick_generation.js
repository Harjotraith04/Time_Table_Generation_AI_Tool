// Quick test to see if generation is working
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const Timetable = require('./models/Timetable');
const OptimizationEngine = require('./algorithms/OptimizationEngine');
require('dotenv').config();

async function testQuickGeneration() {
  try {
    console.log('='.repeat(60));
    console.log('QUICK GENERATION TEST');
    console.log('='.repeat(60));
    
    // Connect
    console.log('\n1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected\n');

    // Fetch data
    console.log('2. Fetching data...');
    const teachers = await Teacher.find({ status: 'active' });
    const classrooms = await Classroom.find({ status: 'available' });
    const courses = await Course.find({ isActive: true });
    
    console.log(`✓ Teachers: ${teachers.length}`);
    console.log(`✓ Classrooms: ${classrooms.length}`);
    console.log(`✓ Courses: ${courses.length}\n`);

    // Create a test timetable record
    console.log('3. Creating timetable record...');
    const timetable = new Timetable({
      name: 'Quick Test ' + Date.now(),
      academicYear: '2024-2025',
      semester: 1,
      department: 'Computer Science',
      year: 1,
      status: 'generating',
      generationSettings: {
        algorithm: 'greedy',
        maxIterations: 1000,
        populationSize: 100,
        crossoverRate: 0.8,
        mutationRate: 0.1,
        optimizationGoals: ['minimize_conflicts', 'balanced_schedule']
      },
      createdBy: new mongoose.Types.ObjectId()
    });
    
    await timetable.save();
    console.log(`✓ Created timetable: ${timetable._id}\n`);

    // Run generation
    console.log('4. Running optimization engine...');
    const engine = new OptimizationEngine();
    
    const settings = {
      algorithm: 'greedy',
      maxIterations: 1000,
      populationSize: 100
    };

    const startTime = Date.now();
    let lastProgress = 0;
    
    const result = await engine.optimize(
      teachers,
      classrooms,
      courses,
      settings,
      (progress, step) => {
        if (progress - lastProgress >= 10) {
          console.log(`   Progress: ${progress.toFixed(1)}% - ${step}`);
          lastProgress = progress;
        }
      }
    );

    const duration = Date.now() - startTime;

    console.log('\n5. Result:');
    console.log(`✓ Success: ${result.success}`);
    console.log(`✓ Duration: ${duration}ms`);
    console.log(`✓ Schedule slots: ${result.solution?.length || 0}`);
    console.log(`✓ Conflicts: ${result.conflicts?.length || 0}`);

    // Update timetable
    if (result.success) {
      timetable.status = 'completed';
      timetable.schedule = result.solution;
      timetable.conflicts = result.conflicts || [];
      timetable.metrics = result.metrics;
      await timetable.save();
      console.log('✓ Timetable updated in database\n');
    }

    console.log('='.repeat(60));
    console.log('TEST COMPLETE!');
    console.log('='.repeat(60));

    // Show the timetable ID for viewing
    console.log(`\nView this timetable in UI using ID: ${timetable._id}`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

testQuickGeneration();
