/**
 * Debug teacher availability and classroom matching
 */

const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');
require('dotenv').config();

async function debugAvailability() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all teachers
    const teachers = await Teacher.find({}).lean();
    console.log(`📊 Found ${teachers.length} teachers\n`);

    // Check availability structure
    for (const teacher of teachers.slice(0, 3)) {
      console.log(`\n👨‍🏫 Teacher: ${teacher.name} (ID: ${teacher.id || teacher._id})`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Department: ${teacher.department}`);
      console.log(`   Type: ${teacher.teacherType || 'core'}`);
      
      if (teacher.availability) {
        console.log(`   Availability structure exists: ${typeof teacher.availability}`);
        console.log(`   Days:`, Object.keys(teacher.availability));
        
        // Check Monday as example
        if (teacher.availability.Monday) {
          console.log(`   Monday slots: ${teacher.availability.Monday.length}`);
          if (teacher.availability.Monday.length > 0) {
            console.log(`   First Monday slot:`, teacher.availability.Monday[0]);
          }
        }
      } else {
        console.log(`   ⚠️  NO AVAILABILITY DEFINED`);
      }
    }

    // Get sample course
    console.log('\n\n📚 Checking Course Data...\n');
    const course = await Course.findOne({ code: 'CS101' })
      .populate('assignedTeachers.teacherId')
      .lean();
    
    if (course) {
      console.log(`Course: ${course.code} - ${course.name}`);
      console.log(`Sessions:`, {
        theory: course.sessions?.theory?.sessionsPerWeek || 0,
        practical: course.sessions?.practical?.sessionsPerWeek || 0,
        tutorial: course.sessions?.tutorial?.sessionsPerWeek || 0
      });
      
      console.log(`\nAssigned Teachers (${course.assignedTeachers?.length || 0}):`);
      course.assignedTeachers?.forEach(at => {
        const teacher = at.teacherId;
        console.log(`   - ${teacher?.name || 'Unknown'} (${teacher?.id || teacher?._id})`);
        console.log(`     Session Types: ${at.sessionTypes?.join(', ') || 'None'}`);
        console.log(`     Has Availability: ${!!teacher?.availability}`);
      });
    }

    // Check classrooms
    console.log('\n\n🏫 Checking Classrooms...\n');
    const classrooms = await Classroom.find({}).lean();
    console.log(`Found ${classrooms.length} classrooms\n`);
    
    for (const classroom of classrooms.slice(0, 3)) {
      console.log(`Classroom: ${classroom.name} (ID: ${classroom.id || classroom._id})`);
      console.log(`   Capacity: ${classroom.capacity}`);
      console.log(`   Type: ${classroom.type}`);
      console.log(`   Features: ${classroom.features?.join(', ') || 'None'}`);
      console.log(`   Building: ${classroom.building}`);
      console.log();
    }

    // Check time slots configuration
    console.log('\n⏰ Checking Time Slots Configuration...\n');
    const SystemConfig = require('./models/SystemConfig');
    const config = await SystemConfig.findOne({});
    
    if (config) {
      console.log(`Working Days: ${config.workingDays?.join(', ') || 'Not set'}`);
      console.log(`Time Slots: ${config.timeSlots?.length || 0}`);
      if (config.timeSlots && config.timeSlots.length > 0) {
        console.log(`First slot:`, config.timeSlots[0]);
        console.log(`Last slot:`, config.timeSlots[config.timeSlots.length - 1]);
      }
    } else {
      console.log('⚠️  No system configuration found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

debugAvailability();
