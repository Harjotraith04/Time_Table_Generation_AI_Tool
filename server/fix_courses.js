const mongoose = require('mongoose');
const Course = require('./models/Course');

const MONGODB_URI = 'mongodb+srv://Harjot:Harjot1234@tt.mtgy9tu.mongodb.net/timetable_generator?retryWrites=true&w=majority&appName=TT';

async function fixCourses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected\n');

    // Check all courses
    console.log('Fetching all courses...');
    const allCourses = await Course.find({});
    console.log(`Found ${allCourses.length} courses total\n`);

    if (allCourses.length === 0) {
      console.log('No courses found in database!');
      await mongoose.disconnect();
      return;
    }

    // Show first course structure
    console.log('Sample course structure:');
    console.log(JSON.stringify(allCourses[0], null, 2));
    console.log('\n');

    // Check how many have department, year, semester, isActive
    const coursesWithDept = allCourses.filter(c => c.department);
    const coursesWithYear = allCourses.filter(c => c.year);
    const coursesWithSemester = allCourses.filter(c => c.semester);
    const coursesWithIsActive = allCourses.filter(c => c.isActive === true);

    console.log('Course field analysis:');
    console.log(`  With department: ${coursesWithDept.length}/${allCourses.length}`);
    console.log(`  With year: ${coursesWithYear.length}/${allCourses.length}`);
    console.log(`  With semester: ${coursesWithSemester.length}/${allCourses.length}`);
    console.log(`  With isActive=true: ${coursesWithIsActive.length}/${allCourses.length}`);
    console.log('\n');

    // Check query that generation uses
    const query = {
      department: 'Computer Science',
      year: 1,
      semester: 1,
      isActive: true
    };
    
    console.log('Testing generation query:');
    console.log(JSON.stringify(query, null, 2));
    
    const matchingCourses = await Course.find(query);
    console.log(`\nMatching courses: ${matchingCourses.length}`);
    
    if (matchingCourses.length === 0) {
      console.log('\n⚠️  No courses match the generation query!');
      console.log('Need to update courses with year, semester, and isActive fields.\n');
      
      // Update all courses
      console.log('Updating all courses...');
      const updateResult = await Course.updateMany(
        {},
        {
          $set: {
            department: 'Computer Science',
            year: 1,
            semester: 1,
            isActive: true
          }
        }
      );
      
      console.log(`✓ Updated ${updateResult.modifiedCount} courses`);
      
      // Verify
      const verifyCount = await Course.countDocuments(query);
      console.log(`✓ Verification: ${verifyCount} courses now match the query`);
    } else {
      console.log('✓ Courses are properly configured!');
    }

    await mongoose.disconnect();
    console.log('\nConnection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixCourses();
