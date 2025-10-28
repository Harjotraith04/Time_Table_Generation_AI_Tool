const mongoose = require('mongoose');
const SystemConfig = require('./models/SystemConfig');
const Holiday = require('./models/Holiday');

async function viewInfrastructureData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/timetable_db');
    console.log('Connected to MongoDB\n');

    // Get System Configuration
    const config = await SystemConfig.findOne({ isActive: true });
    
    if (config) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('                    SYSTEM CONFIGURATION                       ');
      console.log('═══════════════════════════════════════════════════════════════\n');
      
      console.log('📋 GENERAL POLICIES:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  • Max Consecutive Hours: ${config.generalPolicies.maxConsecutiveHours}`);
      console.log(`  • Max Daily Hours: ${config.generalPolicies.maxDailyHours}`);
      console.log(`  • Min Break Between Sessions: ${config.generalPolicies.minBreakBetweenSessions} minutes`);
      console.log(`  • Max Teaching Hours Per Day: ${config.generalPolicies.maxTeachingHoursPerDay}`);
      console.log(`  • Preferred Classroom Utilization: ${config.generalPolicies.preferredClassroomUtilization}%`);
      console.log(`  • Max Students Per Class: ${config.generalPolicies.maxStudentsPerClass}`);
      console.log(`  • Room Capacity Buffer: ${config.generalPolicies.minRoomCapacityBuffer}%`);
      console.log(`  • Allow Back-to-Back Labs: ${config.generalPolicies.allowBackToBackLabs ? '✓' : '✗'}`);
      console.log(`  • Prioritize Teacher Preferences: ${config.generalPolicies.prioritizeTeacherPreferences ? '✓' : '✗'}`);
      console.log(`  • Allow Split Sessions: ${config.generalPolicies.allowSplitSessions ? '✓' : '✗'}`);
      console.log(`  • Allow Overlapping Labs: ${config.generalPolicies.allowOverlappingLabs ? '✓' : '✗'}`);
      console.log(`  • Prioritize Core Subjects: ${config.generalPolicies.prioritizeCoreBefore ? '✓' : '✗'}`);
      console.log(`  • Avoid First/Last Period: ${config.generalPolicies.avoidFirstLastPeriod ? '✓' : '✗'}`);
      console.log(`  • Require Lab Assistant: ${config.generalPolicies.requireLabAssistant ? '✓' : '✗'}\n`);
      
      console.log('🕐 WORKING HOURS:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  • Start Time: ${config.workingHours.startTime}`);
      console.log(`  • End Time: ${config.workingHours.endTime}`);
      console.log(`  • Lunch Break: ${config.workingHours.lunchBreakStart} - ${config.workingHours.lunchBreakEnd}`);
      console.log(`  • Period Duration: ${config.workingHours.periodDuration} minutes`);
      console.log(`  • Break Duration: ${config.workingHours.breakDuration} minutes`);
      console.log(`  • Lab Period Duration: ${config.workingHours.labPeriodDuration} minutes`);
      console.log(`  • Max Periods Per Day: ${config.workingHours.maxPeriodsPerDay}`);
      console.log(`  • Working Days: ${config.workingHours.workingDays.join(', ')}\n`);
      
      console.log('📅 ACADEMIC CALENDAR:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  • Academic Year: ${new Date(config.academicCalendar.academicYearStart).toLocaleDateString()} - ${new Date(config.academicCalendar.academicYearEnd).toLocaleDateString()}`);
      console.log(`  • Semester 1: ${new Date(config.academicCalendar.semester1Start).toLocaleDateString()} - ${new Date(config.academicCalendar.semester1End).toLocaleDateString()}`);
      console.log(`  • Semester 2: ${new Date(config.academicCalendar.semester2Start).toLocaleDateString()} - ${new Date(config.academicCalendar.semester2End).toLocaleDateString()}`);
      console.log(`  • Total Weeks: ${config.academicCalendar.totalWeeks}`);
      console.log(`  • Exam Weeks: ${config.academicCalendar.examWeeks}`);
      console.log(`  • Vacation Weeks: ${config.academicCalendar.vacationWeeks}\n`);
      
      console.log('⚙️  CONSTRAINT RULES:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  • Min Gap Between Exams: ${config.constraintRules.minGapBetweenExams} days`);
      console.log(`  • Max Subjects Per Day: ${config.constraintRules.maxSubjectsPerDay}`);
      console.log(`  • Prefer Morning Labs: ${config.constraintRules.preferMorningLabs ? '✓' : '✗'}`);
      console.log(`  • Avoid Friday Afternoon: ${config.constraintRules.avoidFridayAfternoon ? '✓' : '✗'}`);
      console.log(`  • Balance Workload: ${config.constraintRules.balanceWorkload ? '✓' : '✗'}`);
      console.log(`  • Group Similar Subjects: ${config.constraintRules.groupSimilarSubjects ? '✓' : '✗'}`);
      console.log(`  • Maintain Teacher Continuity: ${config.constraintRules.maintainTeacherContinuity ? '✓' : '✗'}`);
      console.log(`  • Prioritize Popular Slots: ${config.constraintRules.prioritizePopularSlots ? '✓' : '✗'}\n`);
      
      console.log('📝 METADATA:');
      console.log('─────────────────────────────────────────────────────────────');
      console.log(`  • Created: ${config.createdAt ? new Date(config.createdAt).toLocaleString() : 'N/A'}`);
      console.log(`  • Last Updated: ${config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'N/A'}`);
      console.log(`  • Created By: ${config.createdBy}`);
      console.log(`  • Updated By: ${config.updatedBy || 'N/A'}\n`);
    } else {
      console.log('⚠️  No system configuration found in database\n');
    }

    // Get Holidays
    const holidays = await Holiday.find().sort({ date: 1, startDate: 1 });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    HOLIDAYS & EVENTS                          ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    if (holidays.length > 0) {
      holidays.forEach((holiday, index) => {
        console.log(`${index + 1}. ${holiday.name} (${holiday.id})`);
        console.log(`   Type: ${holiday.type}`);
        if (holiday.isDateRange) {
          console.log(`   Duration: ${new Date(holiday.startDate).toLocaleDateString()} - ${new Date(holiday.endDate).toLocaleDateString()}`);
        } else {
          console.log(`   Date: ${new Date(holiday.date).toLocaleDateString()}`);
        }
        console.log(`   Recurring: ${holiday.recurring ? 'Yes' : 'No'}`);
        console.log(`   Status: ${holiday.status}`);
        if (holiday.description) {
          console.log(`   Description: ${holiday.description}`);
        }
        console.log('');
      });
      console.log(`Total Holidays: ${holidays.length}\n`);
    } else {
      console.log('⚠️  No holidays found in database\n');
    }

    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

viewInfrastructureData();
