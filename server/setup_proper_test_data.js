/**
 * Clear all data and populate with proper test data for all algorithms
 */

const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const Division = require('./models/Division');
const Program = require('./models/Program');
const SystemConfig = require('./models/SystemConfig');
require('dotenv').config();

async function clearAndPopulateData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Clear all data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Teacher.deleteMany({}),
      Classroom.deleteMany({}),
      Course.deleteMany({}),
      Division.deleteMany({}),
      Program.deleteMany({}),
      SystemConfig.deleteMany({})
    ]);
    console.log('✅ All data cleared\n');

    // Step 2: Create Programs first
    console.log('📚 Creating programs...');
    const programs = [
      {
        id: 'BTECH-CS-2025',
        name: 'B.Tech Computer Science',
        code: 'BTECH-CS',
        school: 'School of Engineering',
        type: 'Bachelor',
        department: 'Computer Science',
        duration: 4,
        totalSemesters: 8,
        status: 'Active',
        description: 'Bachelor of Technology in Computer Science and Engineering'
      },
      {
        id: 'BTECH-IT-2025',
        name: 'B.Tech Information Technology',
        code: 'BTECH-IT',
        school: 'School of Engineering',
        type: 'Bachelor',
        department: 'Information Technology',
        duration: 4,
        totalSemesters: 8,
        status: 'Active',
        description: 'Bachelor of Technology in Information Technology'
      }
    ];
    const createdPrograms = await Program.insertMany(programs);
    console.log(`✅ Created ${createdPrograms.length} programs\n`);

    // Step 3: Create Divisions
    console.log('📋 Creating divisions...');
    const btechCS = createdPrograms.find(p => p.code === 'BTECH-CS');
    const divisions = [
      {
        id: 'CS-Y1-S1-A',
        name: 'Division A',
        program: btechCS.code,
        year: 1,
        semester: 1,
        studentCount: 60,
        labBatches: 2,
        batches: [
          {
            id: 'CS-Y1-S1-A-B1',
            name: 'Batch A1',
            type: 'Lab',
            studentCount: 30,
            students: []
          },
          {
            id: 'CS-Y1-S1-A-B2',
            name: 'Batch A2',
            type: 'Lab',
            studentCount: 30,
            students: []
          }
        ],
        status: 'Active'
      }
    ];
    const createdDivisions = await Division.insertMany(divisions);
    console.log(`✅ Created ${createdDivisions.length} divisions\n`);

    // Step 4: Create Teachers with proper availability
    console.log('👨‍🏫 Creating teachers...');
    const teachers = [];
    
    // Core CS teachers
    for (let i = 1; i <= 5; i++) {
      teachers.push({
        id: `T${String(i).padStart(3, '0')}`,
        name: `Dr. Teacher ${i}`,
        email: `teacher${i}@college.edu`,
        phone: `+91900000000${i}`,
        department: 'Computer Science',
        designation: i <= 2 ? 'Professor' : 'Associate Professor',
        teacherType: 'core',
        subjects: ['Computer Science', 'Programming'],
        qualification: 'PhD',
        experience: 8 + i,
        maxHoursPerWeek: 20,
        status: 'active',
        availability: {
          monday: { available: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
          thursday: { available: true, startTime: '09:00', endTime: '17:00' },
          friday: { available: true, startTime: '09:00', endTime: '17:00' },
          saturday: { available: false, startTime: '09:00', endTime: '17:00' },
          sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        }
      });
    }

    // Visiting faculty
    for (let i = 6; i <= 8; i++) {
      teachers.push({
        id: `T${String(i).padStart(3, '0')}`,
        name: `Prof. Visiting ${i}`,
        email: `teacher${i}@college.edu`,
        phone: `+91900000000${i}`,
        department: 'Computer Science',
        designation: 'Assistant Professor',
        teacherType: 'visiting',
        subjects: ['Computer Science'],
        qualification: 'M.Tech',
        experience: 5,
        maxHoursPerWeek: 12,
        status: 'active',
        availability: {
          monday: { available: true, startTime: '09:00', endTime: '13:00' },
          tuesday: { available: true, startTime: '09:00', endTime: '13:00' },
          wednesday: { available: true, startTime: '09:00', endTime: '13:00' },
          thursday: { available: false, startTime: '09:00', endTime: '17:00' },
          friday: { available: false, startTime: '09:00', endTime: '17:00' },
          saturday: { available: false, startTime: '09:00', endTime: '17:00' },
          sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        }
      });
    }

    // Math teachers
    for (let i = 9; i <= 11; i++) {
      teachers.push({
        id: `T${String(i).padStart(3, '0')}`,
        name: `Dr. Math Teacher ${i}`,
        email: `teacher${i}@college.edu`,
        phone: `+91900000000${i}`,
        department: 'Mathematics',
        designation: 'Professor',
        teacherType: 'core',
        subjects: ['Mathematics', 'Statistics'],
        qualification: 'PhD',
        experience: 10,
        maxHoursPerWeek: 20,
        status: 'active',
        availability: {
          monday: { available: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
          thursday: { available: true, startTime: '09:00', endTime: '17:00' },
          friday: { available: true, startTime: '09:00', endTime: '17:00' },
          saturday: { available: false, startTime: '09:00', endTime: '17:00' },
          sunday: { available: false, startTime: '09:00', endTime: '17:00' }
        }
      });
    }

    const createdTeachers = await Teacher.insertMany(teachers);
    console.log(`✅ Created ${createdTeachers.length} teachers\n`);

    // Step 3: Create Classrooms with proper features
    console.log('🏫 Creating classrooms...');
    const classrooms = [];

    // Lecture Halls
    for (let i = 1; i <= 10; i++) {
      classrooms.push({
        id: `LH${String(i).padStart(3, '0')}`,
        name: `Lecture Hall ${i}`,
        building: 'Main Block',
        floor: Math.ceil(i / 3),
        type: 'Lecture Hall',
        capacity: 60,
        features: ['Projector', 'Whiteboard', 'Air Conditioning', 'WiFi'],
        status: 'available'
      });
    }

    // Computer Labs
    for (let i = 1; i <= 5; i++) {
      classrooms.push({
        id: `LAB${String(i).padStart(3, '0')}`,
        name: `Computer Lab ${i}`,
        building: 'Lab Block',
        floor: Math.ceil(i / 2),
        type: 'Computer Lab',
        capacity: 30,
        features: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning', 'WiFi', 'Lab Equipment'],
        status: 'available'
      });
    }

    // Tutorial Rooms
    for (let i = 1; i <= 8; i++) {
      classrooms.push({
        id: `TR${String(i).padStart(3, '0')}`,
        name: `Tutorial Room ${i}`,
        building: 'Main Block',
        floor: Math.ceil(i / 3),
        type: 'Tutorial Room',
        capacity: 30,
        features: ['Whiteboard', 'Air Conditioning'],
        status: 'available'
      });
    }

    const createdClassrooms = await Classroom.insertMany(classrooms);
    console.log(`✅ Created ${createdClassrooms.length} classrooms\n`);

    // Step 4: Create Courses with properly assigned teachers
    console.log('📚 Creating courses...');
    const courses = [];

    // Get teacher ObjectIds for references
    const t001 = createdTeachers.find(t => t.id === 'T001');
    const t002 = createdTeachers.find(t => t.id === 'T002');
    const t003 = createdTeachers.find(t => t.id === 'T003');
    const t004 = createdTeachers.find(t => t.id === 'T004');
    const t009 = createdTeachers.find(t => t.id === 'T009');
    const t010 = createdTeachers.find(t => t.id === 'T010');

    // Course 1: Programming Fundamentals
    courses.push({
      id: 'CS101-2025',
      code: 'CS101',
      name: 'Programming Fundamentals',
      department: 'Computer Science',
      program: 'B.Tech',
      semester: 1,
      year: 1,
      credits: 4,
      courseType: 'Core',
      enrolledStudents: 60,
      totalHoursPerWeek: 9, // 3*1 + 2*2 + 1*1
      isActive: true,
      sessions: {
        theory: {
          type: 'Theory',
          sessionsPerWeek: 3,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Projector', 'Whiteboard'],
          minRoomCapacity: 60
        },
        practical: {
          type: 'Practical',
          sessionsPerWeek: 2,
          duration: 120,
          requiresLab: true,
          requiredFeatures: ['Computers', 'Projector', 'Lab Equipment'],
          minRoomCapacity: 30
        },
        tutorial: {
          type: 'Tutorial',
          sessionsPerWeek: 1,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Whiteboard'],
          minRoomCapacity: 30
        }
      },
      assignedTeachers: [
        {
          teacherId: t001.id,
          sessionTypes: ['Theory', 'Tutorial']
        },
        {
          teacherId: t002.id,
          sessionTypes: ['Practical']
        }
      ]
    });

    // Course 2: Data Structures
    courses.push({
      id: 'CS201-2025',
      code: 'CS201',
      name: 'Data Structures',
      department: 'Computer Science',
      program: 'B.Tech',
      semester: 1,
      year: 2,
      credits: 4,
      courseType: 'Core',
      enrolledStudents: 60,
      totalHoursPerWeek: 9,
      isActive: true,
      sessions: {
        theory: {
          type: 'Theory',
          sessionsPerWeek: 3,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Projector', 'Whiteboard'],
          minRoomCapacity: 60
        },
        practical: {
          type: 'Practical',
          sessionsPerWeek: 2,
          duration: 120,
          requiresLab: true,
          requiredFeatures: ['Computers', 'Projector', 'Lab Equipment'],
          minRoomCapacity: 30
        },
        tutorial: {
          type: 'Tutorial',
          sessionsPerWeek: 1,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Whiteboard'],
          minRoomCapacity: 30
        }
      },
      assignedTeachers: [
        {
          teacherId: t002.id,
          sessionTypes: ['Theory', 'Tutorial']
        },
        {
          teacherId: t001.id,
          sessionTypes: ['Practical']
        }
      ]
    });

    // Course 3: Database Systems
    courses.push({
      id: 'CS301-2025',
      code: 'CS301',
      name: 'Database Systems',
      department: 'Computer Science',
      program: 'B.Tech',
      semester: 1,
      year: 3,
      credits: 4,
      courseType: 'Core',
      enrolledStudents: 60,
      totalHoursPerWeek: 9,
      isActive: true,
      sessions: {
        theory: {
          type: 'Theory',
          sessionsPerWeek: 3,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Projector', 'Whiteboard'],
          minRoomCapacity: 60
        },
        practical: {
          type: 'Practical',
          sessionsPerWeek: 2,
          duration: 120,
          requiresLab: true,
          requiredFeatures: ['Computers', 'Projector', 'Lab Equipment'],
          minRoomCapacity: 30
        },
        tutorial: {
          type: 'Tutorial',
          sessionsPerWeek: 1,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Whiteboard'],
          minRoomCapacity: 30
        }
      },
      assignedTeachers: [
        {
          teacherId: t003.id,
          sessionTypes: ['Theory', 'Tutorial']
        },
        {
          teacherId: t004.id,
          sessionTypes: ['Practical']
        }
      ]
    });

    // Course 4: Mathematics I (Theory + Tutorial only)
    courses.push({
      id: 'MATH101-2025',
      code: 'MATH101',
      name: 'Mathematics I',
      department: 'Mathematics',
      program: 'B.Tech',
      semester: 1,
      year: 1,
      credits: 3,
      courseType: 'Core',
      enrolledStudents: 60,
      totalHoursPerWeek: 6, // 4*1 + 2*1
      isActive: true,
      sessions: {
        theory: {
          type: 'Theory',
          sessionsPerWeek: 4,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Whiteboard'],
          minRoomCapacity: 60
        },
        tutorial: {
          type: 'Tutorial',
          sessionsPerWeek: 2,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Whiteboard'],
          minRoomCapacity: 30
        }
      },
      assignedTeachers: [
        {
          teacherId: t009.id,
          sessionTypes: ['Theory', 'Tutorial']
        }
      ]
    });

    // Course 5: Web Development (Elective)
    courses.push({
      id: 'CS401-2025',
      code: 'CS401',
      name: 'Web Development',
      department: 'Computer Science',
      program: 'B.Tech',
      semester: 1,
      year: 4,
      credits: 3,
      courseType: 'Elective',
      enrolledStudents: 30,
      totalHoursPerWeek: 6, // 2*1 + 2*2
      isActive: true,
      isElective: true,
      sessions: {
        theory: {
          type: 'Theory',
          sessionsPerWeek: 2,
          duration: 60,
          requiresLab: false,
          requiredFeatures: ['Projector', 'Whiteboard'],
          minRoomCapacity: 30
        },
        practical: {
          type: 'Practical',
          sessionsPerWeek: 2,
          duration: 120,
          requiresLab: true,
          requiredFeatures: ['Computers', 'Projector', 'Lab Equipment'],
          minRoomCapacity: 30
        }
      },
      assignedTeachers: [
        {
          teacherId: t004.id,
          sessionTypes: ['Theory', 'Practical']
        }
      ]
    });

    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses\n`);

    // Step 6: Create SystemConfig (Calendar)
    console.log('📅 Creating system configuration...');
    const systemConfig = {
      workingHours: {
        startTime: '09:00',
        endTime: '17:00',
        lunchBreakStart: '12:30',
        lunchBreakEnd: '13:30',
        periodDuration: 60,
        breakDuration: 10,
        labPeriodDuration: 120,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        maxPeriodsPerDay: 8
      },
      academicCalendar: {
        academicYearStart: new Date('2025-08-01'),
        academicYearEnd: new Date('2026-05-31'),
        semester1Start: new Date('2025-08-01'),
        semester1End: new Date('2025-12-31'),
        semester2Start: new Date('2026-01-01'),
        semester2End: new Date('2026-05-31'),
        totalWeeks: 16,
        examWeeks: 2,
        vacationWeeks: 4
      },
      generalPolicies: {
        maxConsecutiveHours: 3,
        maxDailyHours: 8,
        minBreakBetweenSessions: 15,
        maxTeachingHoursPerDay: 6,
        preferredClassroomUtilization: 80,
        allowBackToBackLabs: false,
        prioritizeTeacherPreferences: true
      },
      constraintRules: {
        minGapBetweenExams: 2,
        maxSubjectsPerDay: 6,
        preferMorningLabs: true,
        avoidFridayAfternoon: true,
        balanceWorkload: true
      },
      createdBy: 'admin',
      isActive: true
    };

    await SystemConfig.create(systemConfig);
    console.log(`✅ Created system configuration\n`);

    // Verification
    console.log('\n📊 VERIFICATION\n');
    console.log('=' .repeat(60));
    
    for (const course of createdCourses) {
      console.log(`\n📘 ${course.code}: ${course.name}`);
      console.log(`   Department: ${course.department}, Year: ${course.year}, Semester: ${course.semester}`);
      console.log(`   Students: ${course.enrolledStudents}`);
      
      // Populate for display
      const populatedCourse = await Course.findById(course._id).populate('assignedTeachers.teacherId');
      
      ['theory', 'practical', 'tutorial'].forEach(sessionType => {
        const session = populatedCourse.sessions[sessionType];
        if (session && session.sessionsPerWeek > 0) {
          console.log(`\n   ${sessionType.toUpperCase()}:`);
          console.log(`      Sessions/Week: ${session.sessionsPerWeek}`);
          console.log(`      Duration: ${session.duration} mins`);
          console.log(`      Requires Lab: ${session.requiresLab}`);
          console.log(`      Features: ${session.requiredFeatures.join(', ')}`);
          
          const sessionTypeCapitalized = sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
          const teachersForSession = populatedCourse.assignedTeachers.filter(t => 
            t.sessionTypes && t.sessionTypes.includes(sessionTypeCapitalized)
          );
          
          if (teachersForSession.length > 0) {
            console.log(`      Teachers:`);
            teachersForSession.forEach(t => {
              const teacher = t.teacherId;
              console.log(`         ✅ ${teacher.name} (${teacher.id}) - ${teacher.teacherType}`);
            });
          } else {
            console.log(`      ⚠️  NO TEACHERS ASSIGNED`);
          }
        }
      });
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Programs: ${createdPrograms.length}`);
    console.log(`✅ Divisions: ${createdDivisions.length}`);
    console.log(`✅ Teachers: ${createdTeachers.length} (${teachers.filter(t => t.teacherType === 'core').length} core, ${teachers.filter(t => t.teacherType === 'visiting').length} visiting)`);
    console.log(`✅ Classrooms: ${createdClassrooms.length} (${classrooms.filter(c => c.type === 'Lecture Hall').length} lecture halls, ${classrooms.filter(c => c.type === 'Computer Lab').length} labs, ${classrooms.filter(c => c.type === 'Tutorial Room').length} tutorial rooms)`);
    console.log(`✅ Courses: ${createdCourses.length}`);
    console.log(`✅ System Config: 1 (academic year: 2025-2026)`);
    console.log(`\n✅ All data properly structured for all algorithms!`);
    console.log(`\n🚀 You can now test the website - Generate button should be enabled!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

console.log('🔧 CLEAR AND POPULATE TEST DATA');
console.log('='.repeat(60));
console.log('This will:');
console.log('  1. Delete ALL existing data');
console.log('  2. Create proper test data for all algorithms');
console.log('  3. Verify data structure');
console.log('='.repeat(60));
console.log('\nStarting in 2 seconds...\n');

setTimeout(() => {
  clearAndPopulateData();
}, 2000);
