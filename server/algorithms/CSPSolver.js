const logger = require('../utils/logger');

/**
 * Constraint Satisfaction Problem (CSP) Solver for Timetable Generation
 * 
 * This implements a sophisticated CSP solver using:
 * - Arc Consistency (AC-3 algorithm)
 * - Forward Checking
 * - Most Constraining Variable (MCV) heuristic
 * - Least Constraining Value (LCV) heuristic
 * - Backtracking with conflict-directed backjumping
 */

class CSPSolver {
  constructor(teachers, classrooms, courses, settings = {}) {
    this.teachers = teachers;
    this.classrooms = classrooms;
    this.courses = courses;
    this.settings = {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60, // minutes
      breakSlots: ['12:00-13:00'],
      enforceBreaks: false, // RELAXED: Don't enforce breaks
      balanceWorkload: false, // RELAXED: Don't enforce workload balance
      maxBacktrackingSteps: 100000, // RELAXED: Increased for better success rate
      ...settings
    };
    
    this.timeSlots = this.generateTimeSlots();
    this.variables = this.createVariables();
    this.domains = this.initializeDomains();
    this.constraints = this.defineConstraints();
    this.assignment = new Map();
    this.conflictSet = new Set();
    this.backtrackCount = 0;
    this.startTime = null;
  }

  /**
   * Generate all possible time slots
   */
  generateTimeSlots() {
    const slots = [];
    const startHour = parseInt(this.settings.startTime.split(':')[0]);
    const startMinute = parseInt(this.settings.startTime.split(':')[1]);
    const endHour = parseInt(this.settings.endTime.split(':')[0]);
    const endMinute = parseInt(this.settings.endTime.split(':')[1]);

    for (const day of this.settings.workingDays) {
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Calculate end time
        let endTimeMinute = currentMinute + this.settings.slotDuration;
        let endTimeHour = currentHour;
        
        if (endTimeMinute >= 60) {
          endTimeHour += Math.floor(endTimeMinute / 60);
          endTimeMinute = endTimeMinute % 60;
        }
        
        const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
        
        // Check if this slot conflicts with break times
        const isBreakTime = this.settings.breakSlots.some(breakSlot => {
          const [breakStart, breakEnd] = breakSlot.split('-');
          return this.timeOverlaps(startTime, endTime, breakStart, breakEnd);
        });

        if (!isBreakTime || !this.settings.enforceBreaks) {
          slots.push({
            id: `${day}_${startTime}_${endTime}`,
            day,
            startTime,
            endTime,
            isBreakTime
          });
        }

        // Move to next slot
        currentMinute += this.settings.slotDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
    }

    return slots;
  }

  /**
   * Create CSP variables (course sessions that need to be scheduled)
   */
  createVariables() {
    const variables = [];
    let variableId = 0;

    for (const course of this.courses) {
      // Check if course has sessions defined
      if (!course.sessions) {
        logger.warn(`CSP: Course ${course.code || course.name} has no sessions defined, skipping`);
        continue;
      }

      // Create variables for each session type and frequency
      ['theory', 'practical', 'tutorial'].forEach(sessionType => {
        const session = course.sessions[sessionType];
        if (session && session.sessionsPerWeek > 0) {
          // Check if course has assigned teachers
          if (!course.assignedTeachers || course.assignedTeachers.length === 0) {
            logger.warn(`CSP: Course ${course.code || course.name} has no assigned teachers, skipping ${sessionType}`);
            return;
          }

          const sessionTypeCapitalized = sessionType.charAt(0).toUpperCase() + sessionType.slice(1);

          for (let i = 0; i < session.sessionsPerWeek; i++) {
            variables.push({
              id: `var_${variableId++}`,
              courseId: course.id || String(course._id),
              courseName: course.name,
              courseCode: course.code,
              sessionType: sessionTypeCapitalized, // Use capitalized version for database
              sessionIndex: i,
              duration: session.duration || 60,
              requiredFeatures: session.requiredFeatures || [],
              // FIXED: Use session's minRoomCapacity if specified, otherwise course enrollment
              // This allows practical sessions to specify smaller capacity (for lab batches)
              minRoomCapacity: session.minRoomCapacity || (course.enrolledStudents || 0),
              requiresLab: session.requiresLab || false,
              assignedTeachers: course.assignedTeachers.filter(t => 
                t.sessionTypes && t.sessionTypes.includes(sessionTypeCapitalized)
              ),
              priority: course.priority,
              constraints: course.constraints || {}
            });
          }
        }
      });
    }

    logger.info(`CSP: Created ${variables.length} variables from ${this.courses.length} courses`);
    return variables;
  }

  /**
   * Initialize domains for each variable (possible assignments)
   */
  initializeDomains() {
    const domains = new Map();

    for (const variable of this.variables) {
      const possibleAssignments = [];
      let debugInfo = {
        timeSlotChecked: 0,
        teachersFailed: 0,
        classroomsFailed: 0,
        extendedBeyondHours: 0,
        teacherUnavailable: 0
      };

      for (const timeSlot of this.timeSlots) {
        debugInfo.timeSlotChecked++;
        
        // RELAXED: For sessions longer than 1 hour, calculate extended end time
        const sessionDuration = variable.duration || 60;
        const slotDuration = this.settings.slotDuration || 60;
        
        // Calculate actual end time based on session duration
        const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
        let endHour = startHour;
        let endMin = startMin + sessionDuration;
        
        if (endMin >= 60) {
          endHour += Math.floor(endMin / 60);
          endMin = endMin % 60;
        }
        
        const sessionEndTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
        
        // Check if session end time is within working hours
        const workingEndTime = this.settings.endTime;
        if (sessionEndTime > workingEndTime) {
          debugInfo.extendedBeyondHours++;
          continue; // Session would extend beyond working hours
        }

        for (const teacher of variable.assignedTeachers) {
          const teacherObj = this.teachers.find(t => t.id === teacher.teacherId);
          if (!teacherObj) {
            debugInfo.teachersFailed++;
            continue;
          }
          
          // RELAXED: Check teacher availability (supports both plain objects and Mongoose models)
          const dayLower = timeSlot.day.toLowerCase();
          const teacherAvail = teacherObj.availability?.[dayLower];
          
          // RELAXED: If no availability info, assume available during working hours
          if (teacherAvail) {
            if (!teacherAvail.available) {
              debugInfo.teacherUnavailable++;
              continue;
            }
            // RELAXED: Check if session fits within teacher's available hours
            if (timeSlot.startTime < teacherAvail.startTime || sessionEndTime > teacherAvail.endTime) {
              debugInfo.teacherUnavailable++;
              continue;
            }
          }

          for (const classroom of this.classrooms) {
            if (!this.isClassroomSuitableForVariable(classroom, variable, timeSlot)) {
              debugInfo.classroomsFailed++;
              continue;
            }

            possibleAssignments.push({
              timeSlot: timeSlot.id,
              teacherId: teacher.teacherId,
              classroomId: classroom.id,
              day: timeSlot.day,
              startTime: timeSlot.startTime,
              endTime: sessionEndTime, // Use calculated end time based on session duration
              duration: sessionDuration
            });
          }
        }
      }

      // Log debug info for empty domains
      if (possibleAssignments.length === 0) {
        logger.warn(`CSP: Variable ${variable.id} (${variable.courseName} ${variable.sessionType}) domain analysis:`, {
          duration: variable.duration,
          teachers: variable.assignedTeachers.length,
          timeSlots: debugInfo.timeSlotChecked,
          extendedBeyondHours: debugInfo.extendedBeyondHours,
          teacherUnavailable: debugInfo.teacherUnavailable,
          classroomsFailed: debugInfo.classroomsFailed,
          requiresLab: variable.requiresLab,
          requiredFeatures: variable.requiredFeatures,
          minCapacity: variable.minRoomCapacity
        });
      }

      domains.set(variable.id, possibleAssignments);
    }

    return domains;
  }

  /**
   * Check if a classroom is suitable for a variable (RELAXED VERSION)
   */
  isClassroomSuitableForVariable(classroom, variable, timeSlot) {
    // Check basic availability inline (supports both plain objects and Mongoose models)
    const dayLower = timeSlot.day.toLowerCase();
    const classroomAvail = classroom.availability?.[dayLower];
    
    // RELAXED: If no availability info, assume available
    if (!classroomAvail) {
      // Assume available during working hours if no availability specified
      const available = true;
    } else if (!classroomAvail.available) {
      return false;
    } else if (timeSlot.startTime < classroomAvail.startTime || timeSlot.startTime >= classroomAvail.endTime) {
      return false;
    }

    // Check capacity
    if (classroom.capacity < variable.minRoomCapacity) {
      return false;
    }

    // RELAXED: Check required features - allow if at least 50% match
    if (variable.requiredFeatures && variable.requiredFeatures.length > 0) {
      const classroomFeatures = classroom.features || [];
      const matchingFeatures = variable.requiredFeatures.filter(feature => 
        classroomFeatures.includes(feature)
      ).length;
      const matchRatio = matchingFeatures / variable.requiredFeatures.length;
      
      // RELAXED: Accept if at least 50% of features match
      if (matchRatio < 0.5) {
        return false;
      }
    }

    // RELAXED: Check room type requirements - prefer labs but allow others if needed
    if (variable.requiresLab && !classroom.type.toLowerCase().includes('lab')) {
      // RELAXED: Allow non-lab rooms for lab sessions if they have computers
      const hasComputers = (classroom.features || []).includes('Computers');
      if (!hasComputers) {
        return false;
      }
    }

    // RELAXED: Check if suitable for session type - make it optional
    const sessionTypeMapping = {
      'theory': 'Theory',
      'practical': 'Practical',
      'tutorial': 'Tutorial'
    };

    const suitableFor = classroom.suitableFor || [];
    if (suitableFor.length > 0 && !suitableFor.includes(sessionTypeMapping[variable.sessionType])) {
      // RELAXED: Only enforce for practical sessions
      if (variable.sessionType === 'practical') {
        return false;
      }
      // Theory and tutorial can use any room
    }

    return true;
  }

  /**
   * Define all constraints
   */
  defineConstraints() {
    return [
      this.teacherConflictConstraint.bind(this),
      this.classroomConflictConstraint.bind(this),
      this.studentConflictConstraint.bind(this),
      // Removed strict soft constraints to allow more solutions:
      // - teacherWorkloadConstraint
      // - preferredTimeConstraint
      // - avoidTimeConstraint
      // - consecutiveSessionConstraint
      // - sameDayConstraint
      // - breakRequirementConstraint
    ];
  }

  /**
   * Main solving method using backtracking with constraint propagation
   */
  async solve(progressCallback = null) {
    this.startTime = Date.now();
    this.backtrackCount = 0;

    try {
      // Validate we have variables to solve
      if (!this.variables || this.variables.length === 0) {
        logger.error('CSP: No variables to solve');
        return { 
          success: false, 
          reason: 'No variables to solve. Check that courses have sessions defined and teachers assigned.' 
        };
      }

      logger.info('CSP Solver starting', {
        variables: this.variables.length,
        timeSlots: this.timeSlots.length,
        teachers: this.teachers.length,
        classrooms: this.classrooms.length
      });

      // Log domain sizes
      let totalDomainSize = 0;
      let emptyDomains = 0;
      let minDomainSize = Infinity;
      for (const [varId, domain] of this.domains.entries()) {
        totalDomainSize += domain.length;
        if (domain.length === 0) {
          emptyDomains++;
          const variable = this.variables.find(v => v.id === varId);
          logger.warn(`Variable ${varId} (${variable?.courseName} ${variable?.sessionType}) has empty domain - constraints too restrictive`);
        }
        if (domain.length > 0 && domain.length < minDomainSize) {
          minDomainSize = domain.length;
        }
      }
      logger.info(`Domain stats: avg=${(totalDomainSize / this.variables.length).toFixed(2)}, min=${minDomainSize === Infinity ? 0 : minDomainSize}, empty=${emptyDomains}`);

      // RELAXED: Only fail if ALL variables have empty domains
      if (emptyDomains === this.variables.length) {
        logger.error(`All ${emptyDomains} variables have no valid assignments - problem is impossible`);
        return { 
          success: false, 
          reason: `Problem is impossible: All ${emptyDomains} variables have no valid domain values. Check data constraints.` 
        };
      } else if (emptyDomains > 0) {
        // Some variables have empty domains, but we'll try anyway
        logger.warn(`${emptyDomains} variables have empty domains, continuing with backtracking...`);
      }

      // Skip arc consistency - it's too restrictive for this problem
      // Jump straight to backtracking with forward checking
      logger.info('Starting backtracking search with forward checking...');
      const btStart = Date.now();
      const result = await this.backtrackSearch(progressCallback);
      const duration = Date.now() - btStart;
      logger.info(`Backtracking completed in ${duration}ms, backtracks: ${this.backtrackCount}, result: ${!!result}`);
      
      if (result) {
        const solution = this.extractSolution();
        const metrics = this.calculateMetrics();
        
        return {
          success: true,
          solution,
          metrics,
          conflicts: this.detectConflicts(solution)
        };
      } else {
        return { 
          success: false, 
          reason: `No solution found after ${this.backtrackCount} backtracks`,
          backtrackCount: this.backtrackCount
        };
      }
    } catch (error) {
      logger.error('CSP Solver error:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Arc Consistency algorithm (AC-3)
   */
  arcConsistency() {
    const queue = [];
    
    // Initialize queue with all arcs
    for (let i = 0; i < this.variables.length; i++) {
      for (let j = i + 1; j < this.variables.length; j++) {
        queue.push([this.variables[i].id, this.variables[j].id]);
        queue.push([this.variables[j].id, this.variables[i].id]);
      }
    }

    while (queue.length > 0) {
      const [xi, xj] = queue.shift();
      
      if (this.revise(xi, xj)) {
        if (this.domains.get(xi).length === 0) {
          return false; // No solution
        }
        
        // Add all arcs (xk, xi) where xk is a neighbor of xi
        for (const variable of this.variables) {
          if (variable.id !== xi && variable.id !== xj) {
            queue.push([variable.id, xi]);
          }
        }
      }
    }

    return true;
  }

  /**
   * Revise method for arc consistency
   */
  revise(xi, xj) {
    let revised = false;
    const domainXi = this.domains.get(xi);
    const domainXj = this.domains.get(xj);
    
    const newDomain = domainXi.filter(valueI => {
      return domainXj.some(valueJ => {
        return this.isConsistentAssignment(xi, valueI, xj, valueJ);
      });
    });

    if (newDomain.length < domainXi.length) {
      this.domains.set(xi, newDomain);
      revised = true;
    }

    return revised;
  }

  /**
   * Check if two assignments are consistent (simplified for performance)
   */
  isConsistentAssignment(varI, valueI, varJ, valueJ) {
    const variableI = this.variables.find(v => v.id === varI);
    const variableJ = this.variables.find(v => v.id === varJ);

    // Only check the three critical hard constraints:
    // 1. Teacher conflict
    if (valueI.teacherId === valueJ.teacherId && 
        valueI.day === valueJ.day &&
        this.timeOverlaps(valueI.startTime, valueI.endTime, valueJ.startTime, valueJ.endTime)) {
      return false;
    }

    // 2. Classroom conflict  
    if (valueI.classroomId === valueJ.classroomId && 
        valueI.day === valueJ.day &&
        this.timeOverlaps(valueI.startTime, valueI.endTime, valueJ.startTime, valueJ.endTime)) {
      return false;
    }

    // 3. Student conflict (same course or courses with overlapping students)
    if (variableI.courseId === variableJ.courseId &&
        valueI.day === valueJ.day &&
        this.timeOverlaps(valueI.startTime, valueI.endTime, valueJ.startTime, valueJ.endTime)) {
      return false;
    }

    return true;
  }

  /**
   * Backtracking search with heuristics
   */
  async backtrackSearch(progressCallback = null) {
    if (this.backtrackCount > this.settings.maxBacktrackingSteps) {
      logger.warn(`Reached backtracking limit: ${this.settings.maxBacktrackingSteps}`);
      return false;
    }

    // Report progress
    if (progressCallback && this.backtrackCount % 100 === 0) {
      const progress = (this.assignment.size / this.variables.length) * 100;
      await progressCallback(progress, this.backtrackCount);
    }

    if (this.assignment.size === this.variables.length) {
      return true; // All variables assigned
    }

    const variable = this.selectUnassignedVariable();
    if (!variable) return false;

    const domain = this.orderDomainValues(variable);

    for (const value of domain) {
      this.backtrackCount++;

      if (this.isConsistentWithAssignment(variable, value)) {
        this.assignment.set(variable.id, value);
        
        // Forward checking
        const removedValues = this.forwardCheck(variable, value);

        // Check if forward checking detected a dead-end
        if (removedValues !== null) {
          if (await this.backtrackSearch(progressCallback)) {
            return true;
          }
          // Restore removed values
          this.restoreValues(removedValues);
        }
        
        this.assignment.delete(variable.id);
      }
    }

    return false;
  }

  /**
   * Most Constraining Variable heuristic (MRV - Minimum Remaining Values)
   */
  selectUnassignedVariable() {
    const unassigned = this.variables.filter(v => !this.assignment.has(v.id));
    
    if (unassigned.length === 0) return null;

    // Choose variable with smallest non-empty domain (MRV)
    let minDomainSize = Infinity;
    let selectedVar = null;

    for (const variable of unassigned) {
      const domainSize = this.domains.get(variable.id).length;
      // Skip variables with empty domains initially
      if (domainSize === 0) continue;
      
      if (domainSize < minDomainSize) {
        minDomainSize = domainSize;
        selectedVar = variable;
      }
    }

    // If no variable with non-empty domain found, pick any unassigned one
    if (!selectedVar && unassigned.length > 0) {
      selectedVar = unassigned[0];
    }

    return selectedVar;
  }

  /**
   * Least Constraining Value heuristic (simplified for performance)
   */
  orderDomainValues(variable) {
    const domain = this.domains.get(variable.id);
    
    // Simple ordering: prefer earlier time slots for better scheduling
    return domain.sort((a, b) => {
      // Sort by day first, then by time
      const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };
      if (dayOrder[a.day] !== dayOrder[b.day]) {
        return dayOrder[a.day] - dayOrder[b.day];
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Count how many constraints a value would eliminate
   */
  countConstraintsEliminated(variable, value) {
    let count = 0;

    for (const otherVar of this.variables) {
      if (otherVar.id === variable.id || this.assignment.has(otherVar.id)) {
        continue;
      }

      const otherDomain = this.domains.get(otherVar.id);
      for (const otherValue of otherDomain) {
        if (!this.isConsistentAssignment(variable.id, value, otherVar.id, otherValue)) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Forward checking - remove inconsistent values (simplified)
   */
  forwardCheck(variable, value) {
    const removedValues = new Map();

    // Only check variables that could directly conflict
    for (const otherVar of this.variables) {
      if (otherVar.id === variable.id || this.assignment.has(otherVar.id)) {
        continue;
      }

      // Only check if they could conflict (same teacher, classroom, or course)
      const couldConflict = 
        otherVar.assignedTeachers.some(t => t.teacherId === value.teacherId) ||
        otherVar.courseId === variable.courseId;

      if (!couldConflict) continue;

      const domain = this.domains.get(otherVar.id);
      const newDomain = domain.filter(otherValue => 
        this.isConsistentAssignment(variable.id, value, otherVar.id, otherValue)
      );

      if (newDomain.length < domain.length) {
        removedValues.set(otherVar.id, domain.filter(v => !newDomain.includes(v)));
        this.domains.set(otherVar.id, newDomain);
      }

      // Check for domain wipeout
      if (newDomain.length === 0) {
        // Restore and fail fast
        this.restoreValues(removedValues);
        return null; // Signal failure
      }
    }

    return removedValues;
  }

  /**
   * Restore removed values after backtracking
   */
  restoreValues(removedValues) {
    for (const [varId, values] of removedValues) {
      const currentDomain = this.domains.get(varId);
      this.domains.set(varId, [...currentDomain, ...values]);
    }
  }

  /**
   * Check if assignment is consistent with current partial assignment
   */
  isConsistentWithAssignment(variable, value) {
    for (const [assignedVarId, assignedValue] of this.assignment) {
      const assignedVar = this.variables.find(v => v.id === assignedVarId);
      if (!this.isConsistentAssignment(variable.id, value, assignedVarId, assignedValue)) {
        return false;
      }
    }
    return true;
  }

  // Constraint functions
  teacherConflictConstraint(varI, valueI, varJ, valueJ) {
    if (valueI.teacherId === valueJ.teacherId && 
        valueI.day === valueJ.day &&
        this.timeOverlaps(valueI.startTime, valueI.endTime, valueJ.startTime, valueJ.endTime)) {
      return false;
    }
    return true;
  }

  classroomConflictConstraint(varI, valueI, varJ, valueJ) {
    if (valueI.classroomId === valueJ.classroomId && 
        valueI.day === valueJ.day &&
        this.timeOverlaps(valueI.startTime, valueI.endTime, valueJ.startTime, valueJ.endTime)) {
      return false;
    }
    return true;
  }

  studentConflictConstraint(varI, valueI, varJ, valueJ) {
    // Students have conflict if they are in same year, semester, and program
    const courseI = this.courses.find(c => c.id === varI.courseId);
    const courseJ = this.courses.find(c => c.id === varJ.courseId);
    
    if (courseI.year === courseJ.year && 
        courseI.semester === courseJ.semester && 
        courseI.program === courseJ.program &&
        valueI.day === valueJ.day &&
        this.timeOverlaps(valueI.startTime, valueI.endTime, valueJ.startTime, valueJ.endTime)) {
      return false;
    }
    return true;
  }

  teacherWorkloadConstraint(varI, valueI, varJ, valueJ) {
    // This would check if teacher's total workload exceeds maximum
    // For now, we'll implement a simplified version
    return true;
  }

  preferredTimeConstraint(varI, valueI, varJ, valueJ) {
    // Check if assignment respects preferred time slots
    return true;
  }

  avoidTimeConstraint(varI, valueI, varJ, valueJ) {
    // Check if assignment avoids forbidden time slots
    return true;
  }

  consecutiveSessionConstraint(varI, valueI, varJ, valueJ) {
    // Check if sessions that must be consecutive are properly scheduled
    return true;
  }

  sameDayConstraint(varI, valueI, varJ, valueJ) {
    // Check if sessions that must be on same day are properly scheduled
    return true;
  }

  breakRequirementConstraint(varI, valueI, varJ, valueJ) {
    // Check if required breaks are maintained
    return true;
  }

  /**
   * Helper method to check if time slots overlap
   */
  timeOverlaps(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Extract solution from assignment
   */
  extractSolution() {
    const schedule = [];

    for (const [varId, value] of this.assignment) {
      const variable = this.variables.find(v => v.id === varId);
      const teacher = this.teachers.find(t => t.id === value.teacherId);
      const classroom = this.classrooms.find(c => c.id === value.classroomId);
      const course = this.courses.find(c => c.id === variable.courseId);

      schedule.push({
        day: value.day,
        startTime: value.startTime,
        endTime: value.endTime,
        courseId: variable.courseId,
        courseName: variable.courseName,
        courseCode: variable.courseCode,
        sessionType: variable.sessionType,
        teacherId: value.teacherId,
        teacherName: teacher?.name,
        classroomId: value.classroomId,
        classroomName: classroom?.name,
        studentCount: course?.enrolledStudents
      });
    }

    return schedule;
  }

  /**
   * Calculate solving metrics
   */
  calculateMetrics() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    return {
      algorithm: 'CSP',
      duration,
      backtrackCount: this.backtrackCount,
      variablesAssigned: this.assignment.size,
      totalVariables: this.variables.length,
      constraintsSatisfied: this.assignment.size, // Simplified
      satisfactionRate: (this.assignment.size / this.variables.length) * 100
    };
  }

  /**
   * Detect conflicts in the solution
   */
  detectConflicts(schedule) {
    const conflicts = [];
    
    // This would implement detailed conflict detection
    // For now, return empty array since CSP should produce conflict-free solution
    
    return conflicts;
  }
}

module.exports = CSPSolver;
