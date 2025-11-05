/**
 * Check course sessions and teacher assignments
 */

const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

async function checkCourseSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const courses = await Course.find({})
      .populate('assignedTeachers.teacherId')
      .lean();

    console.log(`\n📊 Found ${courses.length} courses\n`);

    for (const course of courses) {
      console.log(`\n📘 Course: ${course.code} - ${course.name}`);
      console.log(`   Enrolled Students: ${course.enrolledStudents || 0}`);
      
      // Check each session type
      ['theory', 'practical', 'tutorial'].forEach(sessionType => {
        const session = course.sessions?.[sessionType];
        if (session && session.sessionsPerWeek > 0) {
          console.log(`\n   ${sessionType.toUpperCase()}:`);
          console.log(`      Sessions/Week: ${session.sessionsPerWeek}`);
          console.log(`      Duration: ${session.duration} mins`);
          console.log(`      Requires Lab: ${session.requiresLab || false}`);
          
          // Check teachers for this session type
          const sessionTypeCapitalized = sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
          const teachersForSession = course.assignedTeachers?.filter(t => 
            t.sessionTypes && t.sessionTypes.includes(sessionTypeCapitalized)
          );
          
          if (!teachersForSession || teachersForSession.length === 0) {
            console.log(`      ⚠️  NO TEACHERS ASSIGNED FOR ${sessionType.toUpperCase()}`);
          } else {
            console.log(`      Teachers (${teachersForSession.length}):`);
            teachersForSession.forEach(t => {
              const teacher = t.teacherId;
              console.log(`         - ${teacher?.name || 'Unknown'} (Types: ${t.sessionTypes?.join(', ')})`);
            });
          }
        }
      });
      
      console.log(`\n   Total Assigned Teachers: ${course.assignedTeachers?.length || 0}`);
      if (course.assignedTeachers && course.assignedTeachers.length > 0) {
        course.assignedTeachers.forEach(t => {
          console.log(`      - ${t.teacherId?.name || 'Unknown'} (${t.sessionTypes?.join(', ') || 'No types specified'})`);
        });
      }
    }

    // Summary
    console.log('\n\n📊 SUMMARY\n');
    const coursesWithIssues = courses.filter(course => {
      return ['theory', 'practical', 'tutorial'].some(sessionType => {
        const session = course.sessions?.[sessionType];
        if (session && session.sessionsPerWeek > 0) {
          const sessionTypeCapitalized = sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
          const teachersForSession = course.assignedTeachers?.filter(t => 
            t.sessionTypes && t.sessionTypes.includes(sessionTypeCapitalized)
          );
          return !teachersForSession || teachersForSession.length === 0;
        }
        return false;
      });
    });

    console.log(`Total Courses: ${courses.length}`);
    console.log(`Courses with Session/Teacher Mismatches: ${coursesWithIssues.length}`);
    
    if (coursesWithIssues.length > 0) {
      console.log('\n⚠️  Courses needing fixes:');
      coursesWithIssues.forEach(course => {
        console.log(`   - ${course.code}: ${course.name}`);
        ['theory', 'practical', 'tutorial'].forEach(sessionType => {
          const session = course.sessions?.[sessionType];
          if (session && session.sessionsPerWeek > 0) {
            const sessionTypeCapitalized = sessionType.charAt(0).toUpperCase() + sessionType.slice(1);
            const teachersForSession = course.assignedTeachers?.filter(t => 
              t.sessionTypes && t.sessionTypes.includes(sessionTypeCapitalized)
            );
            if (!teachersForSession || teachersForSession.length === 0) {
              console.log(`     ❌ ${sessionType}: ${session.sessionsPerWeek} sessions/week but NO teachers`);
            }
          }
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkCourseSessions();
