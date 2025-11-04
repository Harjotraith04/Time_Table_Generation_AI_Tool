/**
 * Simple Greedy Algorithm for Timetable Generation
 * Fast, simple scheduling without complex constraint solving
 * Use this when CSP/GA are too slow for the problem size
 */

const logger = require('../utils/logger');

class GreedyScheduler {
  constructor(teachers, classrooms, courses, settings) {
    this.teachers = teachers;
    this.classrooms = classrooms;
    this.courses = courses;
    this.settings = settings || {};
    this.schedule = [];
    this.teacherSchedule = new Map(); // teacherId -> [{day, startTime, endTime}]
    this.classroomSchedule = new Map(); // classroomId -> [{day, startTime, endTime}]
  }

  /**
   * Generate time slots
   */
  generateTimeSlots() {
    const slots = [];
    const workingDays = this.settings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = this.settings.startTime || '09:00';
    const endTime = this.settings.endTime || '17:00';
    const slotDuration = this.settings.slotDuration || 60;
    const breakSlots = this.settings.breakSlots || ['12:30-13:30'];

    for (const day of workingDays) {
      let [hour, minute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      while (hour < endHour || (hour === endHour && minute < endMinute)) {
        const slotStart = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // Calculate end time
        let endMin = minute + slotDuration;
        let slotEndHour = hour;
        if (endMin >= 60) {
          slotEndHour += Math.floor(endMin / 60);
          endMin = endMin % 60;
        }
        const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        // Check if it's a break time
        const isBreak = breakSlots.some(breakSlot => {
          const [breakStart, breakEnd] = breakSlot.split('-');
          return slotStart >= breakStart && slotStart < breakEnd;
        });

        if (!isBreak) {
          slots.push({ day, startTime: slotStart, endTime: slotEnd });
        }

        minute += slotDuration;
        if (minute >= 60) {
          hour += Math.floor(minute / 60);
          minute = minute % 60;
        }
      }
    }

    return slots;
  }

  /**
   * Check if teacher is available
   */
  isTeacherAvailable(teacherId, day, startTime, endTime) {
    const teacher = this.teachers.find(t => t.id === teacherId);
    if (!teacher) return false;

    // Check teacher's general availability
    if (teacher.isAvailableAt && !teacher.isAvailableAt(day, startTime)) {
      return false;
    }

    // Check if teacher already has a class at this time
    const teacherSlots = this.teacherSchedule.get(teacherId) || [];
    return !teacherSlots.some(slot => 
      slot.day === day && this.timeOverlaps(slot.startTime, slot.endTime, startTime, endTime)
    );
  }

  /**
   * Check if classroom is available
   */
  isClassroomAvailable(classroomId, day, startTime, endTime) {
    const classroomSlots = this.classroomSchedule.get(classroomId) || [];
    return !classroomSlots.some(slot => 
      slot.day === day && this.timeOverlaps(slot.startTime, slot.endTime, startTime, endTime)
    );
  }

  /**
   * Check if two time ranges overlap
   */
  timeOverlaps(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Find suitable classroom
   */
  findSuitableClassroom(requiredCapacity, requiredFeatures, requiresLab, day, startTime, endTime) {
    for (const classroom of this.classrooms) {
      // Check capacity
      if (classroom.capacity < requiredCapacity) continue;

      // Check if it's a lab when required
      if (requiresLab && classroom.type !== 'Computer Lab') continue;

      // Check features
      if (requiredFeatures && requiredFeatures.length > 0) {
        const hasAllFeatures = requiredFeatures.every(feature => 
          classroom.features && classroom.features.includes(feature)
        );
        if (!hasAllFeatures) continue;
      }

      // Check availability
      if (this.isClassroomAvailable(classroom.id, day, startTime, endTime)) {
        return classroom;
      }
    }
    return null;
  }

  /**
   * Schedule a session
   */
  scheduleSession(course, sessionType, session, sessionIndex, progressCallback) {
    const timeSlots = this.generateTimeSlots();
    
    for (const slot of timeSlots) {
      // Try each assigned teacher
      for (const assignedTeacher of course.assignedTeachers) {
        if (!assignedTeacher.sessionTypes.includes(sessionType)) continue;

        const teacherId = assignedTeacher.teacherId;
        
        // Check teacher availability
        if (!this.isTeacherAvailable(teacherId, slot.day, slot.startTime, slot.endTime)) {
          continue;
        }

        // Find suitable classroom
        const classroom = this.findSuitableClassroom(
          session.minRoomCapacity || course.enrolledStudents,
          session.requiredFeatures,
          session.requiresLab,
          slot.day,
          slot.startTime,
          slot.endTime
        );

        if (classroom) {
          // Schedule found!
          const scheduleEntry = {
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            sessionType,
            sessionIndex,
            teacherId,
            classroomId: classroom.id,
            classroomName: classroom.name,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: session.duration,
            enrolledStudents: course.enrolledStudents
          };

          this.schedule.push(scheduleEntry);

          // Update schedules
          if (!this.teacherSchedule.has(teacherId)) {
            this.teacherSchedule.set(teacherId, []);
          }
          this.teacherSchedule.get(teacherId).push({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          });

          if (!this.classroomSchedule.has(classroom.id)) {
            this.classroomSchedule.set(classroom.id, []);
          }
          this.classroomSchedule.get(classroom.id).push({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime
          });

          return true;
        }
      }
    }

    return false; // Could not schedule
  }

  /**
   * Main solve method
   */
  async solve(progressCallback = null) {
    const startTime = Date.now();
    logger.info('[GREEDY] Greedy Scheduler starting', {
      courses: this.courses.length,
      teachers: this.teachers.length,
      classrooms: this.classrooms.length
    });

    try {
      let totalSessions = 0;
      let scheduledSessions = 0;

      // Count total sessions
      logger.info('[GREEDY] Counting total sessions...');
      for (const course of this.courses) {
        ['theory', 'practical', 'tutorial'].forEach(sessionType => {
          const session = course.sessions[sessionType];
          if (session && session.sessionsPerWeek > 0) {
            totalSessions += session.sessionsPerWeek;
          }
        });
      }

      logger.info(`[GREEDY] Total sessions to schedule: ${totalSessions}`);

      // Schedule each course's sessions
      logger.info('[GREEDY] Starting to schedule courses...');
      for (const course of this.courses) {
        logger.info(`[GREEDY] Processing course: ${course.name} (${course.code})`);
        
        ['Theory', 'Practical', 'Tutorial'].forEach(sessionType => {
          const sessionKey = sessionType.toLowerCase();
          const session = course.sessions[sessionKey];
          
          if (session && session.sessionsPerWeek > 0) {
            logger.info(`[GREEDY] Scheduling ${session.sessionsPerWeek} ${sessionType} sessions for ${course.name}`);
            
            for (let i = 0; i < session.sessionsPerWeek; i++) {
              const sessionStartTime = Date.now();
              const success = this.scheduleSession(course, sessionType, session, i, progressCallback);
              const sessionDuration = Date.now() - sessionStartTime;
              
              if (success) {
                scheduledSessions++;
                logger.info(`[GREEDY] ✓ Scheduled ${course.name} - ${sessionType} session ${i + 1} (took ${sessionDuration}ms)`);
                
                if (progressCallback) {
                  const progress = (scheduledSessions / totalSessions) * 100;
                  progressCallback(progress, `Scheduled ${scheduledSessions}/${totalSessions} sessions`);
                }
              } else {
                logger.warn(`[GREEDY] ✗ Failed to schedule ${course.name} - ${sessionType} session ${i + 1} (took ${sessionDuration}ms)`);
              }
            }
          }
        });
      }

      const duration = Date.now() - startTime;
      const successRate = (scheduledSessions / totalSessions) * 100;

      logger.info('[GREEDY] Greedy Scheduler completed', {
        duration: `${duration}ms`,
        scheduledSessions,
        totalSessions,
        successRate: `${successRate.toFixed(2)}%`
      });

      if (scheduledSessions === 0) {
        return {
          success: false,
          reason: 'Could not schedule any sessions - check teacher/classroom availability and course requirements'
        };
      }

      return {
        success: true,
        solution: this.schedule,
        metrics: {
          duration,
          totalSessions,
          scheduledSessions,
          successRate,
          algorithm: 'greedy'
        }
      };

    } catch (error) {
      logger.error('Greedy Scheduler error:', error);
      return { success: false, reason: error.message };
    }
  }
}

module.exports = GreedyScheduler;
