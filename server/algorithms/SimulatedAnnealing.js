/**
 * Simulated Annealing Algorithm for Timetable Generation
 * 
 * Probabilistic optimization inspired by metallurgical annealing:
 * - Initial random solution
 * - Gradual cooling schedule
 * - Probabilistic acceptance of worse solutions
 * - Neighborhood exploration through perturbations
 * - Constraint-aware solution generation
 */

const logger = require('../utils/logger');
const ConstraintChecker = require('./ConstraintChecker');

class SimulatedAnnealing {
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
      initialTemperature: 1000,
      coolingRate: 0.995,
      minTemperature: 0.1,
      maxIterations: 10000,
      iterationsPerTemp: 10,
      ...settings
    };

    this.constraintChecker = new ConstraintChecker(teachers, classrooms, courses, settings);
    this.timeSlots = this.generateTimeSlots();
    this.sessions = this.extractSessions();
    this.currentSolution = null;
    this.currentEnergy = Infinity;
    this.bestSolution = null;
    this.bestEnergy = Infinity;
    this.temperature = this.settings.initialTemperature;
    this.iteration = 0;
    this.acceptanceCount = 0;
    this.rejectionCount = 0;
    this.startTime = null;
  }

  /**
   * Main solve method
   */
  async solve(progressCallback = null) {
    this.startTime = Date.now();
    this.iteration = 0;
    this.acceptanceCount = 0;
    this.rejectionCount = 0;
    this.temperature = this.settings.initialTemperature;

    logger.info('[SIMULATED ANNEALING] Starting simulated annealing', {
      sessions: this.sessions.length,
      initialTemp: this.temperature,
      coolingRate: this.settings.coolingRate,
      maxIterations: this.settings.maxIterations
    });

    // Generate initial solution
    logger.info('[SIMULATED ANNEALING] Generating initial solution');
    this.currentSolution = this.generateInitialSolution();
    this.currentEnergy = this.calculateEnergy(this.currentSolution);
    this.bestSolution = [...this.currentSolution];
    this.bestEnergy = this.currentEnergy;

    logger.info('[SIMULATED ANNEALING] Initial solution generated', {
      energy: this.currentEnergy.toFixed(4),
      violations: this.currentSolution.filter(s => s.hasViolation).length
    });

    // Main annealing loop
    while (this.iteration < this.settings.maxIterations && this.temperature > this.settings.minTemperature) {
      for (let i = 0; i < this.settings.iterationsPerTemp; i++) {
        this.iteration++;

        // Generate neighbor solution
        const neighbor = this.generateNeighbor(this.currentSolution);
        const neighborEnergy = this.calculateEnergy(neighbor);

        // Decide whether to accept the neighbor
        if (this.acceptSolution(this.currentEnergy, neighborEnergy, this.temperature)) {
          this.currentSolution = neighbor;
          this.currentEnergy = neighborEnergy;
          this.acceptanceCount++;

          // Update best solution if better
          if (neighborEnergy < this.bestEnergy) {
            this.bestSolution = [...neighbor];
            this.bestEnergy = neighborEnergy;
            logger.debug(`[SIMULATED ANNEALING] New best solution: ${this.bestEnergy.toFixed(4)}`);
          }
        } else {
          this.rejectionCount++;
        }

        // Progress update
        if (progressCallback && this.iteration % 100 === 0) {
          const progress = (this.iteration / this.settings.maxIterations) * 100;
          await progressCallback(
            progress, 
            `SA: Iter ${this.iteration}, Temp ${this.temperature.toFixed(2)}, Best ${this.bestEnergy.toFixed(4)}`
          );
        }
      }

      // Cool down
      this.temperature *= this.settings.coolingRate;

      // Log temperature decrease
      if (this.iteration % 500 === 0) {
        logger.info(`[SIMULATED ANNEALING] Temperature: ${this.temperature.toFixed(2)}, Best Energy: ${this.bestEnergy.toFixed(4)}, Acceptance Rate: ${(this.acceptanceCount / (this.acceptanceCount + this.rejectionCount) * 100).toFixed(1)}%`);
      }
    }

    const duration = Date.now() - this.startTime;

    logger.info('[SIMULATED ANNEALING] Annealing complete', {
      duration: `${duration}ms`,
      iterations: this.iteration,
      finalTemp: this.temperature.toFixed(2),
      bestEnergy: this.bestEnergy.toFixed(4),
      acceptanceRate: `${(this.acceptanceCount / this.iteration * 100).toFixed(1)}%`
    });

    // Check if solution is valid
    const violations = this.bestSolution.filter(s => s.hasViolation).length;

    if (violations === 0 || this.bestEnergy < 100) {
      return {
        success: true,
        solution: this.bestSolution,
        metrics: {
          algorithm: 'Simulated Annealing',
          duration,
          iterations: this.iteration,
          finalTemperature: this.temperature,
          bestEnergy: this.bestEnergy,
          acceptanceRate: (this.acceptanceCount / this.iteration * 100).toFixed(1) + '%'
        }
      };
    } else {
      return {
        success: false,
        reason: `Solution has ${violations} constraint violations`,
        solution: this.bestSolution,
        metrics: {
          algorithm: 'Simulated Annealing',
          duration,
          iterations: this.iteration,
          bestEnergy: this.bestEnergy
        }
      };
    }
  }

  /**
   * Generate initial random solution
   */
  generateInitialSolution() {
    const solution = [];
    
    for (const session of this.sessions) {
      const assignment = this.generateRandomAssignment(session, solution);
      if (assignment) {
        solution.push(assignment);
      }
    }
    
    return solution;
  }

  /**
   * Generate a random assignment for a session
   */
  generateRandomAssignment(session, existingSolution) {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Random time slot
      const slot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
      
      // Random teacher from eligible teachers
      const teacherIds = session.teacherIds || [];
      if (teacherIds.length === 0) continue;
      const teacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
      const teacher = this.teachers.find(t => (t.id || String(t._id)) === teacherId);
      
      // Random classroom
      const eligibleClassrooms = this.classrooms.filter(c => {
        if (session.requiresLab) return c.type?.includes('Lab');
        return c.capacity >= session.studentCount;
      });
      
      if (eligibleClassrooms.length === 0) continue;
      const classroom = eligibleClassrooms[Math.floor(Math.random() * eligibleClassrooms.length)];
      const classroomId = classroom.id || String(classroom._id);
      
      const assignment = {
        ...session,
        ...slot,
        teacherId,
        teacherName: teacher?.name || '',
        classroomId,
        classroomName: classroom.name,
        id: `${session.courseId}_${slot.day}_${slot.startTime}_${classroomId}`
      };
      
      // Check constraints
      const check = this.constraintChecker.checkHardConstraints(assignment, existingSolution);
      
      if (check.valid) {
        assignment.hasViolation = false;
        return assignment;
      } else if (attempts === maxAttempts - 1) {
        // Last attempt, accept with violation
        assignment.hasViolation = true;
        assignment.violations = check.violations;
        return assignment;
      }
    }
    
    return null;
  }

  /**
   * Generate neighbor solution by perturbing current solution
   */
  generateNeighbor(solution) {
    const neighbor = [...solution];
    
    // Choose perturbation type randomly
    const perturbationType = Math.random();
    
    if (perturbationType < 0.5) {
      // Swap two sessions
      this.swapSessions(neighbor);
    } else if (perturbationType < 0.8) {
      // Change time slot for one session
      this.changeTimeSlot(neighbor);
    } else {
      // Change classroom for one session
      this.changeClassroom(neighbor);
    }
    
    return neighbor;
  }

  /**
   * Swap two sessions
   */
  swapSessions(solution) {
    if (solution.length < 2) return;
    
    const i = Math.floor(Math.random() * solution.length);
    const j = Math.floor(Math.random() * solution.length);
    
    if (i !== j) {
      // Swap time and classroom
      const tempDay = solution[i].day;
      const tempStartTime = solution[i].startTime;
      const tempEndTime = solution[i].endTime;
      const tempClassroom = solution[i].classroomId;
      const tempClassroomName = solution[i].classroomName;
      
      solution[i].day = solution[j].day;
      solution[i].startTime = solution[j].startTime;
      solution[i].endTime = solution[j].endTime;
      solution[i].classroomId = solution[j].classroomId;
      solution[i].classroomName = solution[j].classroomName;
      
      solution[j].day = tempDay;
      solution[j].startTime = tempStartTime;
      solution[j].endTime = tempEndTime;
      solution[j].classroomId = tempClassroom;
      solution[j].classroomName = tempClassroomName;
    }
  }

  /**
   * Change time slot for a random session
   */
  changeTimeSlot(solution) {
    if (solution.length === 0) return;
    
    const i = Math.floor(Math.random() * solution.length);
    const slot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
    
    solution[i].day = slot.day;
    solution[i].startTime = slot.startTime;
    solution[i].endTime = slot.endTime;
  }

  /**
   * Change classroom for a random session
   */
  changeClassroom(solution) {
    if (solution.length === 0) return;
    
    const i = Math.floor(Math.random() * solution.length);
    const session = solution[i];
    
    const eligibleClassrooms = this.classrooms.filter(c => {
      if (session.requiresLab) return c.type?.includes('Lab');
      return c.capacity >= session.studentCount;
    });
    
    if (eligibleClassrooms.length > 0) {
      const classroom = eligibleClassrooms[Math.floor(Math.random() * eligibleClassrooms.length)];
      solution[i].classroomId = classroom.id || String(classroom._id);
      solution[i].classroomName = classroom.name;
    }
  }

  /**
   * Calculate energy (cost) of a solution
   * Lower energy is better
   */
  calculateEnergy(solution) {
    let energy = 0;
    
    // Count hard constraint violations (high penalty)
    for (let i = 0; i < solution.length; i++) {
      const assignment = solution[i];
      const otherAssignments = solution.slice(0, i).concat(solution.slice(i + 1));
      
      const check = this.constraintChecker.checkHardConstraints(assignment, otherAssignments);
      
      if (!check.valid) {
        energy += check.violations.length * 100; // High penalty for violations
      }
      
      // Soft constraint penalties
      const softCheck = this.constraintChecker.evaluateSoftConstraints(assignment, otherAssignments);
      energy += (1 - softCheck.score) * 10; // Moderate penalty for soft constraint violations
    }
    
    return energy;
  }

  /**
   * Decide whether to accept a solution based on Metropolis criterion
   */
  acceptSolution(currentEnergy, neighborEnergy, temperature) {
    // Always accept better solutions
    if (neighborEnergy < currentEnergy) {
      return true;
    }
    
    // Accept worse solutions with probability exp(-ΔE / T)
    const delta = neighborEnergy - currentEnergy;
    const probability = Math.exp(-delta / temperature);
    
    return Math.random() < probability;
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

      // Practical sessions
      if (course.sessions?.practical) {
        const practical = course.sessions.practical;
        const batches = course.divisions?.[0]?.batches || [{ batchId: 'default', studentCount: course.enrolledStudents }];
        
        for (let i = 0; i < practical.sessionsPerWeek; i++) {
          for (const batch of batches) {
            sessions.push({
              ...courseInfo,
              sessionType: 'Practical',
              sessionIndex: i,
              batchId: batch.batchId,
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

    return sessions;
  }
}

module.exports = SimulatedAnnealing;
