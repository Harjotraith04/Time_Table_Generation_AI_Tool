/**
 * Fix data issues to allow timetable generation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const Classroom = require('./models/Classroom');
const Course = require('./models/Course');

async function fixData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator');
    console.log('✅ Connected\n');

    // Fix 1: Update classroom status to 'available'
    console.log('📝 Fixing classroom status...');
    const classroomResult = await Classroom.updateMany(
      { status: { $ne: 'available' } },
      { $set: { status: 'available' } }
    );
    console.log(`✅ Updated ${classroomResult.modifiedCount} classroom(s) to status='available'\n`);

    // Fix 2: Add sessions to courses that have none
    console.log('📝 Fixing course sessions...');
    const courses = await Course.find({ isActive: true });
    
    for (const course of courses) {
      let modified = false;
      
      // Check if sessions are empty or incomplete
      const hasTheory = course.sessions && course.sessions.theory && course.sessions.theory.sessionsPerWeek > 0;
      const hasPractical = course.sessions && course.sessions.practical && course.sessions.practical.sessionsPerWeek > 0;
      const hasTutorial = course.sessions && course.sessions.tutorial && course.sessions.tutorial.sessionsPerWeek > 0;
      
      if (!hasTheory && !hasPractical && !hasTutorial) {
        console.log(`  Course ${course.name} has no valid sessions, adding default theory sessions...`);
        
        // Add default theory sessions based on total hours
        course.sessions.theory = {
          type: 'Theory',
          duration: 60,
          sessionsPerWeek: Math.max(1, Math.ceil(course.totalHoursPerWeek / 60)),
          requiredFeatures: [],
          minRoomCapacity: course.enrolledStudents || 30,
          requiresLab: false,
          canBeSplit: false
        };
        
        course.markModified('sessions');
        modified = true;
      } else {
        // Check if sessions have sessionsPerWeek defined
        ['theory', 'practical', 'tutorial'].forEach(sessionType => {
          if (course.sessions[sessionType] && !course.sessions[sessionType].sessionsPerWeek) {
            console.log(`  Course ${course.name} ${sessionType} missing sessionsPerWeek, adding default...`);
            course.sessions[sessionType].sessionsPerWeek = 2;
            course.markModified('sessions');
            modified = true;
          }
        });
      }
      
      if (modified) {
        await course.save();
        console.log(`  ✅ Updated course ${course.name}`);
      }
    }
    console.log('');

    // Fix 3: Update course assigned teachers (replace "TBD" with actual teacher)
    console.log('📝 Fixing course teacher assignments...');
    const teachers = await Teacher.find({ status: 'active' });
    
    if (teachers.length > 0) {
      const coursesWithTBD = await Course.find({
        'assignedTeachers.teacherId': 'TBD'
      });

      for (const course of coursesWithTBD) {
        // Find a teacher who can teach this course (check subjects)
        const matchingTeacher = teachers.find(t => 
          t.subjects && t.subjects.some(subject => 
            course.name.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(course.name.toLowerCase())
          )
        );

        const assignedTeacher = matchingTeacher || teachers[0];
        
        console.log(`  Assigning ${assignedTeacher.name} to ${course.name}`);
        
        // Replace TBD with actual teacher
        course.assignedTeachers = [{
          teacherId: assignedTeacher.id,
          sessionTypes: ['Theory', 'Practical', 'Tutorial'],
          isPrimary: true,
          canTeachAlone: true
        }];
        
        await course.save();
        console.log(`  ✅ Updated course ${course.name}`);
      }
    } else {
      console.log('  ⚠️  No teachers available to assign');
    }
    console.log('');

    // Run validation again
    console.log('🔍 Running validation...');
    const [updatedTeachers, updatedClassrooms, updatedCourses] = await Promise.all([
      Teacher.find({ status: 'active' }),
      Classroom.find({ status: 'available' }),
      Course.find({ isActive: true })
    ]);

    console.log('📊 Updated Data Summary:');
    console.log(`  Teachers: ${updatedTeachers.length}`);
    console.log(`  Classrooms: ${updatedClassrooms.length}`);
    console.log(`  Courses: ${updatedCourses.length}\n`);

    if (updatedCourses.length > 0) {
      console.log('Sample Course After Fix:');
      const course = updatedCourses[0];
      console.log(`  Name: ${course.name}`);
      console.log(`  Assigned Teachers: ${JSON.stringify(course.assignedTeachers.map(t => t.teacherId))}`);
      console.log(`  Sessions: ${JSON.stringify(Object.keys(course.sessions))}`);
    }

    console.log('\n✅ All fixes applied successfully!');
    console.log('You can now try generating the timetable again.');

    await mongoose.connection.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixData();
