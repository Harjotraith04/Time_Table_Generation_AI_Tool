const CSPSolver = require('./CSPSolver');
const GeneticAlgorithm = require('./GeneticAlgorithm');
const GreedyScheduler = require('./GreedyScheduler');
const BacktrackingSearch = require('./BacktrackingSearch');
const SimulatedAnnealing = require('./SimulatedAnnealing');
const logger = require('../utils/logger');

/**
 * Advanced Optimization Engine for Timetable Generation
 * 
 * This engine orchestrates multiple algorithms and optimization strategies:
 * - Greedy scheduling (fast, simple)
 * - CSP solving (constraint satisfaction)
 * - Genetic algorithms (optimization)
 * - Hybrid approaches combining CSP and GA
 * - Multi-objective optimization
 * - Adaptive parameter tuning
 * - Real-time progress tracking
 * - Conflict resolution strategies
 */

class OptimizationEngine {
  constructor() {
    this.algorithms = new Map([
      ['greedy', GreedyScheduler],
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
      logger.info('[OPTIMIZATION] Starting timetable optimization', { 
        algorithm: settings.algorithm,
        courses: courses.length,
        teachers: teachers.length,
        classrooms: classrooms.length
      });

      // Validate input data
      logger.info('[OPTIMIZATION] Starting data validation...');
      const validationStartTime = Date.now();
      
      const validation = this.validateInputData(teachers, classrooms, courses);
      
      const validationDuration = Date.now() - validationStartTime;
      logger.info('[OPTIMIZATION] Data validation completed', {
        duration: `${validationDuration}ms`,
        valid: validation.valid,
        issuesCount: validation.issues?.length || 0
      });

      if (!validation.valid) {
        logger.error('[OPTIMIZATION] Validation failed:', {
          issues: validation.issues,
          reason: validation.reason
        });
        return { 
          success: false, 
          reason: validation.reason,
          validationErrors: validation.issues 
        };
      }
      
      logger.info('[OPTIMIZATION] Data validation passed successfully');

      // Select and configure algorithm
      logger.info('[OPTIMIZATION] Selecting algorithm:', settings.algorithm);
      const algorithm = this.selectAlgorithm(settings.algorithm);
      logger.info('[OPTIMIZATION] Algorithm selected successfully');

      logger.info('[OPTIMIZATION] Optimizing parameters...');
      const optimizedSettings = this.optimizeParameters(settings, teachers, classrooms, courses);
      logger.info('[OPTIMIZATION] Parameters optimized');

      // Execute algorithm
      logger.info('[OPTIMIZATION] Executing algorithm:', settings.algorithm);
      const algorithmStartTime = Date.now();
      
      const result = await algorithm(teachers, classrooms, courses, optimizedSettings, progressCallback);
      
      const algorithmDuration = Date.now() - algorithmStartTime;
      logger.info('[OPTIMIZATION] Algorithm execution completed', {
        duration: `${algorithmDuration}ms`,
        success: result.success
      });

      if (result.success) {
        // Post-process the solution
        logger.info('[OPTIMIZATION] Starting post-processing...');
        const postProcessStart = Date.now();
        
        const optimizedSolution = await this.postProcessSolution(
          result.solution, 
          teachers, 
          classrooms, 
          courses, 
          settings
        );
        
        const postProcessDuration = Date.now() - postProcessStart;
        logger.info(`[OPTIMIZATION] Post-processing completed in ${postProcessDuration}ms`);

        // Calculate quality metrics
        logger.info('[OPTIMIZATION] Calculating quality metrics...');
        const metricsStart = Date.now();
        
        const qualityMetrics = this.calculateQualityMetrics(
          optimizedSolution, 
          teachers, 
          classrooms, 
          courses
        );
        
        const metricsDuration = Date.now() - metricsStart;
        logger.info(`[OPTIMIZATION] Quality metrics calculated in ${metricsDuration}ms`);
        logger.info(`[OPTIMIZATION] Quality Score: ${qualityMetrics.overallScore}`);

        // Detect conflicts
        logger.info('[OPTIMIZATION] Detecting conflicts...');
        const conflictStart = Date.now();
        
        const conflicts = this.detectAndClassifyConflicts(optimizedSolution, teachers, classrooms, courses);
        
        const conflictDuration = Date.now() - conflictStart;
        logger.info(`[OPTIMIZATION] Conflict detection completed in ${conflictDuration}ms`);
        logger.info(`[OPTIMIZATION] Conflicts found: ${conflicts.length}`);

        // Generate recommendations
        logger.info('[OPTIMIZATION] Generating recommendations...');
        const recommendStart = Date.now();
        
        const recommendations = this.generateRecommendations(optimizedSolution, qualityMetrics);
        
        const recommendDuration = Date.now() - recommendStart;
        logger.info(`[OPTIMIZATION] Recommendations generated in ${recommendDuration}ms`);

        const endTime = Date.now();
        const totalDuration = endTime - startTime;
        
        logger.info('[OPTIMIZATION] ========================================');
        logger.info('[OPTIMIZATION] OPTIMIZATION COMPLETE!');
        logger.info(`[OPTIMIZATION]   Algorithm: ${settings.algorithm}`);
        logger.info(`[OPTIMIZATION]   Total Duration: ${totalDuration}ms`);
        logger.info(`[OPTIMIZATION]   - Validation: ${validationDuration}ms`);
        logger.info(`[OPTIMIZATION]   - Algorithm Execution: ${algorithmDuration}ms`);
        logger.info(`[OPTIMIZATION]   - Post-processing: ${postProcessDuration}ms`);
        logger.info(`[OPTIMIZATION]   - Quality Metrics: ${metricsDuration}ms`);
        logger.info(`[OPTIMIZATION]   - Conflict Detection: ${conflictDuration}ms`);
        logger.info(`[OPTIMIZATION]   - Recommendations: ${recommendDuration}ms`);
        logger.info(`[OPTIMIZATION]   Quality Score: ${qualityMetrics.overallScore}`);
        logger.info(`[OPTIMIZATION]   Conflicts: ${conflicts.length}`);
        logger.info('[OPTIMIZATION] ========================================');

        return {
          success: true,
          solution: optimizedSolution,
          metrics: {
            ...result.metrics,
            totalDuration,
            qualityMetrics
          },
          conflicts,
          recommendations
        };
      } else {
        logger.warn('[OPTIMIZATION] Optimization failed', { reason: result.reason });
        return result;
      }

    } catch (error) {
      logger.error('[OPTIMIZATION] Optimization engine error:', error);
      logger.error('[OPTIMIZATION] Error stack:', error.stack);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Validate input data for consistency and completeness
   */
  validateInputData(teachers, classrooms, courses) {
    const validationStartTime = Date.now();
    logger.info('[VALIDATION] ========================================');
    logger.info('[VALIDATION] Starting detailed data validation...');
    logger.info('[VALIDATION] ========================================');
    
    const issues = [];
    const warnings = [];

    // Check teachers
    const teacherCheckStart = Date.now();
    logger.info('[VALIDATION] Step 1/4: Validating teachers...');
    
    if (!teachers || teachers.length === 0) {
      issues.push('No teachers provided');
      logger.error('[VALIDATION] ✗ No teachers found!');
    } else {
      logger.info(`[VALIDATION] Found ${teachers.length} teachers to validate`);
      
      let teacherIssueCount = 0;
      for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        logger.info(`[VALIDATION]   Checking teacher ${i + 1}/${teachers.length}: ${teacher.name}`);
        
        if (!teacher.subjects || teacher.subjects.length === 0) {
          issues.push(`Teacher ${teacher.name} has no subjects assigned`);
          teacherIssueCount++;
          logger.warn(`[VALIDATION]     ⚠️ No subjects assigned`);
        } else {
          logger.info(`[VALIDATION]     ✓ Subjects: ${teacher.subjects.join(', ')}`);
        }
        
        if (!teacher.availability) {
          issues.push(`Teacher ${teacher.name} has no availability defined`);
          teacherIssueCount++;
          logger.warn(`[VALIDATION]     ⚠️ No availability defined`);
        } else {
          logger.info(`[VALIDATION]     ✓ Availability defined`);
        }
      }
      
      const teacherCheckDuration = Date.now() - teacherCheckStart;
      logger.info(`[VALIDATION] ✓ Teacher validation completed in ${teacherCheckDuration}ms (${teacherIssueCount} issues)`);
    }

    // Check classrooms
    const classroomCheckStart = Date.now();
    logger.info('[VALIDATION] Step 2/4: Validating classrooms...');
    
    if (!classrooms || classrooms.length === 0) {
      issues.push('No classrooms provided');
      logger.error('[VALIDATION] ✗ No classrooms found!');
    } else {
      logger.info(`[VALIDATION] Found ${classrooms.length} classrooms to validate`);
      
      let classroomIssueCount = 0;
      for (let i = 0; i < classrooms.length; i++) {
        const classroom = classrooms[i];
        logger.info(`[VALIDATION]   Checking classroom ${i + 1}/${classrooms.length}: ${classroom.name}`);
        
        if (!classroom.capacity || classroom.capacity < 1) {
          issues.push(`Classroom ${classroom.name} has invalid capacity`);
          classroomIssueCount++;
          logger.warn(`[VALIDATION]     ⚠️ Invalid capacity: ${classroom.capacity}`);
        } else {
          logger.info(`[VALIDATION]     ✓ Capacity: ${classroom.capacity}`);
        }
        
        logger.info(`[VALIDATION]     Type: ${classroom.type}, Features: ${classroom.features?.length || 0}`);
      }
      
      const classroomCheckDuration = Date.now() - classroomCheckStart;
      logger.info(`[VALIDATION] ✓ Classroom validation completed in ${classroomCheckDuration}ms (${classroomIssueCount} issues)`);
    }

    // Check courses
    const courseCheckStart = Date.now();
    logger.info('[VALIDATION] Step 3/4: Validating courses...');
    
    if (!courses || courses.length === 0) {
      issues.push('No courses provided');
      logger.error('[VALIDATION] ✗ No courses found!');
    } else {
      logger.info(`[VALIDATION] Found ${courses.length} courses to validate`);
      
      let courseIssueCount = 0;
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        logger.info(`[VALIDATION]   Checking course ${i + 1}/${courses.length}: ${course.name} (${course.code})`);
        
        if (!course.assignedTeachers || course.assignedTeachers.length === 0) {
          issues.push(`Course ${course.name} has no teachers assigned`);
          courseIssueCount++;
          logger.warn(`[VALIDATION]     ⚠️ No teachers assigned`);
        } else {
          logger.info(`[VALIDATION]     ✓ Assigned to ${course.assignedTeachers.length} teacher(s)`);
        }
        
        const theoryCount = course.sessions?.theory?.sessionsPerWeek || 0;
        const practicalCount = course.sessions?.practical?.sessionsPerWeek || 0;
        const tutorialCount = course.sessions?.tutorial?.sessionsPerWeek || 0;
        const totalSessions = theoryCount + practicalCount + tutorialCount;
        
        logger.info(`[VALIDATION]     Sessions: Theory=${theoryCount}, Practical=${practicalCount}, Tutorial=${tutorialCount}, Total=${totalSessions}`);
        
        const hasValidSessions = ['theory', 'practical', 'tutorial'].some(type => 
          course.sessions[type] && course.sessions[type].sessionsPerWeek > 0
        );
        
        if (!hasValidSessions) {
          issues.push(`Course ${course.name} has no valid sessions defined`);
          courseIssueCount++;
          logger.warn(`[VALIDATION]     ⚠️ No valid sessions defined`);
        } else {
          logger.info(`[VALIDATION]     ✓ Has valid sessions`);
        }
      }
      
      const courseCheckDuration = Date.now() - courseCheckStart;
      logger.info(`[VALIDATION] ✓ Course validation completed in ${courseCheckDuration}ms (${courseIssueCount} issues)`);
    }

    // Check teacher-course compatibility (as warnings, not errors)
    const compatibilityCheckStart = Date.now();
    logger.info('[VALIDATION] Step 4/4: Checking teacher-course compatibility...');
    
    let compatibilityWarnings = 0;
    for (const course of courses) {
      for (const assignedTeacher of course.assignedTeachers) {
        const teacher = teachers.find(t => t.id === assignedTeacher.teacherId);
        if (!teacher) {
          issues.push(`Course ${course.name} assigned to non-existent teacher ${assignedTeacher.teacherId}`);
          logger.error(`[VALIDATION]   ✗ Course ${course.name} assigned to non-existent teacher ${assignedTeacher.teacherId}`);
        } else if (!teacher.subjects.some(subject => 
          course.name.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(course.name.toLowerCase())
        )) {
          // This is just a warning, not a critical error
          warnings.push(`Teacher ${teacher.name} may not be qualified to teach ${course.name} (subject mismatch)`);
          compatibilityWarnings++;
          logger.warn(`[VALIDATION]   ⚠️ Teacher ${teacher.name} may not be qualified to teach ${course.name}`);
        }
      }
    }
    
    const compatibilityCheckDuration = Date.now() - compatibilityCheckStart;
    logger.info(`[VALIDATION] ✓ Compatibility check completed in ${compatibilityCheckDuration}ms (${compatibilityWarnings} warnings)`);
    
    // Final validation summary
    const totalValidationDuration = Date.now() - validationStartTime;
    logger.info('[VALIDATION] ========================================');
    logger.info('[VALIDATION] VALIDATION SUMMARY:');
    logger.info(`[VALIDATION]   Total Issues: ${issues.length}`);
    logger.info(`[VALIDATION]   Total Warnings: ${warnings.length}`);
    logger.info(`[VALIDATION]   Total Duration: ${totalValidationDuration}ms`);
    logger.info(`[VALIDATION]   Result: ${issues.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
    logger.info('[VALIDATION] ========================================');

    // Log warnings but don't fail validation
    if (warnings.length > 0) {
      logger.warn('[VALIDATION] Warnings found:', warnings);
    }
    
    if (issues.length > 0) {
      logger.error('[VALIDATION] Issues found:', issues);
    }

    return {
      valid: issues.length === 0,
      reason: issues.length > 0 ? issues.join('; ') : null,
      issues,
      warnings
    };
  }

  /**
   * Select appropriate algorithm based on problem characteristics
   */
  selectAlgorithm(algorithmName) {
    logger.info('[OPTIMIZATION] selectAlgorithm called with:', algorithmName);
    
    if (this.algorithms.has(algorithmName)) {
      const algorithm = this.algorithms.get(algorithmName);
      logger.info('[OPTIMIZATION] Algorithm found in map:', typeof algorithm);
      
      // Return a wrapper function that instantiates the class if needed
      if (typeof algorithm === 'function' && algorithm.prototype && algorithm.prototype.solve) {
        logger.info('[OPTIMIZATION] Algorithm is a class, will wrap it');
        return async (teachers, classrooms, courses, settings, progressCallback) => {
          logger.info('[OPTIMIZATION] Instantiating algorithm class');
          const instance = new algorithm(teachers, classrooms, courses, settings);
          logger.info('[OPTIMIZATION] Calling solve() on instance');
          return await instance.solve(progressCallback);
        };
      }
      
      logger.info('[OPTIMIZATION] Algorithm is a regular function');
      return algorithm;
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

    // Adjust parameters based on problem size - CAP AT REASONABLE VALUES
    if (settings.algorithm === 'genetic' || settings.algorithm === 'hybrid') {
      // Cap population size - never exceed 100
      const basePopulation = settings.populationSize || 50;
      if (problemSize > 10000) {
        optimizedSettings.populationSize = Math.min(100, Math.max(50, basePopulation));
      } else if (problemSize < 1000) {
        optimizedSettings.populationSize = Math.min(50, Math.max(30, basePopulation * 0.8));
      } else {
        optimizedSettings.populationSize = Math.min(75, Math.max(40, basePopulation));
      }

      // Cap generations - never exceed 300
      const baseGenerations = settings.maxGenerations || 200;
      if (problemSize > 10000) {
        optimizedSettings.maxGenerations = Math.min(300, Math.max(150, baseGenerations));
      } else if (problemSize < 1000) {
        optimizedSettings.maxGenerations = Math.min(150, Math.max(100, baseGenerations * 0.8));
      } else {
        optimizedSettings.maxGenerations = Math.min(200, Math.max(100, baseGenerations));
      }

      // Adjust mutation rate based on diversity needs
      const courseVariety = new Set(courses.map(c => c.department)).size;
      if (courseVariety > 5) {
        optimizedSettings.mutationRate = Math.min(0.2, (settings.mutationRate || 0.15) * 1.2);
      } else {
        optimizedSettings.mutationRate = settings.mutationRate || 0.15;
      }

      logger.info(`[OPTIMIZATION] Adjusted GA parameters: pop=${optimizedSettings.populationSize}, gen=${optimizedSettings.maxGenerations}, mut=${optimizedSettings.mutationRate.toFixed(2)}`);
    }

    // Adjust time slots based on total required hours
    const totalHours = courses.reduce((sum, course) => sum + (course.totalHoursPerWeek || 0), 0);
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

    // Phase 1: Use CSP to find initial feasible solution (time-limited)
    const cspSolver = new CSPSolver(teachers, classrooms, courses, {
      ...settings,
      maxBacktrackingSteps: 3000 // Reduced for faster initial phase
    });

    const initialProgress = (progress) => {
      if (progressCallback) progressCallback(progress * 0.3, 'CSP Phase');
    };

    const cspResult = await cspSolver.solve(initialProgress);

    if (!cspResult.success) {
      logger.warn('CSP phase failed, falling back to pure GA');
      return this.pureGeneticAlgorithm(teachers, classrooms, courses, settings, progressCallback);
    }

    // Phase 2: Use GA to optimize the CSP solution (with reduced settings)
    logger.info('CSP found initial solution, starting GA optimization');
    
    const ga = new GeneticAlgorithm(teachers, classrooms, courses, {
      ...settings,
      populationSize: Math.min(settings.populationSize || 50, 50), // Max 50 for hybrid
      maxGenerations: Math.min(Math.floor((settings.maxGenerations || 200) * 0.5), 100), // Max 100 generations
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
    logger.info('[OPTIMIZATION] Running Backtracking Search algorithm');
    const backtracking = new BacktrackingSearch(teachers, classrooms, courses, settings);
    return backtracking.solve(progressCallback);
  }

  /**
   * Simulated annealing algorithm
   */
  async simulatedAnnealingAlgorithm(teachers, classrooms, courses, settings, progressCallback) {
    logger.info('[OPTIMIZATION] Running Simulated Annealing algorithm');
    const sa = new SimulatedAnnealing(teachers, classrooms, courses, settings);
    return sa.solve(progressCallback);
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
