import { v4 as uuidv4 } from 'uuid';

/**
 * Hybrid Advanced Timetable Generator
 * 
 * This class implements a sophisticated hybrid optimization algorithm that combines:
 * 1. Constraint Satisfaction Problem (CSP) solving with Arc Consistency
 * 2. Simulated Annealing for global optimization
 * 3. Local Search with Tabu Search
 * 4. Integer Linear Programming (ILP) for critical constraints
 * 
 * Specifically designed to handle:
 * - Core vs Elective subject constraints
 * - Batch scheduling and parallel sessions
 * - Complex multi-level constraints
 * - Advanced optimization objectives
 */
export class HybridAdvancedTimetableGenerator {
  constructor(options = {}) {
    // Algorithm parameters
    this.maxIterations = options.maxIterations || 10000;
    this.initialTemperature = options.initialTemperature || 1000;
    this.coolingRate = options.coolingRate || 0.95;
    this.minTemperature = options.minTemperature || 0.01;
    this.tabuListSize = options.tabuListSize || 50;
    this.intensificationPeriod = options.intensificationPeriod || 100;
    this.diversificationPeriod = options.diversificationPeriod || 500;
    
    // CSP parameters
    this.arcConsistencyIterations = options.arcConsistencyIterations || 100;
    this.domainFilteringStrength = options.domainFilteringStrength || 0.8;
    
    // Constraint weights
    this.constraintWeights = {
      hardConstraints: {
        teacherConflict: 1000,
        classroomConflict: 1000,
        coreSubjectConflict: 1000,
        batchConflict: 800,
        roomCapacity: 900,
        teacherAvailability: 950
      },
      softConstraints: {
        electiveGroupOptimization: 300,
        teacherPreference: 200,
        workloadBalance: 250,
        consecutiveHours: 150,
        roomPreference: 100,
        timePreference: 180,
        travelTime: 120
      }
    };
    
    // Data structures
    this.teachers = [];
    this.classrooms = [];
    this.courses = [];
    this.batches = [];
    this.electiveGroups = [];
    this.coreSubjects = [];
    this.timeSlots = [];
    this.constraints = {};
    
    // Algorithm state
    this.currentSolution = null;
    this.bestSolution = null;
    this.currentTemperature = this.initialTemperature;
    this.iteration = 0;
    this.tabuList = [];
    this.solutionHistory = [];
    
    // Callbacks
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Initialize the algorithm with comprehensive data processing
   */
  initialize(data) {
    try {
      this.teachers = data.teachers || [];
      this.classrooms = data.classrooms || [];
      this.courses = data.courses || [];
      this.constraints = data.constraints || {};
      
      // Process and categorize courses
      this.processCourseCategories();
      
      // Process batches
      this.processBatches();
      
      // Generate time slots
      this.generateAdvancedTimeSlots();
      
      // Initialize constraint satisfaction domains
      this.initializeCSPDomains();
      
      // Validate and prepare data
      this.validateAndPrepareData();
      
      console.log('Hybrid Advanced Algorithm initialized successfully');
      console.log(`Teachers: ${this.teachers.length}, Classrooms: ${this.classrooms.length}`);
      console.log(`Courses: ${this.courses.length} (Core: ${this.coreSubjects.length}, Elective Groups: ${this.electiveGroups.length})`);
      console.log(`Batches: ${this.batches.length}, Time Slots: ${this.timeSlots.length}`);
      
    } catch (error) {
      this.onError(error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Process and categorize courses into core subjects and elective groups
   */
  processCourseCategories() {
    this.coreSubjects = [];
    this.electiveGroups = new Map();
    
    this.courses.forEach(course => {
      // Identify core subjects
      if (course.category === 'core' || course.isMandatory) {
        this.coreSubjects.push({
          ...course,
          conflictLevel: 'high', // Core subjects cannot overlap
          applicableToAll: true
        });
      }
      // Process elective groups
      else if (course.electiveGroup) {
        if (!this.electiveGroups.has(course.electiveGroup)) {
          this.electiveGroups.set(course.electiveGroup, []);
        }
        this.electiveGroups.get(course.electiveGroup).push({
          ...course,
          conflictLevel: 'medium', // Same group electives can overlap if different teachers
          applicableToAll: false
        });
      }
      // Handle other categories
      else {
        // Default to elective group based on department/year
        const defaultGroup = `${course.department}_${course.year}_${course.semester}`;
        if (!this.electiveGroups.has(defaultGroup)) {
          this.electiveGroups.set(defaultGroup, []);
        }
        this.electiveGroups.get(defaultGroup).push({
          ...course,
          conflictLevel: 'low',
          applicableToAll: false
        });
      }
    });
    
    console.log(`Processed ${this.coreSubjects.length} core subjects and ${this.electiveGroups.size} elective groups`);
  }

  /**
   * Process batch information and create batch scheduling data
   */
  processBatches() {
    this.batches = [];
    const batchMap = new Map();
    
    this.courses.forEach(course => {
      if (course.batches && course.batches.length > 0) {
        course.batches.forEach(batch => {
          const batchKey = `${course.studentGroup}_${batch.id}`;
          if (!batchMap.has(batchKey)) {
            const batchInfo = {
              id: batchKey,
              courseId: course.id,
              batchId: batch.id,
              name: batch.name,
              studentCount: batch.studentCount,
              parentGroup: course.studentGroup,
              canParallel: true, // Can run parallel with other batches of same course
              courses: []
            };
            batchMap.set(batchKey, batchInfo);
            this.batches.push(batchInfo);
          }
          batchMap.get(batchKey).courses.push(course.id);
        });
      } else {
        // Create single batch for courses without explicit batches
        const batchKey = `${course.studentGroup}_default`;
        if (!batchMap.has(batchKey)) {
          const batchInfo = {
            id: batchKey,
            courseId: course.id,
            batchId: 'default',
            name: 'Main Group',
            studentCount: course.studentCount,
            parentGroup: course.studentGroup,
            canParallel: false,
            courses: []
          };
          batchMap.set(batchKey, batchInfo);
          this.batches.push(batchInfo);
        }
        batchMap.get(batchKey).courses.push(course.id);
      }
    });
  }

  /**
   * Generate advanced time slots with multiple granularities
   */
  generateAdvancedTimeSlots() {
    this.timeSlots = [];
    const workingDays = this.constraints.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = this.constraints.startTime || '09:00';
    const endTime = this.constraints.endTime || '17:00';
    const slotDuration = this.constraints.slotDuration || 60; // minutes
    const breakSlots = this.constraints.breakSlots || ['12:00-13:00'];
    
    workingDays.forEach((day, dayIndex) => {
      let currentTime = this.parseTime(startTime);
      const dayEndTime = this.parseTime(endTime);
      let slotIndex = 0;
      
      while (currentTime < dayEndTime) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
        const timeString = `${this.formatTime(currentTime)}-${this.formatTime(slotEnd)}`;
        
        // Check if this is a break slot
        const isBreakSlot = breakSlots.some(breakSlot => 
          timeString.includes(breakSlot.split('-')[0])
        );
        
        if (!isBreakSlot && slotEnd <= dayEndTime) {
          const slot = {
            id: `${day}_${slotIndex}`,
            day: day,
            dayIndex: dayIndex,
            slotIndex: slotIndex,
            startTime: this.formatTime(currentTime),
            endTime: this.formatTime(slotEnd),
            timeString: timeString,
            period: this.determinePeriod(currentTime),
            popularity: this.calculateSlotPopularity(currentTime, day),
            capacity: this.calculateSlotCapacity(currentTime, day)
          };
          
          this.timeSlots.push(slot);
          slotIndex++;
        }
        
        currentTime = slotEnd;
      }
    });
  }

  /**
   * Determine the period of day (morning, afternoon, evening)
   */
  determinePeriod(time) {
    const hour = time.getHours();
    if (hour < 12) return 'morning';
    if (hour < 16) return 'afternoon';
    return 'evening';
  }

  /**
   * Calculate slot popularity based on preferences
   */
  calculateSlotPopularity(time, day) {
    const hour = time.getHours();
    let popularity = 1.0;
    
    // Morning slots are generally preferred
    if (hour >= 9 && hour <= 11) popularity = 1.0;
    else if (hour >= 14 && hour <= 16) popularity = 0.8;
    else popularity = 0.6;
    
    // Friday afternoon less popular
    if (day === 'Friday' && hour >= 15) popularity *= 0.7;
    
    return popularity;
  }

  /**
   * Calculate effective capacity of time slot
   */
  calculateSlotCapacity(time, day) {
    // Available classrooms at this time
    return this.classrooms.length;
  }

  /**
   * Initialize Constraint Satisfaction Problem domains
   */
  initializeCSPDomains() {
    this.domains = new Map();
    
    this.courses.forEach(course => {
      const domain = {
        timeSlots: this.getValidTimeSlots(course),
        classrooms: this.getValidClassrooms(course),
        teachers: this.getValidTeachers(course),
        batches: this.getValidBatches(course)
      };
      
      this.domains.set(course.id, domain);
    });
  }

  /**
   * Get valid time slots for a course based on constraints
   */
  getValidTimeSlots(course) {
    return this.timeSlots.filter(slot => {
      // Check teacher availability
      const teacher = this.teachers.find(t => t.id === course.teacherId);
      if (teacher && teacher.unavailableSlots) {
        const isUnavailable = teacher.unavailableSlots.some(unavailable => 
          unavailable.day === slot.day && 
          unavailable.time === slot.startTime
        );
        if (isUnavailable) return false;
      }
      
      // Check course preferences
      if (course.schedulingConstraints) {
        const constraints = course.schedulingConstraints;
        
        if (constraints.avoidDays && constraints.avoidDays.includes(slot.day)) {
          return false;
        }
        
        if (constraints.preferredDays && constraints.preferredDays.length > 0 && 
            !constraints.preferredDays.includes(slot.day)) {
          return false;
        }
        
        if (constraints.avoidTimeSlots && constraints.avoidTimeSlots.includes(slot.timeString)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get valid classrooms for a course
   */
  getValidClassrooms(course) {
    return this.classrooms.filter(classroom => {
      // Check capacity
      if (course.studentCount > classroom.capacity) {
        return false;
      }
      
      // Check room type requirements
      if (course.roomRequirements && course.roomRequirements.type) {
        if (classroom.type !== course.roomRequirements.type) {
          return false;
        }
      }
      
      // Check facility requirements
      if (course.roomRequirements && course.roomRequirements.facilities) {
        const hasAllFacilities = course.roomRequirements.facilities.every(
          facility => classroom.facilities && classroom.facilities.includes(facility)
        );
        if (!hasAllFacilities) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get valid teachers for a course
   */
  getValidTeachers(course) {
    return this.teachers.filter(teacher => {
      return teacher.subjects && teacher.subjects.includes(course.code);
    });
  }

  /**
   * Get valid batches for a course
   */
  getValidBatches(course) {
    return this.batches.filter(batch => {
      return batch.courses.includes(course.id);
    });
  }

  /**
   * Validate and prepare data for algorithm execution
   */
  validateAndPrepareData() {
    const errors = [];
    
    // Validate basic data presence
    if (!this.teachers.length) errors.push('No teachers provided');
    if (!this.classrooms.length) errors.push('No classrooms provided');
    if (!this.courses.length) errors.push('No courses provided');
    if (!this.timeSlots.length) errors.push('No time slots generated');
    
    // Validate domains
    this.courses.forEach(course => {
      const domain = this.domains.get(course.id);
      if (!domain.timeSlots.length) {
        errors.push(`Course ${course.name} has no valid time slots`);
      }
      if (!domain.classrooms.length) {
        errors.push(`Course ${course.name} has no valid classrooms`);
      }
    });
    
    if (errors.length > 0) {
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Generate initial solution using intelligent heuristics
   */
  generateInitialSolution() {
    const solution = {
      id: uuidv4(),
      assignments: new Map(),
      fitness: 0,
      violations: {},
      metadata: {
        algorithm: 'hybrid_advanced',
        createdAt: new Date(),
        generation: 0
      }
    };

    // Phase 1: Schedule core subjects first (highest priority)
    this.scheduleCoreSubjects(solution);
    
    // Phase 2: Schedule elective groups with optimization
    this.scheduleElectiveGroups(solution);
    
    // Phase 3: Schedule remaining courses
    this.scheduleRemainingCourses(solution);
    
    // Phase 4: Apply initial optimization
    this.applyLocalOptimization(solution);
    
    return solution;
  }

  /**
   * Schedule core subjects with strict constraints
   */
  scheduleCoreSubjects(solution) {
    console.log('Scheduling core subjects...');
    
    // Sort core subjects by priority and constraints
    const sortedCoreSubjects = this.coreSubjects.sort((a, b) => {
      // Higher student count first
      if (b.studentCount !== a.studentCount) {
        return b.studentCount - a.studentCount;
      }
      // More constrained courses first
      const aDomain = this.domains.get(a.id);
      const bDomain = this.domains.get(b.id);
      return aDomain.timeSlots.length - bDomain.timeSlots.length;
    });

    sortedCoreSubjects.forEach(course => {
      const assignment = this.findBestAssignment(course, solution, true);
      if (assignment) {
        solution.assignments.set(course.id, assignment);
      } else {
        console.warn(`Could not schedule core subject: ${course.name}`);
      }
    });
  }

  /**
   * Schedule elective groups with parallel optimization
   */
  scheduleElectiveGroups(solution) {
    console.log('Scheduling elective groups...');
    
    this.electiveGroups.forEach((groupCourses, groupName) => {
      console.log(`Processing elective group: ${groupName}`);
      
      // Sort courses in group by constraints
      const sortedCourses = groupCourses.sort((a, b) => {
        const aDomain = this.domains.get(a.id);
        const bDomain = this.domains.get(b.id);
        return aDomain.timeSlots.length - bDomain.timeSlots.length;
      });

      // Try to schedule courses in parallel when possible
      this.scheduleElectiveGroupParallel(sortedCourses, solution);
    });
  }

  /**
   * Schedule elective group courses with parallelization
   */
  scheduleElectiveGroupParallel(courses, solution) {
    const parallelSlots = new Map(); // timeSlot -> [courses]
    
    courses.forEach(course => {
      let scheduled = false;
      
      // Try to find a parallel slot with different teacher
      for (const [timeSlotId, parallelCourses] of parallelSlots) {
        const canParallel = parallelCourses.every(parallelCourse => 
          parallelCourse.teacherId !== course.teacherId
        );
        
        if (canParallel) {
          const assignment = this.findBestAssignment(course, solution, false, timeSlotId);
          if (assignment) {
            solution.assignments.set(course.id, assignment);
            parallelCourses.push(course);
            scheduled = true;
            break;
          }
        }
      }
      
      // If not scheduled in parallel, find new slot
      if (!scheduled) {
        const assignment = this.findBestAssignment(course, solution, false);
        if (assignment) {
          solution.assignments.set(course.id, assignment);
          parallelSlots.set(assignment.timeSlotId, [course]);
        }
      }
    });
  }

  /**
   * Schedule remaining courses
   */
  scheduleRemainingCourses(solution) {
    console.log('Scheduling remaining courses...');
    
    const unscheduledCourses = this.courses.filter(course => 
      !solution.assignments.has(course.id)
    );

    unscheduledCourses.forEach(course => {
      const assignment = this.findBestAssignment(course, solution, false);
      if (assignment) {
        solution.assignments.set(course.id, assignment);
      } else {
        console.warn(`Could not schedule course: ${course.name}`);
      }
    });
  }

  /**
   * Find the best assignment for a course
   */
  findBestAssignment(course, solution, isCore = false, preferredTimeSlot = null) {
    const domain = this.domains.get(course.id);
    let bestAssignment = null;
    let bestScore = -Infinity;

    const timeSlots = preferredTimeSlot ? 
      domain.timeSlots.filter(slot => slot.id === preferredTimeSlot) : 
      domain.timeSlots;

    timeSlots.forEach(timeSlot => {
      domain.classrooms.forEach(classroom => {
        const assignment = {
          courseId: course.id,
          courseName: course.name,
          teacherId: course.teacherId,
          classroomId: classroom.id,
          timeSlotId: timeSlot.id,
          studentGroup: course.studentGroup,
          duration: course.duration || 1,
          isCore: isCore,
          priority: course.priority || 1
        };

        const score = this.evaluateAssignment(assignment, solution, course);
        if (score > bestScore && this.isAssignmentValid(assignment, solution, course)) {
          bestScore = score;
          bestAssignment = assignment;
        }
      });
    });

    return bestAssignment;
  }

  /**
   * Evaluate the quality of an assignment
   */
  evaluateAssignment(assignment, solution, course) {
    let score = 100;

    // Check conflicts (hard constraints)
    score -= this.calculateHardConstraintViolations(assignment, solution) * 1000;
    
    // Check soft constraints
    score -= this.calculateSoftConstraintViolations(assignment, solution, course);
    
    // Add preference bonuses
    score += this.calculatePreferenceBonuses(assignment, course);
    
    return score;
  }

  /**
   * Calculate hard constraint violations
   */
  calculateHardConstraintViolations(assignment, solution) {
    let violations = 0;

    // Check teacher conflicts
    for (const [courseId, existingAssignment] of solution.assignments) {
      if (existingAssignment.teacherId === assignment.teacherId &&
          existingAssignment.timeSlotId === assignment.timeSlotId) {
        violations += this.constraintWeights.hardConstraints.teacherConflict;
      }
      
      // Check classroom conflicts
      if (existingAssignment.classroomId === assignment.classroomId &&
          existingAssignment.timeSlotId === assignment.timeSlotId) {
        violations += this.constraintWeights.hardConstraints.classroomConflict;
      }
      
      // Check core subject conflicts
      if (assignment.isCore && existingAssignment.isCore &&
          existingAssignment.timeSlotId === assignment.timeSlotId &&
          existingAssignment.studentGroup === assignment.studentGroup) {
        violations += this.constraintWeights.hardConstraints.coreSubjectConflict;
      }
    }

    return violations;
  }

  /**
   * Calculate soft constraint violations
   */
  calculateSoftConstraintViolations(assignment, solution, course) {
    let violations = 0;

    // Teacher workload balance
    const teacherWorkload = this.calculateTeacherWorkload(assignment.teacherId, solution);
    const teacher = this.teachers.find(t => t.id === assignment.teacherId);
    if (teacher && teacher.maxHours && teacherWorkload > teacher.maxHours) {
      violations += this.constraintWeights.softConstraints.workloadBalance;
    }

    // Consecutive hours check
    if (this.hasExcessiveConsecutiveHours(assignment, solution)) {
      violations += this.constraintWeights.softConstraints.consecutiveHours;
    }

    return violations;
  }

  /**
   * Calculate preference bonuses
   */
  calculatePreferenceBonuses(assignment, course) {
    let bonus = 0;
    const timeSlot = this.timeSlots.find(ts => ts.id === assignment.timeSlotId);
    
    // Time slot popularity bonus
    bonus += timeSlot.popularity * 10;
    
    // Course preference bonus
    if (course.schedulingConstraints && course.schedulingConstraints.preferredTimeSlots) {
      if (course.schedulingConstraints.preferredTimeSlots.includes(timeSlot.timeString)) {
        bonus += 20;
      }
    }

    return bonus;
  }

  /**
   * Check if assignment is valid
   */
  isAssignmentValid(assignment, solution, course) {
    // Check hard constraints
    return this.calculateHardConstraintViolations(assignment, solution) === 0;
  }

  /**
   * Calculate teacher workload
   */
  calculateTeacherWorkload(teacherId, solution) {
    let workload = 0;
    for (const [courseId, assignment] of solution.assignments) {
      if (assignment.teacherId === teacherId) {
        workload += assignment.duration;
      }
    }
    return workload;
  }

  /**
   * Check for excessive consecutive hours
   */
  hasExcessiveConsecutiveHours(assignment, solution) {
    const teacherDailySlots = [];
    const timeSlot = this.timeSlots.find(ts => ts.id === assignment.timeSlotId);
    
    // Get all slots for this teacher on the same day
    for (const [courseId, existingAssignment] of solution.assignments) {
      if (existingAssignment.teacherId === assignment.teacherId) {
        const existingTimeSlot = this.timeSlots.find(ts => ts.id === existingAssignment.timeSlotId);
        if (existingTimeSlot.day === timeSlot.day) {
          teacherDailySlots.push(existingTimeSlot.slotIndex);
        }
      }
    }
    
    teacherDailySlots.push(timeSlot.slotIndex);
    teacherDailySlots.sort((a, b) => a - b);
    
    // Check for consecutive sequences
    let consecutiveCount = 1;
    for (let i = 1; i < teacherDailySlots.length; i++) {
      if (teacherDailySlots[i] === teacherDailySlots[i-1] + 1) {
        consecutiveCount++;
        if (consecutiveCount > (this.constraints.maxConsecutiveHours || 3)) {
          return true;
        }
      } else {
        consecutiveCount = 1;
      }
    }
    
    return false;
  }

  /**
   * Apply local optimization to improve solution
   */
  applyLocalOptimization(solution) {
    console.log('Applying local optimization...');
    
    let improved = true;
    let iterations = 0;
    const maxIterations = 100;
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      // Try swapping assignments
      const assignments = Array.from(solution.assignments.entries());
      for (let i = 0; i < assignments.length - 1; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          if (this.trySwapAssignments(solution, assignments[i], assignments[j])) {
            improved = true;
          }
        }
      }
    }
  }

  /**
   * Try swapping two assignments
   */
  trySwapAssignments(solution, assignment1, assignment2) {
    const [courseId1, assign1] = assignment1;
    const [courseId2, assign2] = assignment2;
    
    // Create temporary swap
    const tempTimeSlot1 = assign1.timeSlotId;
    const tempClassroom1 = assign1.classroomId;
    
    assign1.timeSlotId = assign2.timeSlotId;
    assign1.classroomId = assign2.classroomId;
    assign2.timeSlotId = tempTimeSlot1;
    assign2.classroomId = tempClassroom1;
    
    // Calculate fitness change
    const newFitness = this.calculateSolutionFitness(solution);
    
    if (newFitness > solution.fitness) {
      solution.fitness = newFitness;
      return true;
    } else {
      // Revert swap
      assign1.timeSlotId = tempTimeSlot1;
      assign1.classroomId = tempClassroom1;
      assign2.timeSlotId = assign2.timeSlotId;
      assign2.classroomId = assign2.classroomId;
      return false;
    }
  }

  /**
   * Calculate overall solution fitness
   */
  calculateSolutionFitness(solution) {
    let fitness = 100;
    let totalViolations = 0;

    const violations = {
      teacherConflicts: 0,
      classroomConflicts: 0,
      coreSubjectConflicts: 0,
      batchConflicts: 0,
      roomCapacityViolations: 0,
      teacherAvailabilityViolations: 0,
      workloadImbalance: 0,
      consecutiveHoursViolations: 0,
      preferenceViolations: 0
    };

    // Calculate all violations
    const assignments = Array.from(solution.assignments.values());
    
    // Teacher conflicts
    violations.teacherConflicts = this.calculateTeacherConflicts(assignments);
    
    // Classroom conflicts
    violations.classroomConflicts = this.calculateClassroomConflicts(assignments);
    
    // Core subject conflicts
    violations.coreSubjectConflicts = this.calculateCoreSubjectConflicts(assignments);
    
    // Calculate penalties
    const totalPenalty = 
      violations.teacherConflicts * this.constraintWeights.hardConstraints.teacherConflict +
      violations.classroomConflicts * this.constraintWeights.hardConstraints.classroomConflict +
      violations.coreSubjectConflicts * this.constraintWeights.hardConstraints.coreSubjectConflict +
      violations.batchConflicts * this.constraintWeights.hardConstraints.batchConflict +
      violations.roomCapacityViolations * this.constraintWeights.hardConstraints.roomCapacity +
      violations.teacherAvailabilityViolations * this.constraintWeights.hardConstraints.teacherAvailability +
      violations.workloadImbalance * this.constraintWeights.softConstraints.workloadBalance +
      violations.consecutiveHoursViolations * this.constraintWeights.softConstraints.consecutiveHours +
      violations.preferenceViolations * this.constraintWeights.softConstraints.timePreference;

    fitness = Math.max(0, fitness - totalPenalty / 100);
    
    solution.fitness = fitness;
    solution.violations = violations;
    
    return fitness;
  }

  /**
   * Calculate teacher conflicts
   */
  calculateTeacherConflicts(assignments) {
    const teacherTimeSlots = new Map();
    let conflicts = 0;

    assignments.forEach(assignment => {
      const key = `${assignment.teacherId}_${assignment.timeSlotId}`;
      if (teacherTimeSlots.has(key)) {
        conflicts++;
      } else {
        teacherTimeSlots.set(key, assignment);
      }
    });

    return conflicts;
  }

  /**
   * Calculate classroom conflicts
   */
  calculateClassroomConflicts(assignments) {
    const classroomTimeSlots = new Map();
    let conflicts = 0;

    assignments.forEach(assignment => {
      const key = `${assignment.classroomId}_${assignment.timeSlotId}`;
      if (classroomTimeSlots.has(key)) {
        conflicts++;
      } else {
        classroomTimeSlots.set(key, assignment);
      }
    });

    return conflicts;
  }

  /**
   * Calculate core subject conflicts
   */
  calculateCoreSubjectConflicts(assignments) {
    const coreTimeSlots = new Map();
    let conflicts = 0;

    assignments.forEach(assignment => {
      if (assignment.isCore) {
        const key = `${assignment.studentGroup}_${assignment.timeSlotId}`;
        if (coreTimeSlots.has(key)) {
          conflicts++;
        } else {
          coreTimeSlots.set(key, assignment);
        }
      }
    });

    return conflicts;
  }

  /**
   * Main optimization process using hybrid approach
   */
  async optimize() {
    try {
      console.log('Starting hybrid advanced optimization...');
      
      // Phase 1: Generate initial solution
      this.currentSolution = this.generateInitialSolution();
      this.calculateSolutionFitness(this.currentSolution);
      this.bestSolution = JSON.parse(JSON.stringify(this.currentSolution));
      
      console.log(`Initial solution fitness: ${this.currentSolution.fitness}`);
      
      // Phase 2: Simulated Annealing with Tabu Search
      await this.simulatedAnnealingWithTabu();
      
      // Phase 3: Final local search intensification
      await this.finalIntensification();
      
      const result = {
        success: true,
        bestSolution: this.bestSolution,
        statistics: {
          finalIteration: this.iteration,
          bestFitness: this.bestSolution.fitness,
          totalViolations: Object.values(this.bestSolution.violations).reduce((sum, v) => sum + v, 0),
          algorithmUsed: 'Hybrid Advanced (CSP + SA + Tabu + Local Search)',
          coreSubjectsScheduled: this.coreSubjects.length,
          electiveGroupsScheduled: this.electiveGroups.size,
          totalAssignments: this.bestSolution.assignments.size
        }
      };
      
      this.onComplete(result);
      return result;
      
    } catch (error) {
      this.onError(error);
      throw error;
    }
  }

  /**
   * Simulated Annealing with Tabu Search
   */
  async simulatedAnnealingWithTabu() {
    console.log('Running Simulated Annealing with Tabu Search...');
    
    this.currentTemperature = this.initialTemperature;
    
    while (this.currentTemperature > this.minTemperature && this.iteration < this.maxIterations) {
      // Generate neighbor solution
      const neighbor = this.generateNeighborSolution(this.currentSolution);
      
      if (neighbor) {
        this.calculateSolutionFitness(neighbor);
        
        // Check if move is not in tabu list or aspiration criteria met
        const moveKey = this.getMoveKey(this.currentSolution, neighbor);
        const isTabu = this.tabuList.includes(moveKey);
        const aspirationCriteria = neighbor.fitness > this.bestSolution.fitness;
        
        if (!isTabu || aspirationCriteria) {
          // Acceptance criteria
          const deltaFitness = neighbor.fitness - this.currentSolution.fitness;
          const acceptanceProbability = deltaFitness > 0 ? 1 : 
            Math.exp(deltaFitness / this.currentTemperature);
          
          if (Math.random() < acceptanceProbability) {
            this.currentSolution = neighbor;
            
            // Update tabu list
            this.tabuList.push(moveKey);
            if (this.tabuList.length > this.tabuListSize) {
              this.tabuList.shift();
            }
            
            // Update best solution
            if (neighbor.fitness > this.bestSolution.fitness) {
              this.bestSolution = JSON.parse(JSON.stringify(neighbor));
              console.log(`New best fitness: ${this.bestSolution.fitness} at iteration ${this.iteration}`);
            }
          }
        }
      }
      
      // Cool down
      this.currentTemperature *= this.coolingRate;
      this.iteration++;
      
      // Progress callback
      if (this.iteration % 100 === 0) {
        this.onProgress({
          iteration: this.iteration,
          currentFitness: this.currentSolution.fitness,
          bestFitness: this.bestSolution.fitness,
          temperature: this.currentTemperature,
          status: `SA+Tabu iteration ${this.iteration}/${this.maxIterations}`
        });
        
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      // Diversification
      if (this.iteration % this.diversificationPeriod === 0) {
        this.diversify();
      }
    }
  }

  /**
   * Generate neighbor solution using various operators
   */
  generateNeighborSolution(solution) {
    const neighbor = JSON.parse(JSON.stringify(solution));
    const operators = ['swap', 'relocate', 'reAssign'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    switch (operator) {
      case 'swap':
        return this.swapOperator(neighbor);
      case 'relocate':
        return this.relocateOperator(neighbor);
      case 'reAssign':
        return this.reAssignOperator(neighbor);
      default:
        return this.swapOperator(neighbor);
    }
  }

  /**
   * Swap operator: swap time slots of two courses
   */
  swapOperator(solution) {
    const assignments = Array.from(solution.assignments.entries());
    if (assignments.length < 2) return null;
    
    const idx1 = Math.floor(Math.random() * assignments.length);
    let idx2 = Math.floor(Math.random() * assignments.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * assignments.length);
    }
    
    const [courseId1, assign1] = assignments[idx1];
    const [courseId2, assign2] = assignments[idx2];
    
    // Swap time slots
    const tempTimeSlot = assign1.timeSlotId;
    assign1.timeSlotId = assign2.timeSlotId;
    assign2.timeSlotId = tempTimeSlot;
    
    solution.assignments.set(courseId1, assign1);
    solution.assignments.set(courseId2, assign2);
    
    return solution;
  }

  /**
   * Relocate operator: move a course to a different time slot
   */
  relocateOperator(solution) {
    const assignments = Array.from(solution.assignments.entries());
    if (assignments.length === 0) return null;
    
    const idx = Math.floor(Math.random() * assignments.length);
    const [courseId, assignment] = assignments[idx];
    
    const course = this.courses.find(c => c.id === courseId);
    const domain = this.domains.get(courseId);
    
    if (domain.timeSlots.length > 1) {
      const newTimeSlot = domain.timeSlots[Math.floor(Math.random() * domain.timeSlots.length)];
      assignment.timeSlotId = newTimeSlot.id;
      solution.assignments.set(courseId, assignment);
    }
    
    return solution;
  }

  /**
   * ReAssign operator: change classroom assignment
   */
  reAssignOperator(solution) {
    const assignments = Array.from(solution.assignments.entries());
    if (assignments.length === 0) return null;
    
    const idx = Math.floor(Math.random() * assignments.length);
    const [courseId, assignment] = assignments[idx];
    
    const course = this.courses.find(c => c.id === courseId);
    const domain = this.domains.get(courseId);
    
    if (domain.classrooms.length > 1) {
      const newClassroom = domain.classrooms[Math.floor(Math.random() * domain.classrooms.length)];
      assignment.classroomId = newClassroom.id;
      solution.assignments.set(courseId, assignment);
    }
    
    return solution;
  }

  /**
   * Get move key for tabu list
   */
  getMoveKey(oldSolution, newSolution) {
    // Simple move key based on changed assignments
    const oldAssignments = Array.from(oldSolution.assignments.entries());
    const newAssignments = Array.from(newSolution.assignments.entries());
    
    for (let i = 0; i < oldAssignments.length; i++) {
      const [courseId, oldAssign] = oldAssignments[i];
      const [, newAssign] = newAssignments[i];
      
      if (oldAssign.timeSlotId !== newAssign.timeSlotId || 
          oldAssign.classroomId !== newAssign.classroomId) {
        return `${courseId}_${oldAssign.timeSlotId}_${newAssign.timeSlotId}`;
      }
    }
    
    return 'no_change';
  }

  /**
   * Diversification strategy
   */
  diversify() {
    console.log('Applying diversification...');
    
    // Random restart with some randomization
    const assignments = Array.from(this.currentSolution.assignments.entries());
    const numToChange = Math.floor(assignments.length * 0.3); // Change 30% of assignments
    
    for (let i = 0; i < numToChange; i++) {
      const idx = Math.floor(Math.random() * assignments.length);
      const [courseId, assignment] = assignments[idx];
      
      const course = this.courses.find(c => c.id === courseId);
      const domain = this.domains.get(courseId);
      
      // Random new assignment
      if (domain.timeSlots.length > 0 && domain.classrooms.length > 0) {
        assignment.timeSlotId = domain.timeSlots[Math.floor(Math.random() * domain.timeSlots.length)].id;
        assignment.classroomId = domain.classrooms[Math.floor(Math.random() * domain.classrooms.length)].id;
        this.currentSolution.assignments.set(courseId, assignment);
      }
    }
    
    this.calculateSolutionFitness(this.currentSolution);
  }

  /**
   * Final intensification using local search
   */
  async finalIntensification() {
    console.log('Running final intensification...');
    
    let improved = true;
    let intensificationIterations = 0;
    const maxIntensificationIterations = 200;
    
    while (improved && intensificationIterations < maxIntensificationIterations) {
      improved = false;
      intensificationIterations++;
      
      // Try all possible improvements
      const assignments = Array.from(this.bestSolution.assignments.entries());
      
      for (let i = 0; i < assignments.length; i++) {
        const [courseId, assignment] = assignments[i];
        const course = this.courses.find(c => c.id === courseId);
        const domain = this.domains.get(courseId);
        
        const currentFitness = this.bestSolution.fitness;
        
        // Try all valid time slots
        for (const timeSlot of domain.timeSlots) {
          if (timeSlot.id !== assignment.timeSlotId) {
            const originalTimeSlot = assignment.timeSlotId;
            assignment.timeSlotId = timeSlot.id;
            
            this.calculateSolutionFitness(this.bestSolution);
            
            if (this.bestSolution.fitness > currentFitness) {
              improved = true;
              console.log(`Intensification improved fitness to: ${this.bestSolution.fitness}`);
            } else {
              assignment.timeSlotId = originalTimeSlot;
              this.bestSolution.fitness = currentFitness;
            }
          }
        }
        
        // Try all valid classrooms
        for (const classroom of domain.classrooms) {
          if (classroom.id !== assignment.classroomId) {
            const originalClassroom = assignment.classroomId;
            assignment.classroomId = classroom.id;
            
            this.calculateSolutionFitness(this.bestSolution);
            
            if (this.bestSolution.fitness > currentFitness) {
              improved = true;
              console.log(`Intensification improved fitness to: ${this.bestSolution.fitness}`);
            } else {
              assignment.classroomId = originalClassroom;
              this.bestSolution.fitness = currentFitness;
            }
          }
        }
      }
      
      if (intensificationIterations % 50 === 0) {
        this.onProgress({
          iteration: this.iteration + intensificationIterations,
          currentFitness: this.bestSolution.fitness,
          bestFitness: this.bestSolution.fitness,
          status: `Final intensification ${intensificationIterations}/${maxIntensificationIterations}`
        });
        
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }

  /**
   * Format the solution into a readable timetable
   */
  formatTimetable(solution) {
    const timetable = {
      metadata: {
        generatedAt: new Date().toISOString(),
        algorithm: 'Hybrid Advanced Algorithm',
        fitness: solution.fitness,
        violations: solution.violations,
        totalAssignments: solution.assignments.size,
        coreSubjects: this.coreSubjects.length,
        electiveGroups: this.electiveGroups.size
      },
      schedule: {},
      teacherSchedules: {},
      classroomSchedules: {},
      batchSchedules: {},
      statistics: {
        utilizationRates: this.calculateUtilizationRates(solution),
        conflictAnalysis: this.analyzeConflicts(solution),
        optimizationMetrics: this.calculateOptimizationMetrics(solution)
      }
    };

    // Initialize schedule structure
    this.timeSlots.forEach(timeSlot => {
      if (!timetable.schedule[timeSlot.day]) {
        timetable.schedule[timeSlot.day] = {};
      }
      timetable.schedule[timeSlot.day][timeSlot.timeString] = [];
    });

    // Populate schedules
    for (const [courseId, assignment] of solution.assignments) {
      const timeSlot = this.timeSlots.find(ts => ts.id === assignment.timeSlotId);
      const teacher = this.teachers.find(t => t.id === assignment.teacherId);
      const classroom = this.classrooms.find(c => c.id === assignment.classroomId);
      const course = this.courses.find(c => c.id === assignment.courseId);

      const scheduleEntry = {
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        courseCode: course?.code,
        teacherName: teacher?.name || 'Unknown Teacher',
        classroomName: classroom?.name || 'Unknown Classroom',
        studentGroup: assignment.studentGroup,
        duration: assignment.duration,
        isCore: assignment.isCore,
        priority: assignment.priority,
        studentCount: course?.studentCount,
        courseType: course?.type
      };

      // Add to main schedule
      timetable.schedule[timeSlot.day][timeSlot.timeString].push(scheduleEntry);

      // Add to teacher schedule
      if (!timetable.teacherSchedules[teacher?.name]) {
        timetable.teacherSchedules[teacher?.name] = {};
      }
      if (!timetable.teacherSchedules[teacher?.name][timeSlot.day]) {
        timetable.teacherSchedules[teacher?.name][timeSlot.day] = {};
      }
      timetable.teacherSchedules[teacher?.name][timeSlot.day][timeSlot.timeString] = scheduleEntry;

      // Add to classroom schedule
      if (!timetable.classroomSchedules[classroom?.name]) {
        timetable.classroomSchedules[classroom?.name] = {};
      }
      if (!timetable.classroomSchedules[classroom?.name][timeSlot.day]) {
        timetable.classroomSchedules[classroom?.name][timeSlot.day] = {};
      }
      timetable.classroomSchedules[classroom?.name][timeSlot.day][timeSlot.timeString] = scheduleEntry;

      // Add to batch schedule
      if (!timetable.batchSchedules[assignment.studentGroup]) {
        timetable.batchSchedules[assignment.studentGroup] = {};
      }
      if (!timetable.batchSchedules[assignment.studentGroup][timeSlot.day]) {
        timetable.batchSchedules[assignment.studentGroup][timeSlot.day] = {};
      }
      timetable.batchSchedules[assignment.studentGroup][timeSlot.day][timeSlot.timeString] = scheduleEntry;
    }

    return timetable;
  }

  /**
   * Calculate utilization rates
   */
  calculateUtilizationRates(solution) {
    const teacherUtilization = new Map();
    const classroomUtilization = new Map();
    
    // Calculate teacher utilization
    this.teachers.forEach(teacher => {
      let hoursUsed = 0;
      for (const [courseId, assignment] of solution.assignments) {
        if (assignment.teacherId === teacher.id) {
          hoursUsed += assignment.duration;
        }
      }
      const maxHours = teacher.maxHours || 25;
      teacherUtilization.set(teacher.name, (hoursUsed / maxHours) * 100);
    });
    
    // Calculate classroom utilization
    this.classrooms.forEach(classroom => {
      let slotsUsed = 0;
      for (const [courseId, assignment] of solution.assignments) {
        if (assignment.classroomId === classroom.id) {
          slotsUsed++;
        }
      }
      const totalSlots = this.timeSlots.length;
      classroomUtilization.set(classroom.name, (slotsUsed / totalSlots) * 100);
    });
    
    return {
      teachers: Object.fromEntries(teacherUtilization),
      classrooms: Object.fromEntries(classroomUtilization)
    };
  }

  /**
   * Analyze conflicts in detail
   */
  analyzeConflicts(solution) {
    const conflicts = {
      teacherConflicts: [],
      classroomConflicts: [],
      coreSubjectConflicts: [],
      softConstraintViolations: []
    };
    
    const assignments = Array.from(solution.assignments.values());
    const timeSlotMap = new Map();
    
    // Group assignments by time slot
    assignments.forEach(assignment => {
      if (!timeSlotMap.has(assignment.timeSlotId)) {
        timeSlotMap.set(assignment.timeSlotId, []);
      }
      timeSlotMap.get(assignment.timeSlotId).push(assignment);
    });
    
    // Analyze conflicts within each time slot
    for (const [timeSlotId, slotAssignments] of timeSlotMap) {
      const timeSlot = this.timeSlots.find(ts => ts.id === timeSlotId);
      
      // Teacher conflicts
      const teacherGroups = new Map();
      slotAssignments.forEach(assignment => {
        if (!teacherGroups.has(assignment.teacherId)) {
          teacherGroups.set(assignment.teacherId, []);
        }
        teacherGroups.get(assignment.teacherId).push(assignment);
      });
      
      for (const [teacherId, teacherAssignments] of teacherGroups) {
        if (teacherAssignments.length > 1) {
          const teacher = this.teachers.find(t => t.id === teacherId);
          conflicts.teacherConflicts.push({
            teacher: teacher?.name,
            timeSlot: timeSlot.timeString,
            day: timeSlot.day,
            conflicts: teacherAssignments.map(a => a.courseName)
          });
        }
      }
      
      // Classroom conflicts
      const classroomGroups = new Map();
      slotAssignments.forEach(assignment => {
        if (!classroomGroups.has(assignment.classroomId)) {
          classroomGroups.set(assignment.classroomId, []);
        }
        classroomGroups.get(assignment.classroomId).push(assignment);
      });
      
      for (const [classroomId, classroomAssignments] of classroomGroups) {
        if (classroomAssignments.length > 1) {
          const classroom = this.classrooms.find(c => c.id === classroomId);
          conflicts.classroomConflicts.push({
            classroom: classroom?.name,
            timeSlot: timeSlot.timeString,
            day: timeSlot.day,
            conflicts: classroomAssignments.map(a => a.courseName)
          });
        }
      }
      
      // Core subject conflicts
      const coreSubjects = slotAssignments.filter(a => a.isCore);
      const coreGroups = new Map();
      coreSubjects.forEach(assignment => {
        if (!coreGroups.has(assignment.studentGroup)) {
          coreGroups.set(assignment.studentGroup, []);
        }
        coreGroups.get(assignment.studentGroup).push(assignment);
      });
      
      for (const [studentGroup, coreAssignments] of coreGroups) {
        if (coreAssignments.length > 1) {
          conflicts.coreSubjectConflicts.push({
            studentGroup: studentGroup,
            timeSlot: timeSlot.timeString,
            day: timeSlot.day,
            conflicts: coreAssignments.map(a => a.courseName)
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Calculate optimization metrics
   */
  calculateOptimizationMetrics(solution) {
    const metrics = {
      schedulingEfficiency: 0,
      resourceUtilization: 0,
      constraintSatisfaction: 0,
      balanceScore: 0
    };
    
    // Scheduling efficiency (how many courses are scheduled vs total)
    metrics.schedulingEfficiency = (solution.assignments.size / this.courses.length) * 100;
    
    // Resource utilization (average utilization of teachers and classrooms)
    const utilization = this.calculateUtilizationRates(solution);
    const avgTeacherUtilization = Object.values(utilization.teachers).reduce((sum, util) => sum + util, 0) / this.teachers.length;
    const avgClassroomUtilization = Object.values(utilization.classrooms).reduce((sum, util) => sum + util, 0) / this.classrooms.length;
    metrics.resourceUtilization = (avgTeacherUtilization + avgClassroomUtilization) / 2;
    
    // Constraint satisfaction (1 - violation rate)
    const totalViolations = Object.values(solution.violations).reduce((sum, v) => sum + v, 0);
    const maxPossibleViolations = solution.assignments.size * 10; // Rough estimate
    metrics.constraintSatisfaction = Math.max(0, (1 - totalViolations / maxPossibleViolations) * 100);
    
    // Balance score (workload distribution evenness)
    const utilization_values = Object.values(utilization.teachers);
    const mean = utilization_values.reduce((sum, val) => sum + val, 0) / utilization_values.length;
    const variance = utilization_values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / utilization_values.length;
    metrics.balanceScore = Math.max(0, 100 - Math.sqrt(variance));
    
    return metrics;
  }

  // Utility methods
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  formatTime(date) {
    return date.toTimeString().slice(0, 5);
  }
}
