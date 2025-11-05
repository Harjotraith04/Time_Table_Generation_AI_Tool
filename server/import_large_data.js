/**
 * Comprehensive Data Import Script
 * Imports large-scale data with multiple programs, divisions, and batches
 */

const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_db';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Parse CSV file
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Import Teachers
async function importTeachers() {
  console.log('\n📚 Importing Teachers...');
  const filePath = path.join(__dirname, 'sample_teachers_large.csv');
  
  try {
    const rows = await parseCSV(filePath);
    const teachers = [];
    
    for (const row of rows) {
      const teacher = {
        id: row.id,
        name: row.name,
        email: row.email,
        department: row.department,
        expertise: row.expertise ? row.expertise.split('|') : [],
        maxHoursPerWeek: parseInt(row.maxHoursPerWeek) || 20,
        preferredDays: row.preferredDays ? row.preferredDays.split(',') : [],
        unavailableSlots: []
      };
      teachers.push(teacher);
    }
    
    // Clear existing and insert new
    await Teacher.deleteMany({});
    const result = await Teacher.insertMany(teachers);
    console.log(`✅ Imported ${result.length} teachers`);
    
    return result;
  } catch (error) {
    console.error('❌ Error importing teachers:', error);
    throw error;
  }
}

// Import Classrooms
async function importClassrooms() {
  console.log('\n🏫 Importing Classrooms...');
  const filePath = path.join(__dirname, 'sample_classrooms_large.csv');
  
  try {
    const rows = await parseCSV(filePath);
    const classrooms = [];
    
    for (const row of rows) {
      const classroom = {
        id: row.id,
        name: row.name,
        building: row.building,
        floor: parseInt(row.floor) || 1,
        capacity: parseInt(row.capacity) || 30,
        type: row.type || 'Lecture Hall',
        features: row.features ? row.features.split('|') : []
      };
      classrooms.push(classroom);
    }
    
    // Clear existing and insert new
    await Classroom.deleteMany({});
    const result = await Classroom.insertMany(classrooms);
    console.log(`✅ Imported ${result.length} classrooms`);
    
    return result;
  } catch (error) {
    console.error('❌ Error importing classrooms:', error);
    throw error;
  }
}

// Import Courses with Divisions and Batches
async function importCourses() {
  console.log('\n📖 Importing Courses with Divisions...');
  const filePath = path.join(__dirname, 'sample_courses_large.csv');
  
  try {
    const rows = await parseCSV(filePath);
    const courses = [];
    
    for (const row of rows) {
      // Build divisions array
      const divisions = [];
      
      // Division A
      if (row.divisionA_students && parseInt(row.divisionA_students) > 0) {
        const division = {
          divisionId: 'A',
          studentCount: parseInt(row.divisionA_students),
          batches: []
        };
        
        // Parse batches for Division A
        if (row.divisionA_batches) {
          const batchPairs = row.divisionA_batches.split(';');
          for (const pair of batchPairs) {
            const [batchId, count] = pair.split(':');
            if (batchId && count) {
              division.batches.push({
                batchId: batchId.trim(),
                studentCount: parseInt(count),
                type: 'Lab'
              });
            }
          }
        }
        
        divisions.push(division);
      }
      
      // Division B
      if (row.divisionB_students && parseInt(row.divisionB_students) > 0) {
        const division = {
          divisionId: 'B',
          studentCount: parseInt(row.divisionB_students),
          batches: []
        };
        
        if (row.divisionB_batches) {
          const batchPairs = row.divisionB_batches.split(';');
          for (const pair of batchPairs) {
            const [batchId, count] = pair.split(':');
            if (batchId && count) {
              division.batches.push({
                batchId: batchId.trim(),
                studentCount: parseInt(count),
                type: 'Lab'
              });
            }
          }
        }
        
        divisions.push(division);
      }
      
      // Division C
      if (row.divisionC_students && parseInt(row.divisionC_students) > 0) {
        const division = {
          divisionId: 'C',
          studentCount: parseInt(row.divisionC_students),
          batches: []
        };
        
        if (row.divisionC_batches) {
          const batchPairs = row.divisionC_batches.split(';');
          for (const pair of batchPairs) {
            const [batchId, count] = pair.split(':');
            if (batchId && count) {
              division.batches.push({
                batchId: batchId.trim(),
                studentCount: parseInt(count),
                type: 'Lab'
              });
            }
          }
        }
        
        divisions.push(division);
      }
      
      // Parse assigned teachers
      const assignedTeachers = [];
      if (row.assignedTeachers) {
        const teacherPairs = row.assignedTeachers.split(';');
        for (const pair of teacherPairs) {
          const [teacherId, sessionTypes] = pair.split(':');
          if (teacherId && sessionTypes) {
            assignedTeachers.push({
              teacherId: teacherId.trim(),
              sessionTypes: [sessionTypes.trim()]
            });
          }
        }
      }
      
      // Build sessions
      const sessions = {};
      
      // Theory sessions
      if (row.theorySessionsPerWeek && parseInt(row.theorySessionsPerWeek) > 0) {
        sessions.theory = {
          type: 'Theory',
          duration: parseInt(row.theoryDuration) || 60,
          sessionsPerWeek: parseInt(row.theorySessionsPerWeek),
          requiresLab: row.theoryRequiresLab === 'true',
          minRoomCapacity: parseInt(row.enrolledStudents) || 30,
          requiredFeatures: ['Projector', 'Whiteboard']
        };
      }
      
      // Practical sessions
      if (row.practicalSessionsPerWeek && parseInt(row.practicalSessionsPerWeek) > 0) {
        sessions.practical = {
          type: 'Practical',
          duration: parseInt(row.practicalDuration) || 120,
          sessionsPerWeek: parseInt(row.practicalSessionsPerWeek),
          requiresLab: row.practicalRequiresLab === 'true',
          minRoomCapacity: 35,
          requiredFeatures: row.practicalRequiresLab === 'true' ? 
            ['Computers', 'Projector', 'Internet'] : ['Projector', 'Whiteboard']
        };
      }
      
      // Tutorial sessions
      if (row.tutorialSessionsPerWeek && parseInt(row.tutorialSessionsPerWeek) > 0) {
        sessions.tutorial = {
          type: 'Tutorial',
          duration: parseInt(row.tutorialDuration) || 60,
          sessionsPerWeek: parseInt(row.tutorialSessionsPerWeek),
          requiresLab: row.tutorialRequiresLab === 'true',
          minRoomCapacity: 40,
          requiredFeatures: ['Whiteboard']
        };
      }
      
      const course = {
        id: row.id,
        name: row.name,
        code: row.code,
        department: row.department,
        program: row.program,
        year: parseInt(row.year),
        semester: parseInt(row.semester),
        credits: parseInt(row.credits),
        totalHoursPerWeek: parseInt(row.totalHoursPerWeek),
        enrolledStudents: parseInt(row.enrolledStudents),
        divisions: divisions,
        assignedTeachers: assignedTeachers,
        sessions: sessions
      };
      
      courses.push(course);
    }
    
    // Clear existing and insert new
    await Course.deleteMany({});
    const result = await Course.insertMany(courses);
    console.log(`✅ Imported ${result.length} courses`);
    
    // Print summary
    console.log('\n📊 Course Import Summary:');
    const programs = [...new Set(courses.map(c => c.program))];
    for (const program of programs) {
      const programCourses = courses.filter(c => c.program === program);
      const totalDivisions = programCourses.reduce((sum, c) => sum + c.divisions.length, 0);
      const totalBatches = programCourses.reduce((sum, c) => 
        sum + c.divisions.reduce((bSum, d) => bSum + d.batches.length, 0), 0);
      
      console.log(`  ${program}:`);
      console.log(`    - Courses: ${programCourses.length}`);
      console.log(`    - Divisions: ${totalDivisions}`);
      console.log(`    - Batches: ${totalBatches}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error importing courses:', error);
    throw error;
  }
}

// Print statistics
async function printStatistics() {
  console.log('\n📈 Database Statistics:');
  
  const teacherCount = await Teacher.countDocuments();
  const classroomCount = await Classroom.countDocuments();
  const courseCount = await Course.countDocuments();
  
  const labs = await Classroom.countDocuments({ type: 'Computer Lab' });
  const lectureHalls = await Classroom.countDocuments({ type: 'Lecture Hall' });
  
  console.log(`  Teachers: ${teacherCount}`);
  console.log(`  Classrooms: ${classroomCount}`);
  console.log(`    - Lecture Halls: ${lectureHalls}`);
  console.log(`    - Computer Labs: ${labs}`);
  console.log(`  Courses: ${courseCount}`);
  
  const courses = await Course.find();
  const totalDivisions = courses.reduce((sum, c) => sum + (c.divisions?.length || 0), 0);
  const totalBatches = courses.reduce((sum, c) => 
    sum + (c.divisions?.reduce((bSum, d) => bSum + (d.batches?.length || 0), 0) || 0), 0);
  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents, 0);
  
  console.log(`  Total Divisions: ${totalDivisions}`);
  console.log(`  Total Batches: ${totalBatches}`);
  console.log(`  Total Students: ${totalStudents}`);
}

// Main import function
async function main() {
  console.log('🚀 Starting Large-Scale Data Import...');
  console.log('=====================================');
  
  await connectDB();
  
  try {
    await importTeachers();
    await importClassrooms();
    await importCourses();
    
    await printStatistics();
    
    console.log('\n✅ All data imported successfully!');
    console.log('=====================================');
    console.log('\n💡 Next Steps:');
    console.log('  1. Start your server: npm start');
    console.log('  2. Generate timetables for each program');
    console.log('  3. Use the "By Batch" view to see division-specific schedules');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run import
main();
