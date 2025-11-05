/**
 * Comprehensive Algorithm Testing Script
 * Tests all 5 algorithms (excluding Greedy) with sample data
 */

const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const GreedyScheduler = require('./algorithms/GreedyScheduler');
const CSPSolver = require('./algorithms/CSPSolver');
const GeneticAlgorithm = require('./algorithms/GeneticAlgorithm');
const BacktrackingSearch = require('./algorithms/BacktrackingSearch');
const SimulatedAnnealing = require('./algorithms/SimulatedAnnealing');
const OptimizationEngine = require('./algorithms/OptimizationEngine');
const config = require('./config/config');
const logger = require('./utils/logger');

// Test data
const sampleTeachers = [
  {
    id: 'T001',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    department: 'Computer Engineering',
    designation: 'Professor',
    teacherType: 'visiting', // Visiting faculty - should be prioritized
    subjects: ['Data Structures', 'Algorithms'],
    maxHoursPerWeek: 20,
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '15:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '15:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '15:00' },
      thursday: { available: false },
      friday: { available: false }
    },
    priority: 'high',
    status: 'active'
  },
  {
    id: 'T002',
    name: 'Prof. Sarah Johnson',
    email: 'sarah.j@university.edu',
    department: 'Computer Engineering',
    designation: 'Associate Professor',
    teacherType: 'core', // Core faculty
    subjects: ['Database Systems', 'Data Structures'],
    maxHoursPerWeek: 24,
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' }
    },
    priority: 'medium',
    status: 'active'
  },
  {
    id: 'T003',
    name: 'Dr. Michael Brown',
    email: 'michael.b@university.edu',
    department: 'Computer Engineering',
    designation: 'Assistant Professor',
    teacherType: 'core',
    subjects: ['Operating Systems', 'Computer Networks'],
    maxHoursPerWeek: 24,
    availability: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' }
    },
    priority: 'medium',
    status: 'active'
  }
];

const sampleClassrooms = [
  {
    id: 'R101',
    name: 'Computer Lab 1',
    building: 'A Block',
    floor: '1',
    capacity: 30,
    type: 'Computer Lab',
    features: ['Computers', 'Projector', 'Air Conditioning', 'WiFi'],
    status: 'available',
    availability: {
      monday: { available: true, startTime: '08:00', endTime: '18:00' },
      tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
      wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
      thursday: { available: true, startTime: '08:00', endTime: '18:00' },
      friday: { available: true, startTime: '08:00', endTime: '18:00' }
    }
  },
  {
    id: 'R201',
    name: 'Lecture Hall 1',
    building: 'A Block',
    floor: '2',
    capacity: 60,
    type: 'Lecture Hall',
    features: ['Projector', 'Sound System', 'Air Conditioning', 'WiFi'],
    status: 'available',
    availability: {
      monday: { available: true, startTime: '08:00', endTime: '18:00' },
      tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
      wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
      thursday: { available: true, startTime: '08:00', endTime: '18:00' },
      friday: { available: true, startTime: '08:00', endTime: '18:00' }
    }
  },
  {
    id: 'R202',
    name: 'Lecture Hall 2',
    building: 'A Block',
    floor: '2',
    capacity: 60,
    type: 'Lecture Hall',
    features: ['Projector', 'Air Conditioning', 'WiFi'],
    status: 'available',
    availability: {
      monday: { available: true, startTime: '08:00', endTime: '18:00' },
      tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
      wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
      thursday: { available: true, startTime: '08:00', endTime: '18:00' },
      friday: { available: true, startTime: '08:00', endTime: '18:00' }
    }
  }
];

const sampleCourses = [
  {
    id: 'C001',
    name: 'Data Structures',
    code: 'CS201',
    department: 'Computer Engineering',
    program: 'Computer Engineering',
    year: 2,
    semester: 1,
    credits: 4,
    enrolledStudents: 60,
    isCore: true,
    sessions: {
      theory: {
        type: 'Theory',
        duration: 60,
        sessionsPerWeek: 3,
        requiredFeatures: ['Projector'],
        minRoomCapacity: 60
      },
      practical: {
        type: 'Practical',
        duration: 120,
        sessionsPerWeek: 1,
        requiresLab: true,
        requiredFeatures: ['Computers'],
        minRoomCapacity: 30
      }
    },
    divisions: [
      {
        divisionId: 'A',
        studentCount: 60,
        batches: [
          { batchId: 'A1', studentCount: 30, type: 'Lab' },
          { batchId: 'A2', studentCount: 30, type: 'Lab' }
        ]
      }
    ],
    assignedTeachers: [
      {
        teacherId: 'T001',
        sessionTypes: ['Theory', 'Practical'],
        isPrimary: true
      }
    ],
    priority: 'high'
  },
  {
    id: 'C002',
    name: 'Database Systems',
    code: 'CS202',
    department: 'Computer Engineering',
    program: 'Computer Engineering',
    year: 2,
    semester: 1,
    credits: 4,
    enrolledStudents: 60,
    isCore: true,
    sessions: {
      theory: {
        type: 'Theory',
        duration: 60,
        sessionsPerWeek: 2,
        requiredFeatures: ['Projector'],
        minRoomCapacity: 60
      },
      practical: {
        type: 'Practical',
        duration: 120,
        sessionsPerWeek: 1,
        requiresLab: true,
        requiredFeatures: ['Computers'],
        minRoomCapacity: 30
      }
    },
    divisions: [
      {
        divisionId: 'A',
        studentCount: 60,
        batches: [
          { batchId: 'A1', studentCount: 30, type: 'Lab' },
          { batchId: 'A2', studentCount: 30, type: 'Lab' }
        ]
      }
    ],
    assignedTeachers: [
      {
        teacherId: 'T002',
        sessionTypes: ['Theory', 'Practical'],
        isPrimary: true
      }
    ],
    priority: 'high'
  },
  {
    id: 'C003',
    name: 'Elective - Machine Learning',
    code: 'CS301',
    department: 'Computer Engineering',
    program: 'Computer Engineering',
    year: 2,
    semester: 1,
    credits: 3,
    enrolledStudents: 20,
    isCore: false, // Elective course
    sessions: {
      theory: {
        type: 'Theory',
        duration: 60,
        sessionsPerWeek: 2,
        requiredFeatures: ['Projector'],
        minRoomCapacity: 20
      }
    },
    assignedTeachers: [
      {
        teacherId: 'T002',
        sessionTypes: ['Theory'],
        isPrimary: true
      }
    ],
    priority: 'medium'
  },
  {
    id: 'C004',
    name: 'Elective - Web Development',
    code: 'CS302',
    department: 'Computer Engineering',
    program: 'Computer Engineering',
    year: 2,
    semester: 1,
    credits: 3,
    enrolledStudents: 20,
    isCore: false, // Elective course (can run simultaneously with C003)
    sessions: {
      theory: {
        type: 'Theory',
        duration: 60,
        sessionsPerWeek: 2,
        requiredFeatures: ['Projector'],
        minRoomCapacity: 20
      }
    },
    assignedTeachers: [
      {
        teacherId: 'T003',
        sessionTypes: ['Theory'],
        isPrimary: true
      }
    ],
    priority: 'medium'
  }
];

const testSettings = {
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 60,
  breakSlots: ['12:00-13:00']
};

/**
 * Test a specific algorithm
 */
async function testAlgorithm(algorithmName, AlgorithmClass, settings = {}) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${algorithmName}`);
  console.log('='.repeat(80));

  const startTime = Date.now();
  
  try {
    const algorithm = new AlgorithmClass(
      sampleTeachers,
      sampleClassrooms,
      sampleCourses,
      { ...testSettings, ...settings }
    );

    const progressCallback = (progress, message) => {
      console.log(`  Progress: ${progress.toFixed(1)}% - ${message}`);
    };

    const result = await algorithm.solve(progressCallback);

    const duration = Date.now() - startTime;

    console.log(`\n${algorithmName} Results:`);
    console.log(`  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`  Success: ${result.success}`);
    
    if (result.success) {
      console.log(`  ✅ Solution Found!`);
      console.log(`  Scheduled Sessions: ${result.solution?.length || 0}`);
      console.log(`  Conflicts: ${result.conflicts?.length || 0}`);
      
      if (result.metrics) {
        console.log(`  Metrics:`, result.metrics);
      }

      // Validate solution
      const validation = validateSolution(result.solution, algorithmName);
      console.log(`\n  Validation:`);
      console.log(`    Teacher Conflicts: ${validation.teacherConflicts}`);
      console.log(`    Classroom Conflicts: ${validation.classroomConflicts}`);
      console.log(`    Student Conflicts: ${validation.studentConflicts}`);
      console.log(`    Visiting Faculty Scheduled: ${validation.visitingFacultyScheduled}`);
      console.log(`    Electives Handled: ${validation.electivesHandled}`);

      // Show sample schedule entries
      if (result.solution && result.solution.length > 0) {
        console.log(`\n  Sample Schedule Entries (first 3):`);
        result.solution.slice(0, 3).forEach((entry, idx) => {
          console.log(`    ${idx + 1}. ${entry.courseName} (${entry.sessionType})`);
          console.log(`       Teacher: ${entry.teacherName}`);
          console.log(`       Room: ${entry.classroomName}`);
          console.log(`       Time: ${entry.day} ${entry.startTime}-${entry.endTime}`);
          if (entry.batchId) console.log(`       Batch: ${entry.batchId}`);
        });
      }
    } else {
      console.log(`  ❌ Failed: ${result.reason}`);
    }

    return {
      algorithm: algorithmName,
      success: result.success,
      duration,
      sessionsScheduled: result.solution?.length || 0,
      conflicts: result.conflicts?.length || 0
    };

  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    return {
      algorithm: algorithmName,
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Validate solution for conflicts
 */
function validateSolution(solution, algorithmName) {
  const validation = {
    teacherConflicts: 0,
    classroomConflicts: 0,
    studentConflicts: 0,
    visitingFacultyScheduled: 0,
    electivesHandled: 0
  };

  if (!solution || solution.length === 0) {
    return validation;
  }

  // Check teacher conflicts
  const teacherSchedules = new Map();
  solution.forEach(entry => {
    if (!teacherSchedules.has(entry.teacherId)) {
      teacherSchedules.set(entry.teacherId, []);
    }
    teacherSchedules.get(entry.teacherId).push(entry);
  });

  teacherSchedules.forEach((slots, teacherId) => {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (slots[i].day === slots[j].day) {
          const overlap = timeOverlaps(
            slots[i].startTime, slots[i].endTime,
            slots[j].startTime, slots[j].endTime
          );
          if (overlap) {
            validation.teacherConflicts++;
            console.log(`    ⚠️  Teacher conflict: ${slots[i].teacherName} on ${slots[i].day}`);
          }
        }
      }
    }
  });

  // Check classroom conflicts
  const classroomSchedules = new Map();
  solution.forEach(entry => {
    if (!classroomSchedules.has(entry.classroomId)) {
      classroomSchedules.set(entry.classroomId, []);
    }
    classroomSchedules.get(entry.classroomId).push(entry);
  });

  classroomSchedules.forEach((slots, classroomId) => {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (slots[i].day === slots[j].day) {
          const overlap = timeOverlaps(
            slots[i].startTime, slots[i].endTime,
            slots[j].startTime, slots[j].endTime
          );
          if (overlap) {
            // Allow lab simultaneous sessions
            const isLabException = 
              slots[i].sessionType === 'Practical' &&
              slots[j].sessionType === 'Practical' &&
              slots[i].teacherId !== slots[j].teacherId;
            
            if (!isLabException) {
              validation.classroomConflicts++;
              console.log(`    ⚠️  Classroom conflict: ${slots[i].classroomName} on ${slots[i].day}`);
            }
          }
        }
      }
    }
  });

  // Count visiting faculty scheduled
  solution.forEach(entry => {
    const teacher = sampleTeachers.find(t => t.id === entry.teacherId);
    if (teacher && teacher.teacherType === 'visiting') {
      validation.visitingFacultyScheduled++;
    }
  });

  // Count electives handled
  solution.forEach(entry => {
    const course = sampleCourses.find(c => c.id === entry.courseId);
    if (course && !course.isCore) {
      validation.electivesHandled++;
    }
  });

  return validation;
}

/**
 * Check if two time ranges overlap
 */
function timeOverlaps(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         TIMETABLE GENERATION ALGORITHMS - COMPREHENSIVE TEST SUITE           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\nTest Configuration:');
  console.log(`  Teachers: ${sampleTeachers.length} (1 visiting, 2 core)`);
  console.log(`  Classrooms: ${sampleClassrooms.length} (1 lab, 2 lecture halls)`);
  console.log(`  Courses: ${sampleCourses.length} (2 core + 2 electives with lab batches)`);
  console.log(`  Working Days: ${testSettings.workingDays.join(', ')}`);
  console.log(`  Time: ${testSettings.startTime} - ${testSettings.endTime}`);

  const results = [];

  // Test 1: Greedy (Baseline)
  results.push(await testAlgorithm('Greedy Scheduler', GreedyScheduler));

  // Test 2: Backtracking Search
  results.push(await testAlgorithm('Backtracking Search', BacktrackingSearch, {
    maxBacktracks: 5000
  }));

  // Test 3: Simulated Annealing
  results.push(await testAlgorithm('Simulated Annealing', SimulatedAnnealing, {
    maxIterations: 5000,
    initialTemperature: 1000,
    coolingRate: 0.995
  }));

  // Test 4: CSP Solver
  results.push(await testAlgorithm('CSP Solver', CSPSolver, {
    maxBacktrackingSteps: 5000
  }));

  // Test 5: Genetic Algorithm
  results.push(await testAlgorithm('Genetic Algorithm', GeneticAlgorithm, {
    populationSize: 50,
    maxGenerations: 200,
    crossoverRate: 0.8,
    mutationRate: 0.1
  }));

  // Test 6: Hybrid (via OptimizationEngine)
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: Hybrid CSP-GA (via OptimizationEngine)`);
  console.log('='.repeat(80));
  
  const startTime = Date.now();
  try {
    const engine = new OptimizationEngine();
    const result = await engine.hybridAlgorithm(
      sampleTeachers,
      sampleClassrooms,
      sampleCourses,
      { ...testSettings, maxGenerations: 100, maxBacktrackingSteps: 3000 }
    );
    
    const duration = Date.now() - startTime;
    console.log(`  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`  Success: ${result.success}`);
    
    if (result.success) {
      console.log(`  ✅ Solution Found!`);
      console.log(`  Scheduled Sessions: ${result.solution?.length || 0}`);
    }
    
    results.push({
      algorithm: 'Hybrid CSP-GA',
      success: result.success,
      duration,
      sessionsScheduled: result.solution?.length || 0
    });
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    results.push({
      algorithm: 'Hybrid CSP-GA',
      success: false,
      error: error.message
    });
  }

  // Summary
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              TEST SUMMARY                                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  console.table(results.map(r => ({
    Algorithm: r.algorithm,
    Status: r.success ? '✅ Success' : '❌ Failed',
    'Duration (s)': r.duration ? (r.duration / 1000).toFixed(2) : 'N/A',
    'Sessions': r.sessionsScheduled || 0,
    'Conflicts': r.conflicts || 0
  })));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\nOverall Results: ${successCount}/${totalCount} algorithms working correctly`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 ALL ALGORITHMS PASSING! 🎉\n');
  } else {
    console.log(`\n⚠️  ${totalCount - successCount} algorithm(s) need attention\n`);
  }
}

// Run tests
runTests().then(() => {
  console.log('\nTest execution completed.');
  process.exit(0);
}).catch(error => {
  console.error('\nFatal test error:', error);
  process.exit(1);
});
