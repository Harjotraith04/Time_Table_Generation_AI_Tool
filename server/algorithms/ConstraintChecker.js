/**
 * Constraint Checker Utility
 * 
 * Centralized constraint validation for all scheduling algorithms
 * Handles hard constraints, soft constraints, and optimization objectives
 */

const logger = require('../utils/logger');

class ConstraintChecker {
  constructor(teachers, classrooms, courses, settings = {}) {
    this.teachers = teachers || [];
    this.classrooms = classrooms || [];
    this.courses = courses || [];
    this.settings = settings;
    
    // Create lookup maps for faster access
    this.teacherMap = new Map(teachers.map(t => [t.id || String(t._id), t]));
    this.classroomMap = new Map(classrooms.map(c => [c.id || String(c._id), c]));
    this.courseMap = new Map(courses.map(c => [c.id || String(c._id), c]));
  }

  /**
   * Check all hard constraints for a slot assignment
   * Returns { valid: boolean, violations: [] }
   */
  checkHardConstraints(assignment, schedule = []) {
    const violations = [];

    // 1. Teacher conflict check - No teacher can be in two places at once
    const teacherConflict = this.checkTeacherConflict(assignment, schedule);
    if (teacherConflict) violations.push(teacherConflict);

    // 2. Classroom conflict check - No classroom can host two classes at once
    const classroomConflict = this.checkClassroomConflict(assignment, schedule);
    if (classroomConflict) violations.push(classroomConflict);

    // 3. Student group conflict check - No student can be in two classes at once
    const studentConflict = this.checkStudentGroupConflict(assignment, schedule);
    if (studentConflict) violations.push(studentConflict);

    // 4. Teacher availability check
    const availabilityViolation = this.checkTeacherAvailability(assignment);
    if (availabilityViolation) violations.push(availabilityViolation);

    // 5. Classroom capacity check
    const capacityViolation = this.checkClassroomCapacity(assignment);
    if (capacityViolation) violations.push(capacityViolation);

    // 6. Classroom features check (for labs)
    const featuresViolation = this.checkClassroomFeatures(assignment);
    if (featuresViolation) violations.push(featuresViolation);

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Check if teacher has a conflict at the given time
   */
  checkTeacherConflict(assignment, schedule) {
    const { teacherId, day, startTime, endTime } = assignment;
    
    for (const slot of schedule) {
      if (slot.teacherId === teacherId && 
          slot.day === day && 
          this.timeOverlaps(slot.startTime, slot.endTime, startTime, endTime)) {
        return {
          type: 'TEACHER_CONFLICT',
          severity: 'critical',
          message: `Teacher ${teacherId} is already teaching ${slot.courseId} at ${day} ${startTime}-${endTime}`,
          conflictingSlot: slot
        };
      }
    }
    return null;
  }

  /**
   * Check if classroom has a conflict at the given time
   * EXCEPTION: Multiple lab sessions can occur simultaneously if different teachers/subjects
   */
  checkClassroomConflict(assignment, schedule) {
    const { classroomId, day, startTime, endTime, sessionType, teacherId, courseId } = assignment;
    
    for (const slot of schedule) {
      if (slot.classroomId === classroomId && 
          slot.day === day && 
          this.timeOverlaps(slot.startTime, slot.endTime, startTime, endTime)) {
        
        // EXCEPTION: Labs can run simultaneously if:
        // 1. Both are lab sessions
        // 2. Different teachers
        // 3. Different courses
        const isLabException = 
          sessionType === 'Practical' && 
          slot.sessionType === 'Practical' &&
          slot.teacherId !== teacherId &&
          slot.courseId !== courseId;
        
        if (!isLabException) {
          return {
            type: 'CLASSROOM_CONFLICT',
            severity: 'critical',
            message: `Classroom ${classroomId} is already booked for ${slot.courseId} at ${day} ${startTime}-${endTime}`,
            conflictingSlot: slot
          };
        }
      }
    }
    return null;
  }

  /**
   * Check if student group has a conflict
   * EXCEPTION: Electives can run simultaneously as students are split
   */
  checkStudentGroupConflict(assignment, schedule) {
    const { program, year, semester, divisionId, batchId, day, startTime, endTime, courseId, isElective } = assignment;
    
    const course = this.courseMap.get(courseId);
    
    for (const slot of schedule) {
      // Same program, year, semester means potentially same students
      if (slot.program === program && 
          slot.year === year && 
          slot.semester === semester &&
          slot.day === day && 
          this.timeOverlaps(slot.startTime, slot.endTime, startTime, endTime)) {
        
        // Check division/batch overlap
        const hasDivisionOverlap = divisionId && slot.divisionId === divisionId;
        const hasBatchOverlap = batchId && slot.batchId === batchId;
        
        // EXCEPTION: Electives can run simultaneously
        // Students choose 1 out of 3, so different elective courses don't conflict
        const isElectiveException = isElective && slot.isElective && slot.courseId !== courseId;
        
        if ((hasDivisionOverlap || (!divisionId && !slot.divisionId)) && !isElectiveException) {
          // If no batch specified, it's a full division class - conflict
          if (!batchId && !hasBatchOverlap) {
            return {
              type: 'STUDENT_GROUP_CONFLICT',
              severity: 'critical',
              message: `Student group (${program} Y${year} S${semester}${divisionId ? ' Div:' + divisionId : ''}${batchId ? ' Batch:' + batchId : ''}) already has ${slot.courseId} at ${day} ${startTime}-${endTime}`,
              conflictingSlot: slot
            };
          }
          
          // If same batch, definitely a conflict
          if (batchId && hasBatchOverlap) {
            return {
              type: 'STUDENT_GROUP_CONFLICT',
              severity: 'critical',
              message: `Batch ${batchId} already has ${slot.courseId} at ${day} ${startTime}-${endTime}`,
              conflictingSlot: slot
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if teacher is available at the given time
   */
  checkTeacherAvailability(assignment) {
    const { teacherId, day, startTime } = assignment;
    const teacher = this.teacherMap.get(teacherId);
    
    if (!teacher) {
      return {
        type: 'TEACHER_NOT_FOUND',
        severity: 'critical',
        message: `Teacher ${teacherId} not found`
      };
    }

    const dayLower = day.toLowerCase();
    const availability = teacher.availability?.[dayLower];
    
    if (!availability || !availability.available) {
      return {
        type: 'TEACHER_UNAVAILABLE',
        severity: 'critical',
        message: `Teacher ${teacher.name} is not available on ${day}`
      };
    }

    if (startTime < availability.startTime || startTime >= availability.endTime) {
      return {
        type: 'TEACHER_UNAVAILABLE',
        severity: 'critical',
        message: `Teacher ${teacher.name} is not available at ${startTime} on ${day}`
      };
    }

    return null;
  }

  /**
   * Check if classroom has sufficient capacity
   */
  checkClassroomCapacity(assignment) {
    const { classroomId, studentCount, batchId } = assignment;
    const classroom = this.classroomMap.get(classroomId);
    
    if (!classroom) {
      return {
        type: 'CLASSROOM_NOT_FOUND',
        severity: 'critical',
        message: `Classroom ${classroomId} not found`
      };
    }

    const requiredCapacity = studentCount || 30;
    
    // For labs with batches, capacity can be smaller
    // Otherwise, need full capacity
    if (classroom.capacity < requiredCapacity && !batchId) {
      return {
        type: 'INSUFFICIENT_CAPACITY',
        severity: 'high',
        message: `Classroom ${classroom.name} capacity (${classroom.capacity}) is less than required (${requiredCapacity})`
      };
    }

    return null;
  }

  /**
   * Check if classroom has required features
   */
  checkClassroomFeatures(assignment) {
    const { classroomId, sessionType, requiredFeatures = [] } = assignment;
    const classroom = this.classroomMap.get(classroomId);
    
    if (!classroom) return null;

    // Lab sessions require lab facilities
    if (sessionType === 'Practical') {
      const isLab = classroom.type?.includes('Lab');
      if (!isLab) {
        return {
          type: 'CLASSROOM_TYPE_MISMATCH',
          severity: 'high',
          message: `Classroom ${classroom.name} is not a lab (${classroom.type})`
        };
      }
    }

    // Check specific required features
    const classroomFeatures = classroom.features || [];
    const missingFeatures = requiredFeatures.filter(f => !classroomFeatures.includes(f));
    
    if (missingFeatures.length > 0) {
      return {
        type: 'MISSING_FEATURES',
        severity: 'medium',
        message: `Classroom ${classroom.name} is missing features: ${missingFeatures.join(', ')}`
      };
    }

    return null;
  }

  /**
   * Evaluate soft constraints and return a score (0-1, higher is better)
   */
  evaluateSoftConstraints(assignment, schedule = []) {
    let score = 1.0;
    const penalties = [];

    // 1. Teacher preference penalties
    const teacherPref = this.checkTeacherPreferences(assignment);
    score -= teacherPref.penalty;
    if (teacherPref.penalty > 0) penalties.push(teacherPref);

    // 2. Classroom utilization score
    const utilization = this.checkClassroomUtilization(assignment);
    score -= utilization.penalty;
    if (utilization.penalty > 0) penalties.push(utilization);

    // 3. Balanced workload penalty
    const workload = this.checkTeacherWorkload(assignment, schedule);
    score -= workload.penalty;
    if (workload.penalty > 0) penalties.push(workload);

    // 4. Consecutive hours penalty (too many back-to-back)
    const consecutive = this.checkConsecutiveHours(assignment, schedule);
    score -= consecutive.penalty;
    if (consecutive.penalty > 0) penalties.push(consecutive);

    // 5. Gap penalty (too many gaps in schedule)
    const gaps = this.checkScheduleGaps(assignment, schedule);
    score -= gaps.penalty;
    if (gaps.penalty > 0) penalties.push(gaps);

    return {
      score: Math.max(0, score),
      penalties
    };
  }

  /**
   * Check teacher preferences
   */
  checkTeacherPreferences(assignment) {
    const { teacherId, day, startTime } = assignment;
    const teacher = this.teacherMap.get(teacherId);
    let penalty = 0;
    const reasons = [];

    if (!teacher || !teacher.preferences) {
      return { penalty: 0, reasons };
    }

    // Check preferred time slots
    if (teacher.preferences.preferredTimeSlots?.length > 0) {
      const isPreferred = teacher.preferences.preferredTimeSlots.some(slot => 
        slot.day === day && startTime >= slot.startTime && startTime <= slot.endTime
      );
      if (!isPreferred) {
        penalty += 0.1;
        reasons.push('Not in preferred time slot');
      }
    }

    // Check avoid time slots
    if (teacher.preferences.avoidTimeSlots?.length > 0) {
      const isAvoided = teacher.preferences.avoidTimeSlots.some(slot => 
        slot.day === day && startTime >= slot.startTime && startTime <= slot.endTime
      );
      if (isAvoided) {
        penalty += 0.2;
        reasons.push('In avoided time slot');
      }
    }

    return { penalty, reasons };
  }

  /**
   * Check classroom utilization
   */
  checkClassroomUtilization(assignment) {
    const { classroomId, studentCount } = assignment;
    const classroom = this.classroomMap.get(classroomId);
    let penalty = 0;

    if (!classroom) return { penalty: 0 };

    const utilization = studentCount / classroom.capacity;
    
    // Penalize poor utilization (less than 50% or overbooked)
    if (utilization < 0.5) {
      penalty = 0.15 * (1 - utilization);
    } else if (utilization > 1.0) {
      penalty = 0.25 * (utilization - 1.0);
    }

    return { 
      penalty, 
      reasons: penalty > 0 ? [`Poor utilization: ${(utilization * 100).toFixed(1)}%`] : []
    };
  }

  /**
   * Check teacher workload balance
   */
  checkTeacherWorkload(assignment, schedule) {
    const { teacherId } = assignment;
    const teacher = this.teacherMap.get(teacherId);
    let penalty = 0;

    if (!teacher) return { penalty: 0 };

    // Count current hours for this teacher
    const teacherSlots = schedule.filter(s => s.teacherId === teacherId);
    const currentHours = teacherSlots.reduce((sum, slot) => {
      const duration = this.calculateDuration(slot.startTime, slot.endTime);
      return sum + duration;
    }, 0);

    const maxHours = teacher.maxHoursPerWeek || 20;
    const utilization = currentHours / maxHours;

    // Penalize if approaching max hours (over 90%)
    if (utilization > 0.9) {
      penalty = 0.2 * (utilization - 0.9) / 0.1;
    }

    return { 
      penalty, 
      reasons: penalty > 0 ? [`High workload: ${(utilization * 100).toFixed(1)}%`] : []
    };
  }

  /**
   * Check consecutive hours constraint
   */
  checkConsecutiveHours(assignment, schedule) {
    const { teacherId, day, startTime, endTime } = assignment;
    const teacher = this.teacherMap.get(teacherId);
    let penalty = 0;

    if (!teacher) return { penalty: 0 };

    const maxConsecutive = teacher.preferences?.maxConsecutiveHours || 3;
    
    // Find consecutive slots for this teacher on this day
    const daySlots = schedule
      .filter(s => s.teacherId === teacherId && s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Add current assignment
    daySlots.push(assignment);
    daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Count consecutive hours
    let consecutiveCount = 1;
    for (let i = 1; i < daySlots.length; i++) {
      if (daySlots[i].startTime === daySlots[i-1].endTime) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }
    }

    if (consecutiveCount > maxConsecutive) {
      penalty = 0.15 * (consecutiveCount - maxConsecutive);
    }

    return { 
      penalty, 
      reasons: penalty > 0 ? [`Too many consecutive hours: ${consecutiveCount}`] : []
    };
  }

  /**
   * Check schedule gaps
   */
  checkScheduleGaps(assignment, schedule) {
    const { teacherId, day } = assignment;
    let penalty = 0;

    const daySlots = schedule
      .filter(s => s.teacherId === teacherId && s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Add current assignment
    daySlots.push(assignment);
    daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Calculate gaps
    let totalGapMinutes = 0;
    for (let i = 1; i < daySlots.length; i++) {
      const gap = this.calculateDuration(daySlots[i-1].endTime, daySlots[i].startTime);
      if (gap > 0 && gap < 180) { // Gaps between 0 and 3 hours
        totalGapMinutes += gap;
      }
    }

    // Penalize excessive gaps
    if (totalGapMinutes > 120) { // More than 2 hours of gaps
      penalty = 0.1 * (totalGapMinutes - 120) / 60;
    }

    return { 
      penalty, 
      reasons: penalty > 0 ? [`Excessive gaps: ${totalGapMinutes} minutes`] : []
    };
  }

  /**
   * Sort teachers by priority (visiting faculty first)
   */
  sortTeachersByPriority(teachers) {
    return teachers.sort((a, b) => {
      // Visiting faculty (or high priority) first
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Then by teaching load (less loaded first)
      const aLoad = a.currentWorkload || 0;
      const bLoad = b.currentWorkload || 0;
      return aLoad - bLoad;
    });
  }

  /**
   * Sort courses by priority and constraints
   */
  sortCoursesByPriority(courses) {
    return courses.sort((a, b) => {
      // Critical courses first
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 2;
      const bPriority = priorityOrder[b.priority] || 2;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Courses with more constraints first (harder to schedule)
      const aConstraints = this.countCourseConstraints(a);
      const bConstraints = this.countCourseConstraints(b);
      return bConstraints - aConstraints;
    });
  }

  /**
   * Count constraints for a course
   */
  countCourseConstraints(course) {
    let count = 0;
    if (course.sessions?.practical) count += 2; // Labs are harder
    if (course.constraints?.preferredTimeSlots?.length > 0) count++;
    if (course.constraints?.avoidTimeSlots?.length > 0) count++;
    if (course.constraints?.mustBeConsecutive) count++;
    return count;
  }

  /**
   * Utility: Check if two time ranges overlap
   */
  timeOverlaps(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Utility: Calculate duration in minutes between two times
   */
  calculateDuration(startTime, endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  }
}

module.exports = ConstraintChecker;
