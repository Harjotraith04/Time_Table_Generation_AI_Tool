import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Classroom from '../models/Classroom.js';
import Course from '../models/Course.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator');
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample data for seeding
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@timetable.com',
    password: 'admin123',
    userType: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true
  },
  {
    username: 'student1',
    email: 'student1@timetable.com',
    password: 'student123',
    userType: 'student',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true
  }
];

const sampleTeachers = [
  {
    employeeId: 'T001',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@university.edu',
    phone: '+1-555-0101',
    department: 'Computer Science',
    subjects: ['Programming', 'Data Structures', 'Algorithms'],
    qualification: 'Ph.D. Computer Science',
    experience: 8,
    maxHoursPerDay: 6,
    maxHoursPerWeek: 25,
    preferredTimeSlots: ['09:00-11:00', '14:00-16:00'],
    unavailableTimeSlots: ['12:00-13:00'],
    maxConsecutiveHours: 3,
    preferredRoomTypes: ['Computer Lab', 'Lecture Hall'],
    isActive: true
  },
  {
    employeeId: 'T002',
    firstName: 'Prof. Michael',
    lastName: 'Chen',
    email: 'michael.chen@university.edu',
    phone: '+1-555-0102',
    department: 'Mathematics',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics'],
    qualification: 'Ph.D. Mathematics',
    experience: 12,
    maxHoursPerDay: 6,
    maxHoursPerWeek: 25,
    preferredTimeSlots: ['10:00-12:00', '15:00-17:00'],
    unavailableTimeSlots: ['12:00-13:00'],
    maxConsecutiveHours: 3,
    preferredRoomTypes: ['Lecture Hall', 'Seminar Room'],
    isActive: true
  },
  {
    employeeId: 'T003',
    firstName: 'Dr. Emily',
    lastName: 'Brown',
    email: 'emily.brown@university.edu',
    phone: '+1-555-0103',
    department: 'Physics',
    subjects: ['Mechanics', 'Thermodynamics', 'Quantum Physics'],
    qualification: 'Ph.D. Physics',
    experience: 6,
    maxHoursPerDay: 6,
    maxHoursPerWeek: 25,
    preferredTimeSlots: ['08:00-10:00', '13:00-15:00'],
    unavailableTimeSlots: ['12:00-13:00'],
    maxConsecutiveHours: 3,
    preferredRoomTypes: ['Physics Lab', 'Lecture Hall'],
    isActive: true
  }
];

const sampleClassrooms = [
  {
    roomNumber: 'CS101',
    building: 'Computer Science Building',
    floor: 1,
    capacity: 30,
    roomType: 'Computer Lab',
    equipment: ['Computers', 'Projector', 'Whiteboard'],
    features: ['Air Conditioning', 'WiFi', 'Power Outlets'],
    isAvailable: true,
    maxHoursPerDay: 8,
    preferredSubjects: ['Programming', 'Computer Science'],
    maintenanceSchedule: 'Weekly',
    isActive: true
  },
  {
    roomNumber: 'MH201',
    building: 'Mathematics Hall',
    floor: 2,
    capacity: 40,
    roomType: 'Lecture Hall',
    equipment: ['Projector', 'Whiteboard', 'Sound System'],
    features: ['Air Conditioning', 'WiFi', 'Comfortable Seating'],
    isAvailable: true,
    maxHoursPerDay: 8,
    preferredSubjects: ['Mathematics', 'Statistics'],
    maintenanceSchedule: 'Bi-weekly',
    isActive: true
  },
  {
    roomNumber: 'PH301',
    building: 'Physics Building',
    floor: 3,
    capacity: 25,
    roomType: 'Physics Lab',
    equipment: ['Physics Equipment', 'Projector', 'Whiteboard'],
    features: ['Air Conditioning', 'WiFi', 'Lab Equipment'],
    isAvailable: true,
    maxHoursPerDay: 8,
    preferredSubjects: ['Physics', 'Laboratory'],
    maintenanceSchedule: 'Weekly',
    isActive: true
  },
  {
    roomNumber: 'GH101',
    building: 'General Hall',
    floor: 1,
    capacity: 50,
    roomType: 'Lecture Hall',
    equipment: ['Projector', 'Whiteboard', 'Sound System'],
    features: ['Air Conditioning', 'WiFi', 'Comfortable Seating'],
    isAvailable: true,
    maxHoursPerDay: 8,
    preferredSubjects: ['General', 'Multi-purpose'],
    maintenanceSchedule: 'Monthly',
    isActive: true
  }
];

const sampleCourses = [
  {
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    department: 'Computer Science',
    credits: 3,
    hoursPerWeek: 4,
    theoryHours: 2,
    practicalHours: 2,
    semester: 1,
    academicYear: '2024-2025',
    maxStudents: 30,
    prerequisites: [],
    faculty: [],
    weeklySchedule: [
      { day: 'Monday', startTime: '09:00', endTime: '11:00', type: 'Theory' },
      { day: 'Wednesday', startTime: '14:00', endTime: '16:00', type: 'Practical' }
    ],
    roomRequirements: ['Computer Lab'],
    equipmentRequirements: ['Computers', 'Projector'],
    isActive: true
  },
  {
    courseCode: 'MATH201',
    courseName: 'Calculus I',
    department: 'Mathematics',
    credits: 4,
    hoursPerWeek: 5,
    theoryHours: 3,
    practicalHours: 2,
    semester: 1,
    academicYear: '2024-2025',
    maxStudents: 40,
    prerequisites: [],
    faculty: [],
    weeklySchedule: [
      { day: 'Tuesday', startTime: '10:00', endTime: '12:00', type: 'Theory' },
      { day: 'Thursday', startTime: '15:00', endTime: '17:00', type: 'Practical' }
    ],
    roomRequirements: ['Lecture Hall'],
    equipmentRequirements: ['Projector', 'Whiteboard'],
    isActive: true
  },
  {
    courseCode: 'PHY301',
    courseName: 'Mechanics',
    department: 'Physics',
    credits: 3,
    hoursPerWeek: 4,
    theoryHours: 2,
    practicalHours: 2,
    semester: 1,
    academicYear: '2024-2025',
    maxStudents: 25,
    prerequisites: [],
    faculty: [],
    weeklySchedule: [
      { day: 'Monday', startTime: '08:00', endTime: '10:00', type: 'Theory' },
      { day: 'Friday', startTime: '13:00', endTime: '15:00', type: 'Laboratory' }
    ],
    roomRequirements: ['Physics Lab'],
    equipmentRequirements: ['Physics Equipment', 'Projector'],
    isActive: true
  }
];

// Seed functions
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    
    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        return { ...user, password: hashedPassword };
      })
    );
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Seeded ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedTeachers = async () => {
  try {
    // Clear existing teachers
    await Teacher.deleteMany({});
    
    const createdTeachers = await Teacher.insertMany(sampleTeachers);
    console.log(`✅ Seeded ${createdTeachers.length} teachers`);
    return createdTeachers;
  } catch (error) {
    console.error('Error seeding teachers:', error);
    throw error;
  }
};

const seedClassrooms = async () => {
  try {
    // Clear existing classrooms
    await Classroom.deleteMany({});
    
    const createdClassrooms = await Classroom.insertMany(sampleClassrooms);
    console.log(`✅ Seeded ${createdClassrooms.length} classrooms`);
    return createdClassrooms;
  } catch (error) {
    console.error('Error seeding classrooms:', error);
    throw error;
  }
};

const seedCourses = async () => {
  try {
    // Clear existing courses
    await Course.deleteMany({});
    
    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Seeded ${createdCourses.length} courses`);
    return createdCourses;
  } catch (error) {
    console.error('Error seeding courses:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Seed all data
    await seedUsers();
    await seedTeachers();
    await seedClassrooms();
    await seedCourses();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample data created:');
    console.log('- 2 users (admin, student)');
    console.log('- 3 teachers (Computer Science, Mathematics, Physics)');
    console.log('- 4 classrooms (Computer Lab, Lecture Halls, Physics Lab)');
    console.log('- 3 courses (Programming, Calculus, Mechanics)');
    console.log('\n🔑 Default login credentials:');
    console.log('- Admin: admin@timetable.com / admin123');
    console.log('- Student: student1@timetable.com / student123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };
