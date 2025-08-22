const CSPSolver = require('./CSPSolver');
const GeneticAlgorithm = require('./GeneticAlgorithm');
const logger = require('../utils/logger');

/**
 * Advanced Optimization Engine for Timetable Generation
 * 
 * This engine orchestrates multiple algorithms and optimization strategies:
 * - Hybrid approaches combining CSP and GA
 * - Multi-objective optimization
 * - Adaptive parameter tuning
 * - Real-time progress tracking
 * - Conflict resolution strategies
 */

class OptimizationEngine {
  constructor() {
    this.algorithms = new Map([
      ['csp', CSPSolver],
      ['genetic', GeneticAlgorithm],
      ['hybrid', this.hybridAlgorithm.bind(this)],
      ['backtracking', this.backtrackingAlgorithm.bind(this)],
      ['simulated_annealing', this.simulatedAnnealingAlgorithm.bind(this)]
    ]);

    this.optimizationGoals = new Map([
      ['minimize_conflicts', this.minimizeConflicts.bind(this)],
      ['balanced_schedule', this.balanceSchedule.bind(this)],
      ['teacher_preferences', this.optimizeTeacherPreferences.bind(this)],
      ['resource_optimization', this.optimizeResourceUtilization.bind(this)],
      ['student_convenience', this.optimizeStudentConvenience.bind(this)]
    ]);

    this.constraintTypes = new Map([
      ['hard', this.evaluateHardConstraints.bind(this)],
      ['soft', this.evaluateSoftConstraints.bind(this)],
      ['preference', this.evaluatePreferences.bind(this)]
    ]);
  }

  /**
   * Main optimization method
   */
  async optimize(teachers, classrooms, courses, settings, progressCallback = null) {
    const startTime = Date.now();
    
    try {
      logger.info('Starting timetable optimization', { 
        algorithm: settings.algorithm,
        courses: courses.length,
        teachers: teachers.length,
        classrooms: classrooms.length
      });

      // Validate input data
      const validation = this.validateInputData(teachers, classrooms, courses);
      if (!validation.valid) {
        return { success: false, reason: validation.reason };
      }

      // Select and configure algorithm
      const algorithm = this.selectAlgorithm(settings.algorithm);
      const optimizedSettings = this.optimizeParameters(settings, teachers, classrooms, courses);

      // Execute algorithm
      const result = await algorithm(teachers, classrooms, courses, optimizedSettings, progressCallback);

      if (result.success) {
        // Post-process the solution
        const optimizedSolution = await this.postProcessSolution(
          result.solution, 
          teachers, 
          classrooms, 
          courses, 
          settings
        );

        // Calculate quality metrics
        const qualityMetrics = this.calculateQualityMetrics(
          optimizedSolution, 
          teachers, 
          classrooms, 
          courses
        );

        const endTime = Date.now();
        logger.info('Optimization completed successfully', {
          duration: endTime - startTime,
          algorithm: settings.algorithm,
          quality: qualityMetrics.overallScore
        });

        return {
          success: true,
          solution: optimizedSolution,
          metrics: {
            ...result.metrics,
            totalDuration: endTime - startTime,
            qualityMetrics
          },
          conflicts: this.detectAndClassifyConflicts(optimizedSolution, teachers, classrooms, courses),
          recommendations: this.generateRecommendations(optimizedSolution, qualityMetrics)
        };
      } else {
        logger.warn('Optimization failed', { reason: result.reason });
        return result;
      }

    } catch (error) {
      logger.error('Optimization engine error:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Validate input data for consistency and completeness
   */
  validateInputData(teachers, classrooms, courses) {
    const issues = [];

    // Check teachers
    if (!teachers || teachers.length === 0) {
      issues.push('No teachers provided');
    } else {
      for (const teacher of teachers) {
        if (!teacher.subjects || teacher.subjects.length === 0) {
          issues.push(`Teacher ${teacher.name} has no subjects assigned`);
        }
        if (!teacher.availability) {
          issues.push(`Teacher ${teacher.name} has no availability defined`);
        }
      }
    }

    // Check classrooms
    if (!classrooms || classrooms.length === 0) {
      issues.push('No classrooms provided');
    } else {
      for (const classroom of classrooms) {
        if (!classroom.capacity || classroom.capacity < 1) {
          issues.push(`Classroom ${classroom.name} has invalid capacity`);
        }
      }
    }

    // Check courses
    if (!courses || courses.length === 0) {
      issues.push('No courses provided');
    } else {
      for (const course of courses) {
        if (!course.assignedTeachers || course.assignedTeachers.length === 0) {
          issues.push(`Course ${course.name} has no teachers assigned`);
        }
        
        const hasValidSessions = ['theory', 'practical', 'tutorial'].some(type => 
          course.sessions[type] && course.sessions[type].sessionsPerWeek > 0
        );
        if (!hasValidSessions) {
          issues.push(`Course ${course.name} has no valid sessions defined`);
        }
      }
    }

    // Check teacher-course compatibility
    for (const course of courses) {
      for (const assignedTeacher of course.assignedTeachers) {
        const teacher = teachers.find(t => t.id === assignedTeacher.teacherId);
        if (!teacher) {
          issues.push(`Course ${course.name} assigned to non-existent teacher ${assignedTeacher.teacherId}`);
        } else if (!teacher.subjects.some(subject => 
          course.name.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(course.name.toLowerCase())
        )) {
          issues.push(`Teacher ${teacher.name} may not be qualified to teach ${course.name}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      reason: issues.length > 0 ? issues.join('; ') : null,
      issues
    };
  }

  /**
   * Select appropriate algorithm based on problem characteristics
   */
  selectAlgorithm(algorithmName) {
    if (this.algorithms.has(algorithmName)) {
      return this.algorithms.get(algorithmName);
    }
    
    // Default to hybrid approach
    logger.warn(`Unknown algorithm ${algorithmName}, using hybrid approach`);
    return this.algorithms.get('hybrid');
  }

  /**
   * Optimize algorithm parameters based on problem size and characteristics
   */
  optimizeParameters(settings, teachers, classrooms, courses) {
    const problemSize = teachers.length * classrooms.length * courses.length;
    const optimizedSettings = { ...settings };

    // Adjust parameters based on problem size
    if (settings.algorithm === 'genetic') {
      if (problemSize > 10000) {
        optimizedSettings.populationSize = Math.min(200, settings.populationSize * 1.5);
        optimizedSettings.maxGenerations = Math.min(2000, settings.maxGenerations * 1.2);
      } else if (problemSize < 1000) {
        optimizedSettings.populationSize = Math.max(50, settings.populationSize * 0.8);
        optimizedSettings.maxGenerations = Math.max(500, settings.maxGenerations * 0.8);
      }

      // Adjust mutation rate based on diversity needs
      const courseVariety = new Set(courses.map(c => c.department)).size;
      if (courseVariety > 5) {
        optimizedSettings.mutationRate = Math.min(0.2, settings.mutationRate * 1.2);
      }
    }

    // Adjust time slots based on total required hours
    const totalHours = courses.reduce((sum, course) => sum + course.totalHoursPerWeek, 0);
    const availableSlots = this.calculateAvailableTimeSlots(settings);
    
    if (totalHours / availableSlots > 0.8) {
      logger.warn('High utilization detected, may require extended hours');
      optimizedSettings.extendedHours = true;
    }

    return optimizedSettings;
  }

  /**
   * Calculate available time slots
   */
  calculateAvailableTimeSlots(settings) {
    const workingDays = settings.workingDays?.length || 5;
    const startHour = parseInt(settings.startTime?.split(':')[0] || '9');
    const endHour = parseInt(settings.endTime?.split(':')[0] || '17');
    const slotDuration = settings.slotDuration || 60;
    
    const hoursPerDay = endHour - startHour;
    const slotsPerDay = hoursPerDay * (60 / slotDuration);
    
    return workingDays * slotsPerDay;
  }

  /**
   * Hybrid algorithm combining CSP and GA
   */
  async hybridAlgorithm(teachers, classrooms, courses, settings, progressCallback) {
    logger.info('Running hybrid CSP-GA algorithm');

    // Phase 1: Use CSP to find initial feasible solution
    const cspSolver = new CSPSolver(teachers, classrooms, courses, {
      ...settings,
      maxBacktrackingSteps: 5000 // Reduced for initial phase
    });

    const initialProgress = (progress) => {
      if (progressCallback) progressCallback(progress * 0.3, 'CSP Phase');
    };

    const cspResult = await cspSolver.solve(initialProgress);

    if (!cspResult.success) {
      logger.warn('CSP phase failed, falling back to pure GA');
      return this.pureGeneticAlgorithm(teachers, classrooms, courses, settings, progressCallback);
    }

    // Phase 2: Use GA to optimize the CSP solution
    logger.info('CSP found initial solution, starting GA optimization');
    
    const ga = new GeneticAlgorithm(teachers, classrooms, courses, {
      ...settings,
      populationSize: settings.populationSize || 100,
      maxGenerations: Math.floor((settings.maxGenerations || 1000) * 0.7),
      initialSolution: cspResult.solution
    });

    const gaProgress = (progress, generation, fitness) => {
      if (progressCallback) {
        progressCallback(30 + (progress * 0.7), `GA Phase - Gen ${generation}, Fitness: ${fitness?.toFixed(2)}`);
      }
    };

    const gaResult = await ga.solve(gaProgress);

    if (gaResult.success) {
      return {
        success: true,
        solution: gaResult.solution,
        metrics: {
          ...gaResult.metrics,
          hybridPhases: {
            csp: cspResult.metrics,
            ga: gaResult.metrics
          }
        }
      };
    } else {
      // Return CSP solution if GA fails
      return cspResult;
    }
  }

  /**
   * Pure genetic algorithm (fallback)
   */
  async pureGeneticAlgorithm(teachers, classrooms, courses, settings, progressCallback) {
    const ga = new GeneticAlgorithm(teachers, classrooms, courses, settings);
    return ga.solve(progressCallback);
  }

  /**
   * Backtracking algorithm
   */
  async backtrackingAlgorithm(teachers, classrooms, courses, settings, progressCallback) {
    // This would implement a pure backtracking approach
    // For now, delegate to CSP solver which includes backtracking
    const csp = new CSPSolver(teachers, classrooms, courses, settings);
    return csp.solve(progressCallback);
  }

  /**
   * Simulated annealing algorithm
   */
  async simulatedAnnealingAlgorithm(teachers, classrooms, courses, settings, progressCallback) {
    logger.info('Running simulated annealing algorithm');
    
    // Initialize with random solution
    const ga = new GeneticAlgorithm(teachers, classrooms, courses, settings);
    let currentSolution = ga.createRandomChromosome();
    let currentFitness = ga.calculateFitness(currentSolution);
    
    let bestSolution = [...currentSolution];
    let bestFitness = currentFitness;
    
    const maxIterations = settings.maxIterations || 10000;
    const initialTemp = settings.initialTemperature || 1000;
    const coolingRate = settings.coolingRate || 0.995;
    
    let temperature = initialTemp;
    let iteration = 0;
    
    while (iteration < maxIterations && temperature > 0.1) {
      // Generate neighbor solution
      const neighbor = [...currentSolution];
      this.perturbSolution(neighbor);
      
      const neighborFitness = ga.calculateFitness(neighbor);
      
      // Accept or reject the neighbor
      if (this.shouldAccept(currentFitness, neighborFitness, temperature)) {
        currentSolution = neighbor;
        currentFitness = neighborFitness;
        
        if (neighborFitness > bestFitness) {
          bestSolution = [...neighbor];
          bestFitness = neighborFitness;
        }
      }
      
      // Cool down
      temperature *= coolingRate;
      iteration++;
      
      // Report progress
      if (progressCallback && iteration % 100 === 0) {
        const progress = (iteration / maxIterations) * 100;
        await progressCallback(progress, `SA - Iter ${iteration}, Temp: ${temperature.toFixed(2)}`);
      }
    }
    
    const schedule = ga.chromosomeToSchedule({ chromosome: bestSolution });
    
    return {
      success: true,
      solution: schedule,
      metrics: {
        algorithm: 'Simulated Annealing',
        iterations: iteration,
        finalTemperature: temperature,
        bestFitness: bestFitness
      }
    };
  }

  /**
   * Perturb solution for simulated annealing
   */
  perturbSolution(solution) {
    const perturbationType = Math.random();
    
    if (perturbationType < 0.5) {
      // Swap two random elements
      const i = Math.floor(Math.random() * solution.length);
      const j = Math.floor(Math.random() * solution.length);
      [solution[i], solution[j]] = [solution[j], solution[i]];
    } else {
      // Modify a random element
      const i = Math.floor(Math.random() * solution.length);
      const randomTimeSlot = Math.floor(Math.random() * 50); // Assuming 50 time slots
      solution[i] = { ...solution[i], timeSlotId: randomTimeSlot };
    }
  }

  /**
   * Simulated annealing acceptance criteria
   */
  shouldAccept(currentFitness, neighborFitness, temperature) {
    if (neighborFitness > currentFitness) {
      return true; // Always accept better solutions
    }
    
    const probability = Math.exp((neighborFitness - currentFitness) / temperature);
    return Math.random() < probability;
  }

  /**
   * Post-process solution to fix minor issues and optimize further
   */
  async postProcessSolution(solution, teachers, classrooms, courses, settings) {
    logger.info('Post-processing solution');

    let optimizedSolution = [...solution];

    // Fix conflicts using local search
    optimizedSolution = this.resolveConflicts(optimizedSolution, teachers, classrooms, courses);

    // Apply optimization goals
    if (settings.optimizationGoals) {
      for (const goal of settings.optimizationGoals) {
        if (this.optimizationGoals.has(goal)) {
          const optimizer = this.optimizationGoals.get(goal);
          optimizedSolution = optimizer(optimizedSolution, teachers, classrooms, courses);
        }
      }
    }

    // Final validation and cleanup
    optimizedSolution = this.validateAndCleanSolution(optimizedSolution, teachers, classrooms, courses);

    return optimizedSolution;
  }

  /**
   * Resolve conflicts in the solution
   */
  resolveConflicts(solution, teachers, classrooms, courses) {
    const conflicts = this.detectAndClassifyConflicts(solution, teachers, classrooms, courses);
    let resolvedSolution = [...solution];

    for (const conflict of conflicts) {
      if (conflict.type === 'teacher_conflict') {
        resolvedSolution = this.resolveTeacherConflict(resolvedSolution, conflict, teachers, classrooms);
      } else if (conflict.type === 'room_conflict') {
        resolvedSolution = this.resolveRoomConflict(resolvedSolution, conflict, classrooms);
      } else if (conflict.type === 'student_conflict') {
        resolvedSolution = this.resolveStudentConflict(resolvedSolution, conflict, courses);
      }
    }

    return resolvedSolution;
  }

  /**
   * Detect and classify conflicts in the solution
   */
  detectAndClassifyConflicts(solution, teachers, classrooms, courses) {
    const conflicts = [];
    
    // Teacher conflicts
    const teacherSlots = new Map();
    solution.forEach((slot, index) => {
      const key = `${slot.teacherId}_${slot.day}_${slot.startTime}`;
      if (teacherSlots.has(key)) {
        conflicts.push({
          type: 'teacher_conflict',
          severity: 'high',
          description: `Teacher ${slot.teacherName} has overlapping classes`,
          slots: [teacherSlots.get(key), index],
          teacherId: slot.teacherId
        });
      }
      teacherSlots.set(key, index);
    });

    // Room conflicts
    const roomSlots = new Map();
    solution.forEach((slot, index) => {
      const key = `${slot.classroomId}_${slot.day}_${slot.startTime}`;
      if (roomSlots.has(key)) {
        conflicts.push({
          type: 'room_conflict',
          severity: 'high',
          description: `Room ${slot.classroomName} is double-booked`,
          slots: [roomSlots.get(key), index],
          classroomId: slot.classroomId
        });
      }
      roomSlots.set(key, index);
    });

    // Student conflicts
    const studentSlots = new Map();
    solution.forEach((slot, index) => {
      const course = courses.find(c => c.id === slot.courseId);
      if (course) {
        const key = `${course.program}_${course.year}_${course.semester}_${slot.day}_${slot.startTime}`;
        if (studentSlots.has(key)) {
          conflicts.push({
            type: 'student_conflict',
            severity: 'medium',
            description: `Students have overlapping classes`,
            slots: [studentSlots.get(key), index],
            program: course.program,
            year: course.year,
            semester: course.semester
          });
        }
        studentSlots.set(key, index);
      }
    });

    return conflicts;
  }

  /**
   * Resolve teacher conflicts
   */
  resolveTeacherConflict(solution, conflict, teachers, classrooms) {
    // Try to move one of the conflicting sessions to a different time slot
    const [slot1Index, slot2Index] = conflict.slots;
    const slot1 = solution[slot1Index];
    const slot2 = solution[slot2Index];

    // Try to reschedule the lower priority session
    const course1 = this.findCourseBySlot(slot1);
    const course2 = this.findCourseBySlot(slot2);
    
    const targetIndex = course1.priority < course2.priority ? slot1Index : slot2Index;
    
    // Find alternative time slot for the target session
    const alternativeSlot = this.findAlternativeTimeSlot(solution[targetIndex], solution, teachers, classrooms);
    
    if (alternativeSlot) {
      solution[targetIndex] = { ...solution[targetIndex], ...alternativeSlot };
    }

    return solution;
  }

  /**
   * Resolve room conflicts
   */
  resolveRoomConflict(solution, conflict, classrooms) {
    const [slot1Index, slot2Index] = conflict.slots;
    
    // Try to find alternative room for one of the sessions
    const alternativeRoom = this.findAlternativeRoom(solution[slot1Index], classrooms, solution);
    
    if (alternativeRoom) {
      solution[slot1Index] = { 
        ...solution[slot1Index], 
        classroomId: alternativeRoom.id,
        classroomName: alternativeRoom.name
      };
    }

    return solution;
  }

  /**
   * Resolve student conflicts
   */
  resolveStudentConflict(solution, conflict, courses) {
    // Similar to teacher conflict resolution
    return this.resolveTeacherConflict(solution, conflict, [], []);
  }

  /**
   * Calculate comprehensive quality metrics
   */
  calculateQualityMetrics(solution, teachers, classrooms, courses) {
    const metrics = {
      overallScore: 0,
      constraintCompliance: 0,
      teacherSatisfaction: 0,
      roomUtilization: 0,
      studentConvenience: 0,
      scheduleBalance: 0
    };

    // Constraint compliance
    const conflicts = this.detectAndClassifyConflicts(solution, teachers, classrooms, courses);
    metrics.constraintCompliance = Math.max(0, 100 - (conflicts.length / solution.length) * 100);

    // Room utilization
    const roomUsage = new Map();
    solution.forEach(slot => {
      roomUsage.set(slot.classroomId, (roomUsage.get(slot.classroomId) || 0) + 1);
    });
    const avgUtilization = Array.from(roomUsage.values()).reduce((a, b) => a + b, 0) / classrooms.length;
    metrics.roomUtilization = Math.min(100, (avgUtilization / 8) * 100); // Assuming 8 hours max per day

    // Schedule balance
    const dailyLoad = new Map();
    solution.forEach(slot => {
      dailyLoad.set(slot.day, (dailyLoad.get(slot.day) || 0) + 1);
    });
    const loadVariance = this.calculateVariance(Array.from(dailyLoad.values()));
    metrics.scheduleBalance = Math.max(0, 100 - loadVariance * 10);

    // Teacher satisfaction (simplified)
    metrics.teacherSatisfaction = 85; // Placeholder

    // Student convenience (simplified)
    metrics.studentConvenience = 80; // Placeholder

    // Overall score
    metrics.overallScore = (
      metrics.constraintCompliance * 0.4 +
      metrics.roomUtilization * 0.2 +
      metrics.scheduleBalance * 0.2 +
      metrics.teacherSatisfaction * 0.1 +
      metrics.studentConvenience * 0.1
    );

    return metrics;
  }

  /**
   * Generate recommendations for improving the timetable
   */
  generateRecommendations(solution, qualityMetrics) {
    const recommendations = [];

    if (qualityMetrics.constraintCompliance < 90) {
      recommendations.push({
        type: 'constraint_violation',
        priority: 'high',
        message: 'Some hard constraints are violated. Consider reviewing teacher availability and room assignments.',
        action: 'Review conflicting assignments and adjust manually if needed.'
      });
    }

    if (qualityMetrics.roomUtilization > 90) {
      recommendations.push({
        type: 'high_utilization',
        priority: 'medium',
        message: 'Room utilization is very high. Consider adding more rooms or extending hours.',
        action: 'Evaluate the possibility of using additional rooms or time slots.'
      });
    }

    if (qualityMetrics.scheduleBalance < 70) {
      recommendations.push({
        type: 'unbalanced_schedule',
        priority: 'medium',
        message: 'The schedule is not well balanced across days.',
        action: 'Try to distribute classes more evenly across the week.'
      });
    }

    return recommendations;
  }

  // Optimization goal implementations
  minimizeConflicts(solution, teachers, classrooms, courses) {
    // This would implement conflict minimization
    return solution;
  }

  balanceSchedule(solution, teachers, classrooms, courses) {
    // This would implement schedule balancing
    return solution;
  }

  optimizeTeacherPreferences(solution, teachers, classrooms, courses) {
    // This would implement teacher preference optimization
    return solution;
  }

  optimizeResourceUtilization(solution, teachers, classrooms, courses) {
    // This would implement resource utilization optimization
    return solution;
  }

  optimizeStudentConvenience(solution, teachers, classrooms, courses) {
    // This would implement student convenience optimization
    return solution;
  }

  // Helper methods
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  findCourseBySlot(slot) {
    // This would find the course for a given slot
    return { priority: 2 }; // Placeholder
  }

  findAlternativeTimeSlot(slot, solution, teachers, classrooms) {
    // This would find an alternative time slot
    return null; // Placeholder
  }

  findAlternativeRoom(slot, classrooms, solution) {
    // This would find an alternative room
    return null; // Placeholder
  }

  validateAndCleanSolution(solution, teachers, classrooms, courses) {
    // This would validate and clean the solution
    return solution;
  }

  // Constraint evaluation methods
  evaluateHardConstraints(solution, teachers, classrooms, courses) {
    // Implementation for hard constraint evaluation
    return 0;
  }

  evaluateSoftConstraints(solution, teachers, classrooms, courses) {
    // Implementation for soft constraint evaluation
    return 0;
  }

  evaluatePreferences(solution, teachers, classrooms, courses) {
    // Implementation for preference evaluation
    return 0;
  }
}

module.exports = OptimizationEngine;
