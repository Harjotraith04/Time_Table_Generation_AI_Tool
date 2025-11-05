/**
 * Fix tutorial sessions - Two options:
 * 1. OPTION A: Disable tutorials (set sessionsPerWeek to 0)
 * 2. OPTION B: Assign theory teachers to also handle tutorials
 */

const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const OPTION = 'B'; // Change to 'A' to disable tutorials instead

async function fixTutorialSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`📊 Found ${courses.length} courses\n`);

    let fixedCount = 0;

    for (const course of courses) {
      const hasTutorials = course.sessions?.tutorial?.sessionsPerWeek > 0;
      
      if (!hasTutorials) {
        continue;
      }

      const tutorialTeachers = course.assignedTeachers?.filter(t => 
        t.sessionTypes && t.sessionTypes.includes('Tutorial')
      );

      if (tutorialTeachers && tutorialTeachers.length > 0) {
        console.log(`✅ ${course.code}: Already has tutorial teachers`);
        continue;
      }

      if (OPTION === 'A') {
        // OPTION A: Disable tutorials
        console.log(`🔧 ${course.code}: Disabling tutorials`);
        course.sessions.tutorial.sessionsPerWeek = 0;
        await course.save();
        fixedCount++;
      } else {
        // OPTION B: Assign theory teachers to tutorials
        const theoryTeachers = course.assignedTeachers?.filter(t => 
          t.sessionTypes && t.sessionTypes.includes('Theory')
        );

        if (theoryTeachers && theoryTeachers.length > 0) {
          console.log(`🔧 ${course.code}: Assigning ${theoryTeachers.length} theory teacher(s) to also handle tutorials`);
          
          theoryTeachers.forEach(teacher => {
            if (!teacher.sessionTypes.includes('Tutorial')) {
              teacher.sessionTypes.push('Tutorial');
            }
          });

          await course.save();
          fixedCount++;
        } else {
          console.log(`⚠️  ${course.code}: No theory teachers found to assign to tutorials`);
        }
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} courses`);

    // Verify the fix
    console.log('\n📊 Verifying fixes...\n');
    const verifyConflicts = await Course.find({});
    const stillHaveIssues = verifyConflicts.filter(course => {
      const hasTutorials = course.sessions?.tutorial?.sessionsPerWeek > 0;
      if (!hasTutorials) return false;

      const tutorialTeachers = course.assignedTeachers?.filter(t => 
        t.sessionTypes && t.sessionTypes.includes('Tutorial')
      );
      return !tutorialTeachers || tutorialTeachers.length === 0;
    });

    if (stillHaveIssues.length === 0) {
      console.log('✅ All tutorial session issues resolved!');
    } else {
      console.log(`⚠️  ${stillHaveIssues.length} courses still have issues:`);
      stillHaveIssues.forEach(course => {
        console.log(`   - ${course.code}: ${course.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

console.log(`\n🔧 TUTORIAL FIX SCRIPT\n`);
console.log(`Mode: ${OPTION === 'A' ? 'DISABLE tutorials' : 'ASSIGN theory teachers to tutorials'}\n`);
console.log(`To change mode, edit OPTION variable in this script:\n`);
console.log(`   OPTION = 'A'  ->  Disable all tutorial sessions`);
console.log(`   OPTION = 'B'  ->  Assign theory teachers to also teach tutorials (RECOMMENDED)\n`);

fixTutorialSessions();
