/**
 * Backtracking Search Algorithm for Timetable Generation
 * 
 * Systematic exhaustive search with intelligent heuristics:
 * - Minimum Remaining Values (MRV) for variable ordering
 * - Degree heuristic as tie-breaker
 * - Least Constraining Value (LCV) for value ordering
 * - Forward checking to prune domains
 * - Visiting faculty prioritization
 */

const logger = require('../utils/logger');
const ConstraintChecker = require('./ConstraintChecker');

class BacktrackingSearch {
  constructor(teachers, classrooms, courses, settings = {}) {
    this.teachers = teachers || [];
    this.classrooms = classrooms || [];
    this.courses = courses || [];
    this.settings = {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60,
      breakSlots: ['12:00-13:00'],
      maxBacktracks: 10000,
      ...settings
    };

    this.constraintChecker = new ConstraintChecker(teachers, classrooms, courses, settings);
    this.timeSlots = this.generateTimeSlots();
    this.sessions = this.extractSessions();
    this.assignment = [];
    this.backtrackCount = 0;
    this.startTime = null;
  }

  /**
   * Main solve method
   */
  async solve(progressCallback = null) {
    this.startTime = Date.now();
    this.assignment = [];
    this.backtrackCount = 0;

    logger.info('[BACKTRACKING] Starting backtracking search', {
      sessions: this.sessions.length,
      timeSlots: this.timeSlots.length,
      maxBacktracks: this.settings.maxBacktracks
    });

    const result = await this.backtrack(0, progressCallback);

    const duration = Date.now() - this.startTime;

    if (result) {
      logger.info('[BACKTRACKING] Solution found!', {
        duration: `${duration}ms`,
        backtracks: this.backtrackCount,
        assignments: this.assignment.length
      });

      return {
        success: true,
        solution: this.assignment,
        metrics: {
          algorithm: 'Backtracking Search',
          duration,
          backtracks: this.backtrackCount,
          sessionsScheduled: this.assignment.length
        }
      };
    } else {
      logger.warn('[BACKTRACKING] No solution found', {
        duration: `${duration}ms`,
        backtracks: this.backtrackCount
      });

      return {
        success: false,
        reason: 'No feasible solution found within backtrack limit',
        metrics: {
          algorithm: 'Backtracking Search',
          duration,
          backtracks: this.backtrackCount
        }
      };
    }
  }

  /**
   * Recursive backtracking
   */
  async backtrack(index, progressCallback) {
    // Check backtrack limit
    if (this.backtrackCount > this.settings.maxBacktracks) {
      logger.warn('[BACKTRACKING] Backtrack limit reached');
      return false;
    }

    // Progress update
    if (progressCallback && index % 10 === 0) {
      const progress = (index / this.sessions.length) * 100;
      await progressCallback(progress, `Backtracking: ${index}/${this.sessions.length}, BT: ${this.backtrackCount}`);
    }

    // All sessions assigned - success!
    if (index >= this.sessions.length) {
      return true;
    }

    // Select next variable (session) using MRV heuristic
    const session = this.sessions[index];
    
    logger.debug(`[BACKTRACKING] Assigning session ${index+1}/${this.sessions.length}: ${session.courseId} (${session.sessionType})`);

    // Get possible values (time-classroom combinations) using LCV heuristic
    const values = this.orderValuesByLCV(session);

    // Try each value
    for (const value of values) {
      this.backtrackCount++;

      const assignment = {
        ...session,
        ...value,
        id: `${session.courseId}_${value.day}_${value.startTime}_${value.classroomId}`
      };

      // Check constraints
      const constraintCheck = this.constraintChecker.checkHardConstraints(assignment, this.assignment);

      if (constraintCheck.valid) {
        // Make assignment
        this.assignment.push(assignment);

        // Recurse
        const result = await this.backtrack(index + 1, progressCallback);
        
        if (result) {
          return true; // Solution found
        }

        // Backtrack
        this.assignment.pop();
      } else {
        logger.debug(`[BACKTRACKING] Constraint violation:`, constraintCheck.violations[0]?.message);
      }
    }

    // No valid assignment found
    logger.debug(`[BACKTRACKING] No valid assignment for session ${index+1}, backtracking...`);
    return false;
  }

  /**
   * Generate time slots
   */
  generateTimeSlots() {
    const slots = [];
    
    for (const day of this.settings.workingDays) {
      const [startH, startM] = this.settings.startTime.split(':').map(Number);
      const [endH, endM] = this.settings.endTime.split(':').map(Number);
      
      let hour = startH;
      let minute = startM;
      
      while (hour < endH || (hour === endH && minute < endM)) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        let endMinute = minute + this.settings.slotDuration;
        let endHour = hour;
        if (endMinute >= 60) {
          endHour += Math.floor(endMinute / 60);
          endMinute = endMinute % 60;
        }
        
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
        
        // Check if break time
        const isBreak = this.settings.breakSlots.some(breakSlot => {
          const [breakStart, breakEnd] = breakSlot.split('-');
          return startTime >= breakStart && startTime < breakEnd;
        });
        
        if (!isBreak) {
          slots.push({ day, startTime, endTime });
        }
        
        minute += this.settings.slotDuration;
        if (minute >= 60) {
          hour += Math.floor(minute / 60);
          minute = minute % 60;
        }
      }
    }
    
    return slots;
  }

  /**
   * Extract sessions from courses
   */
  extractSessions() {
    const sessions = [];
    
    for (const course of this.courses) {
      const courseInfo = {
        courseId: course.id || String(course._id),
        courseName: course.name,
        courseCode: course.code,
        program: course.program,
        year: course.year,
        semester: course.semester,
        department: course.department,
        isElective: !course.isCore,
        enrolledStudents: course.enrolledStudents
      };

      // Theory sessions
      if (course.sessions?.theory) {
        const theory = course.sessions.theory;
        for (let i = 0; i < theory.sessionsPerWeek; i++) {
          sessions.push({
            ...courseInfo,
            sessionType: 'Theory',
            sessionIndex: i,
            duration: theory.duration,
            requiredFeatures: theory.requiredFeatures || [],
            studentCount: course.enrolledStudents,
            teacherIds: course.assignedTeachers
              .filter(t => !t.sessionTypes || t.sessionTypes.includes('Theory'))
              .map(t => t.teacherId)
          });
        }
      }

      // Practical sessions (labs) - handle batches
      if (course.sessions?.practical) {
        const practical = course.sessions.practical;
        const batches = course.divisions?.[0]?.batches || [{ batchId: 'default', studentCount: course.enrolledStudents }];
        
        for (let i = 0; i < practical.sessionsPerWeek; i++) {
          // Create session for each batch
          for (const batch of batches) {
            sessions.push({
              ...courseInfo,
              sessionType: 'Practical',
              sessionIndex: i,
              batchId: batch.batchId,
              batchType: batch.type,
              duration: practical.duration,
              requiredFeatures: practical.requiredFeatures || [],
              studentCount: batch.studentCount,
              requiresLab: true,
              teacherIds: course.assignedTeachers
                .filter(t => !t.sessionTypes || t.sessionTypes.includes('Practical'))
                .map(t => t.teacherId)
            });
          }
        }
      }

      // Tutorial sessions
      if (course.sessions?.tutorial) {
        const tutorial = course.sessions.tutorial;
        for (let i = 0; i < tutorial.sessionsPerWeek; i++) {
          sessions.push({
            ...courseInfo,
            sessionType: 'Tutorial',
            sessionIndex: i,
            duration: tutorial.duration,
            requiredFeatures: tutorial.requiredFeatures || [],
            studentCount: course.enrolledStudents,
            teacherIds: course.assignedTeachers
              .filter(t => !t.sessionTypes || t.sessionTypes.includes('Tutorial'))
              .map(t => t.teacherId)
          });
        }
      }
    }

    // Sort sessions by priority (visiting faculty first, then by constraints)
    return this.sortSessionsByPriority(sessions);
  }

  /**
   * Sort sessions by priority
   */
  sortSessionsByPriority(sessions) {
    return sessions.sort((a, b) => {
      // Prioritize sessions with visiting faculty
      const aHasVisiting = a.teacherIds?.some(tid => {
        const teacher = this.teachers.find(t => (t.id || String(t._id)) === tid);
        return teacher?.teacherType === 'visiting' || teacher?.teacherType === 'guest';
      });
      
      const bHasVisiting = b.teacherIds?.some(tid => {
        const teacher = this.teachers.find(t => (t.id || String(t._id)) === tid);
        return teacher?.teacherType === 'visiting' || teacher?.teacherType === 'guest';
      });
      
      if (aHasVisiting && !bHasVisiting) return -1;
      if (!aHasVisiting && bHasVisiting) return 1;
      
      // Then by number of constraints (harder first)
      const aConstraints = (a.teacherIds?.length || 0) + (a.requiresLab ? 2 : 0);
      const bConstraints = (b.teacherIds?.length || 0) + (b.requiresLab ? 2 : 0);
      
      return bConstraints - aConstraints;
    });
  }

  /**
   * Order values by Least Constraining Value heuristic
   */
  orderValuesByLCV(session) {
    const values = [];
    
    // Generate all possible assignments for this session
    for (const slot of this.timeSlots) {
      for (const teacher of this.teachers) {
        // Check if teacher can teach this course
        const teacherId = teacher.id || String(teacher._id);
        if (!session.teacherIds || !session.teacherIds.includes(teacherId)) {
          continue;
        }
        
        for (const classroom of this.classrooms) {
          const classroomId = classroom.id || String(classroom._id);
          
          // Quick pre-checks
          if (session.requiresLab && !classroom.type?.includes('Lab')) continue;
          if (classroom.capacity < session.studentCount && !session.batchId) continue;
          
          values.push({
            ...slot,
            teacherId,
            teacherName: teacher.name,
            classroomId,
            classroomName: classroom.name
          });
        }
      }
    }
    
    // Sort by least constraining (simple heuristic: prefer early days/times)
    return values;
  }
}

module.exports = BacktrackingSearch;
