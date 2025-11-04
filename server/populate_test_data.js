/**
 * Populate database with comprehensive test data
 * 10 items in each collection for realistic testing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
const Program = require('./models/Program');
const Division = require('./models/Division');
const Student = require('./models/Student');
const SystemConfig = require('./models/SystemConfig');

async function clearExistingData() {
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    Teacher.deleteMany({}),
    Classroom.deleteMany({}),
    Course.deleteMany({}),
    Program.deleteMany({}),
    Division.deleteMany({}),
    Student.deleteMany({}),
    SystemConfig.deleteMany({})
  ]);
  console.log('✅ Existing data cleared\n');
}

async function populateTeachers() {
  console.log('👨‍🏫 Creating 10 teachers...');
  
  const teachers = [
    {
      id: 'T001',
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      phone: '+1234567890',
      department: 'Computer Science',
      designation: 'Professor',
      qualification: 'PhD in Computer Science',
      experience: '15 years',
      subjects: ['Data Structures', 'Algorithms', 'Programming'],
      maxHoursPerWeek: 20,
      status: 'active'
    },
    {
      id: 'T002',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      phone: '+1234567891',
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'PhD in Software Engineering',
      experience: '10 years',
      subjects: ['Database Management', 'Software Engineering', 'Web Development'],
      maxHoursPerWeek: 20,
      status: 'active'
    },
    {
      id: 'T003',
      name: 'Prof. Michael Brown',
      email: 'michael.brown@university.edu',
      phone: '+1234567892',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      qualification: 'PhD in Artificial Intelligence',
      experience: '8 years',
      subjects: ['Machine Learning', 'Artificial Intelligence', 'Python Programming'],
      maxHoursPerWeek: 18,
      status: 'active'
    },
    {
      id: 'T004',
      name: 'Dr. Emily Davis',
      email: 'emily.davis@university.edu',
      phone: '+1234567893',
      department: 'Computer Science',
      designation: 'Professor',
      qualification: 'PhD in Computer Networks',
      experience: '12 years',
      subjects: ['Computer Networks', 'Operating Systems', 'Cyber Security'],
      maxHoursPerWeek: 20,
      status: 'active'
    },
    {
      id: 'T005',
      name: 'Dr. Robert Wilson',
      email: 'robert.wilson@university.edu',
      phone: '+1234567894',
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'PhD in Data Science',
      experience: '9 years',
      subjects: ['Data Analytics', 'Big Data', 'Statistics'],
      maxHoursPerWeek: 18,
      status: 'active'
    },
    {
      id: 'T006',
      name: 'Prof. Jennifer Martinez',
      email: 'jennifer.martinez@university.edu',
      phone: '+1234567895',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      qualification: 'PhD in Cloud Computing',
      experience: '7 years',
      subjects: ['Cloud Computing', 'Distributed Systems', 'DevOps'],
      maxHoursPerWeek: 18,
      status: 'active'
    },
    {
      id: 'T007',
      name: 'Dr. David Anderson',
      email: 'david.anderson@university.edu',
      phone: '+1234567896',
      department: 'Computer Science',
      designation: 'Lecturer',
      qualification: 'MTech in Computer Science',
      experience: '5 years',
      subjects: ['Java Programming', 'Object Oriented Programming', 'Design Patterns'],
      maxHoursPerWeek: 16,
      status: 'active'
    },
    {
      id: 'T008',
      name: 'Dr. Lisa Thompson',
      email: 'lisa.thompson@university.edu',
      phone: '+1234567897',
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: 'PhD in Mobile Computing',
      experience: '11 years',
      subjects: ['Mobile Application Development', 'Android', 'iOS Development'],
      maxHoursPerWeek: 20,
      status: 'active'
    },
    {
      id: 'T009',
      name: 'Prof. James White',
      email: 'james.white@university.edu',
      phone: '+1234567898',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      qualification: 'PhD in Information Systems',
      experience: '6 years',
      subjects: ['Information Systems', 'Project Management', 'System Analysis'],
      maxHoursPerWeek: 18,
      status: 'active'
    },
    {
      id: 'T010',
      name: 'Dr. Maria Garcia',
      email: 'maria.garcia@university.edu',
      phone: '+1234567899',
      department: 'Computer Science',
      designation: 'Professor',
      qualification: 'PhD in Graphics & Visualization',
      experience: '14 years',
      subjects: ['Computer Graphics', 'Image Processing', 'Multimedia Systems'],
      maxHoursPerWeek: 20,
      status: 'active'
    }
  ];

  await Teacher.insertMany(teachers);
  console.log('✅ Created 10 teachers\n');
}

async function populateClassrooms() {
  console.log('🏫 Creating 10 classrooms...');
  
  const classrooms = [
    {
      id: 'CR001',
      name: 'Room 101',
      building: 'Main Building',
      floor: 1,
      capacity: 60,
      type: 'Lecture Hall',
      features: ['Projector', 'Whiteboard', 'Air Conditioning', 'Microphone System'],
      status: 'available'
    },
    {
      id: 'CR002',
      name: 'Lab A',
      building: 'CS Block',
      floor: 1,
      capacity: 40,
      type: 'Computer Lab',
      features: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning'],
      status: 'available'
    },
    {
      id: 'CR003',
      name: 'Room 201',
      building: 'Main Building',
      floor: 2,
      capacity: 50,
      type: 'Lecture Hall',
      features: ['Projector', 'Whiteboard', 'Air Conditioning'],
      status: 'available'
    },
    {
      id: 'CR004',
      name: 'Lab B',
      building: 'CS Block',
      floor: 2,
      capacity: 35,
      type: 'Computer Lab',
      features: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning', 'Smart Board'],
      status: 'available'
    },
    {
      id: 'CR005',
      name: 'Room 301',
      building: 'Main Building',
      floor: 3,
      capacity: 55,
      type: 'Lecture Hall',
      features: ['Projector', 'Whiteboard', 'Air Conditioning', 'Sound System'],
      status: 'available'
    },
    {
      id: 'CR006',
      name: 'Seminar Hall',
      building: 'Admin Block',
      floor: 1,
      capacity: 80,
      type: 'Seminar Hall',
      features: ['Projector', 'Whiteboard', 'Air Conditioning', 'Microphone System', 'Sound System', 'Smart Board'],
      status: 'available'
    },
    {
      id: 'CR007',
      name: 'Lab C',
      building: 'CS Block',
      floor: 1,
      capacity: 30,
      type: 'Computer Lab',
      features: ['Computers', 'Projector', 'Whiteboard', 'Air Conditioning'],
      status: 'available'
    },
    {
      id: 'CR008',
      name: 'Room 102',
      building: 'Main Building',
      floor: 1,
      capacity: 45,
      type: 'Lecture Hall',
      features: ['Projector', 'Whiteboard', 'Air Conditioning'],
      status: 'available'
    },
    {
      id: 'CR009',
      name: 'Tutorial Room 1',
      building: 'CS Block',
      floor: 2,
      capacity: 25,
      type: 'Tutorial Room',
      features: ['Whiteboard', 'Air Conditioning'],
      status: 'available'
    },
    {
      id: 'CR010',
      name: 'Room 202',
      building: 'Main Building',
      floor: 2,
      capacity: 50,
      type: 'Lecture Hall',
      features: ['Projector', 'Whiteboard', 'Air Conditioning', 'Smart Board'],
      status: 'available'
    }
  ];

  await Classroom.insertMany(classrooms);
  console.log('✅ Created 10 classrooms\n');
}

async function populatePrograms() {
  console.log('🎓 Creating programs...');
  
  const program = new Program({
    id: 'PROG001',
    name: 'Bachelor of Computer Science',
    code: 'BCS',
    school: 'School of Engineering',
    type: 'Bachelor',
    duration: 4,
    totalSemesters: 8,
    status: 'Active',
    description: 'Bachelor degree program in Computer Science',
    requirements: {
      minCredits: 120,
      coreCredits: 90,
      electiveCredits: 30
    }
  });

  await program.save();
  console.log('✅ Created program\n');
  return program;
}

async function populateDivisions(program) {
  console.log('📚 Creating divisions...');
  
  const divisions = [
    {
      id: 'DIV001',
      name: 'Division A',
      program: program.id,
      year: 2,
      semester: 1,
      academicYear: '2024-2025',
      studentCount: 50,
      isActive: true
    },
    {
      id: 'DIV002',
      name: 'Division B',
      program: program.id,
      year: 2,
      semester: 1,
      academicYear: '2024-2025',
      studentCount: 45,
      isActive: true
    }
  ];

  await Division.insertMany(divisions);
  console.log('✅ Created 2 divisions\n');
  return divisions;
}

async function populateCourses(program, divisions) {
  console.log('📖 Creating 10 courses...');
  
  const courses = [
    {
      id: 'CS201',
      name: 'Data Structures',
      code: 'CS201',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 3,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 1,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 5,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T001', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS202',
      name: 'Database Management Systems',
      code: 'CS202',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 3,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 1,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 5,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T002', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS203',
      name: 'Operating Systems',
      code: 'CS203',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 3,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 1,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 5,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T004', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS204',
      name: 'Computer Networks',
      code: 'CS204',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 3,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 3,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 3,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T004', sessionTypes: ['Theory'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS205',
      name: 'Web Development',
      code: 'CS205',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 2,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 2,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 6,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T002', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS206',
      name: 'Machine Learning',
      code: 'CS206',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 3,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 1,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 5,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T003', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS207',
      name: 'Software Engineering',
      code: 'CS207',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 3,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 3,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 3,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T002', sessionTypes: ['Theory'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS208',
      name: 'Object Oriented Programming',
      code: 'CS208',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 2,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 2,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 6,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T007', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS209',
      name: 'Data Analytics',
      code: 'CS209',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 3,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 2,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 1,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 4,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T005', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    },
    {
      id: 'CS210',
      name: 'Mobile App Development',
      code: 'CS210',
      department: 'Computer Science',
      program: program.id,
      year: 2,
      semester: 1,
      credits: 4,
      sessions: {
        theory: {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: 2,
          requiredFeatures: ['Projector'],
          minRoomCapacity: 45,
          requiresLab: false,
          canBeSplit: false
        },
        practical: {
          type: 'Practical',
          duration: 120,
          sessionsPerWeek: 2,
          requiredFeatures: ['Computers'],
          minRoomCapacity: 45,
          requiresLab: true,
          canBeSplit: false
        }
      },
      totalHoursPerWeek: 6,
      enrolledStudents: 50,
      assignedTeachers: [
        { teacherId: 'T008', sessionTypes: ['Theory', 'Practical'], isPrimary: true, canTeachAlone: true }
      ],
      isActive: true
    }
  ];

  for (const courseData of courses) {
    const course = new Course(courseData);
    course.markModified('sessions');
    await course.save();
  }
  
  console.log('✅ Created 10 courses\n');
}

async function populateStudents(program, divisions) {
  console.log('👨‍🎓 Creating 10 students...');
  
  const students = [];
  for (let i = 1; i <= 10; i++) {
    students.push({
      studentId: `2024BCS${String(i).padStart(3, '0')}`,
      personalInfo: {
        firstName: `Student${i}`,
        lastName: `Test${i}`,
        email: `student${i}@university.edu`,
        phone: `98765432${String(i).padStart(2, '0')}`,
        dateOfBirth: new Date(2002, 0, i),
        gender: i % 2 === 0 ? 'Male' : 'Female'
      },
      academicInfo: {
        department: 'Computer Science',
        program: program.id,
        year: 2,
        semester: 1,
        division: divisions[i % 2].id,
        rollNumber: `2024BCS${String(i).padStart(3, '0')}`,
        admissionDate: new Date(2024, 6, 1),
        academicYear: '2024-2025'
      },
      status: 'Active'
    });
  }

  await Student.insertMany(students);
  console.log('✅ Created 10 students\n');
}

async function populateSystemConfig() {
  console.log('⚙️  Creating system configuration...');
  
  const config = new SystemConfig({
    workingHours: {
      startTime: '09:00',
      endTime: '17:00',
      lunchBreakStart: '12:30',
      lunchBreakEnd: '13:30',
      periodDuration: 50,
      breakDuration: 10,
      labPeriodDuration: 120,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    academicCalendar: {
      academicYearStart: new Date(2024, 6, 1),
      academicYearEnd: new Date(2025, 5, 30),
      semester1Start: new Date(2024, 6, 1),
      semester1End: new Date(2024, 11, 31),
      semester2Start: new Date(2025, 0, 1),
      semester2End: new Date(2025, 5, 30),
      totalWeeks: 16,
      examWeeks: 2,
      vacationWeeks: 4
    },
    createdBy: 'admin',
    isActive: true
  });

  await config.save();
  console.log('✅ Created system configuration\n');
}

async function main() {
  try {
    console.log('📊 Starting database population...\n');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await clearExistingData();

    // Populate data
    await populateTeachers();
    await populateClassrooms();
    const program = await populatePrograms();
    const divisions = await populateDivisions(program);
    await populateCourses(program, divisions);
    await populateStudents(program, divisions);
    await populateSystemConfig();

    // Summary
    console.log('📊 Final Summary:');
    const [teacherCount, classroomCount, courseCount, programCount, divisionCount, studentCount, configCount] = await Promise.all([
      Teacher.countDocuments(),
      Classroom.countDocuments(),
      Course.countDocuments(),
      Program.countDocuments(),
      Division.countDocuments(),
      Student.countDocuments(),
      SystemConfig.countDocuments()
    ]);

    console.log(`  ✅ Teachers: ${teacherCount}`);
    console.log(`  ✅ Classrooms: ${classroomCount}`);
    console.log(`  ✅ Courses: ${courseCount}`);
    console.log(`  ✅ Programs: ${programCount}`);
    console.log(`  ✅ Divisions: ${divisionCount}`);
    console.log(`  ✅ Students: ${studentCount}`);
    console.log(`  ✅ System Config: ${configCount}`);
    
    console.log('\n🎉 Database populated successfully!');
    console.log('Now try generating a timetable from the UI.');

    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
