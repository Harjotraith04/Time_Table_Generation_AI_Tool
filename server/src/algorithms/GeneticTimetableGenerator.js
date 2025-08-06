import { v4 as uuidv4 } from 'uuid';

/**
 * Genetic Algorithm for Timetable Generation
 * This class implements a sophisticated genetic algorithm to optimize timetable scheduling
 * considering multiple constraints and objectives.
 */
export class GeneticTimetableGenerator {
  constructor(options = {}) {
    // Algorithm parameters
    this.populationSize = options.populationSize || 100;
    this.maxGenerations = options.maxGenerations || 1000;
    this.crossoverRate = options.crossoverRate || 0.8;
    this.mutationRate = options.mutationRate || 0.1;
    this.eliteSize = options.eliteSize || 10;
    this.tournamentSize = options.tournamentSize || 5;
    
    // Convergence criteria
    this.maxStagnantGenerations = options.maxStagnantGenerations || 100;
    this.targetFitness = options.targetFitness || 0.95;
    
    // Data structures
    this.teachers = [];
    this.classrooms = [];
    this.courses = [];
    this.timeSlots = [];
    this.constraints = {};
    
    // Generation tracking
    this.currentGeneration = 0;
    this.bestFitness = 0;
    this.stagnantGenerations = 0;
    this.generationHistory = [];
    
    // Callbacks for progress tracking
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Initialize the algorithm with input data
   */
  initialize(data) {
    try {
      this.teachers = data.teachers || [];
      this.classrooms = data.classrooms || [];
      this.courses = data.courses || [];
      this.constraints = data.constraints || {};
      
      // Generate time slots
      this.generateTimeSlots();
      
      // Validate input data
      this.validateInputData();
      
      console.log('Genetic Algorithm initialized successfully');
      console.log(`Teachers: ${this.teachers.length}, Classrooms: ${this.classrooms.length}, Courses: ${this.courses.length}`);
      
    } catch (error) {
      this.onError(error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate time slots based on working hours and constraints
   */
  generateTimeSlots() {
    this.timeSlots = [];
    const workingDays = this.constraints.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = this.constraints.startTime || '09:00';
    const endTime = this.constraints.endTime || '17:00';
    const slotDuration = this.constraints.slotDuration || 60; // minutes
    const breakSlots = this.constraints.breakSlots || ['12:00-13:00']; // lunch break
    
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
          this.timeSlots.push({
            id: `${day}_${slotIndex}`,
            day: day,
            dayIndex: dayIndex,
            slotIndex: slotIndex,
            startTime: this.formatTime(currentTime),
            endTime: this.formatTime(slotEnd),
            timeString: timeString
          });
          slotIndex++;
        }
        
        currentTime = slotEnd;
      }
    });
  }

  /**
   * Parse time string to Date object
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Format Date object to time string
   */
  formatTime(date) {
    return date.toTimeString().slice(0, 5);
  }

  /**
   * Validate input data for completeness and consistency
   */
  validateInputData() {
    const errors = [];
    
    if (!this.teachers.length) errors.push('No teachers provided');
    if (!this.classrooms.length) errors.push('No classrooms provided');
    if (!this.courses.length) errors.push('No courses provided');
    if (!this.timeSlots.length) errors.push('No time slots generated');
    
    // Validate teacher data
    this.teachers.forEach((teacher, index) => {
      if (!teacher.id) errors.push(`Teacher ${index} missing ID`);
      if (!teacher.subjects || !teacher.subjects.length) {
        errors.push(`Teacher ${teacher.name || index} has no subjects assigned`);
      }
    });
    
    // Validate classroom data
    this.classrooms.forEach((classroom, index) => {
      if (!classroom.id) errors.push(`Classroom ${index} missing ID`);
      if (!classroom.capacity) errors.push(`Classroom ${classroom.name || index} missing capacity`);
    });
    
    // Validate course data
    this.courses.forEach((course, index) => {
      if (!course.id) errors.push(`Course ${index} missing ID`);
      if (!course.teacherId) errors.push(`Course ${course.name || index} missing teacher assignment`);
      if (!course.duration) errors.push(`Course ${course.name || index} missing duration`);
    });
    
    if (errors.length > 0) {
      throw new Error(`Data validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Generate the initial population of timetables
   */
  generateInitialPopulation() {
    const population = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      const individual = this.createRandomIndividual();
      population.push(individual);
    }
    
    return population;
  }

  /**
   * Create a random individual (timetable)
   */
  createRandomIndividual() {
    const individual = {
      id: uuidv4(),
      schedule: [],
      fitness: 0,
      violations: {}
    };
    
    // Assign each course to a random time slot and classroom
    this.courses.forEach(course => {
      const assignment = {
        courseId: course.id,
        courseName: course.name,
        teacherId: course.teacherId,
        classroomId: this.getRandomClassroom(course).id,
        timeSlotId: this.getRandomTimeSlot().id,
        studentGroup: course.studentGroup,
        duration: course.duration || 1
      };
      
      individual.schedule.push(assignment);
    });
    
    return individual;
  }

  /**
   * Get a random suitable classroom for a course
   */
  getRandomClassroom(course) {
    let suitableClassrooms = this.classrooms.filter(classroom => {
      return classroom.capacity >= (course.studentCount || 0) &&
             (!course.roomType || classroom.type === course.roomType);
    });
    
    if (suitableClassrooms.length === 0) {
      suitableClassrooms = this.classrooms; // Fallback to any classroom
    }
    
    return suitableClassrooms[Math.floor(Math.random() * suitableClassrooms.length)];
  }

  /**
   * Get a random time slot
   */
  getRandomTimeSlot() {
    return this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
  }

  /**
   * Calculate fitness for an individual
   */
  calculateFitness(individual) {
    let fitness = 100; // Start with perfect score
    const violations = {
      teacherConflicts: 0,
      classroomConflicts: 0,
      studentConflicts: 0,
      teacherPreferences: 0,
      workloadBalance: 0,
      roomCapacity: 0,
      consecutiveHours: 0
    };

    // Check for conflicts and violations
    violations.teacherConflicts = this.checkTeacherConflicts(individual.schedule);
    violations.classroomConflicts = this.checkClassroomConflicts(individual.schedule);
    violations.studentConflicts = this.checkStudentConflicts(individual.schedule);
    violations.teacherPreferences = this.checkTeacherPreferences(individual.schedule);
    violations.workloadBalance = this.checkWorkloadBalance(individual.schedule);
    violations.roomCapacity = this.checkRoomCapacity(individual.schedule);
    violations.consecutiveHours = this.checkConsecutiveHours(individual.schedule);

    // Calculate penalty for each violation type
    const penalties = {
      teacherConflicts: violations.teacherConflicts * 10,
      classroomConflicts: violations.classroomConflicts * 10,
      studentConflicts: violations.studentConflicts * 8,
      teacherPreferences: violations.teacherPreferences * 3,
      workloadBalance: violations.workloadBalance * 2,
      roomCapacity: violations.roomCapacity * 5,
      consecutiveHours: violations.consecutiveHours * 1
    };

    // Subtract penalties from fitness
    const totalPenalty = Object.values(penalties).reduce((sum, penalty) => sum + penalty, 0);
    fitness = Math.max(0, fitness - totalPenalty);

    // Normalize fitness to 0-1 range
    individual.fitness = fitness / 100;
    individual.violations = violations;
    individual.penalties = penalties;

    return individual.fitness;
  }

  /**
   * Check for teacher scheduling conflicts
   */
  checkTeacherConflicts(schedule) {
    const teacherSchedule = {};
    let conflicts = 0;

    schedule.forEach(assignment => {
      const key = `${assignment.teacherId}_${assignment.timeSlotId}`;
      if (teacherSchedule[key]) {
        conflicts++;
      } else {
        teacherSchedule[key] = assignment;
      }
    });

    return conflicts;
  }

  /**
   * Check for classroom scheduling conflicts
   */
  checkClassroomConflicts(schedule) {
    const classroomSchedule = {};
    let conflicts = 0;

    schedule.forEach(assignment => {
      const key = `${assignment.classroomId}_${assignment.timeSlotId}`;
      if (classroomSchedule[key]) {
        conflicts++;
      } else {
        classroomSchedule[key] = assignment;
      }
    });

    return conflicts;
  }

  /**
   * Check for student group scheduling conflicts
   */
  checkStudentConflicts(schedule) {
    const studentSchedule = {};
    let conflicts = 0;

    schedule.forEach(assignment => {
      if (assignment.studentGroup) {
        const key = `${assignment.studentGroup}_${assignment.timeSlotId}`;
        if (studentSchedule[key]) {
          conflicts++;
        } else {
          studentSchedule[key] = assignment;
        }
      }
    });

    return conflicts;
  }

  /**
   * Check teacher availability preferences
   */
  checkTeacherPreferences(schedule) {
    let violations = 0;

    schedule.forEach(assignment => {
      const teacher = this.teachers.find(t => t.id === assignment.teacherId);
      const timeSlot = this.timeSlots.find(ts => ts.id === assignment.timeSlotId);
      
      if (teacher && teacher.unavailableSlots && timeSlot) {
        const isUnavailable = teacher.unavailableSlots.some(slot => 
          slot.day === timeSlot.day && slot.time === timeSlot.startTime
        );
        if (isUnavailable) violations++;
      }
    });

    return violations;
  }

  /**
   * Check workload balance for teachers
   */
  checkWorkloadBalance(schedule) {
    const teacherWorkload = {};
    
    // Calculate current workload
    schedule.forEach(assignment => {
      if (!teacherWorkload[assignment.teacherId]) {
        teacherWorkload[assignment.teacherId] = 0;
      }
      teacherWorkload[assignment.teacherId] += assignment.duration || 1;
    });

    // Check against preferred workload
    let violations = 0;
    this.teachers.forEach(teacher => {
      const currentLoad = teacherWorkload[teacher.id] || 0;
      const preferredLoad = teacher.preferredHours || 20;
      const maxLoad = teacher.maxHours || 25;
      
      if (currentLoad > maxLoad || Math.abs(currentLoad - preferredLoad) > 5) {
        violations += Math.abs(currentLoad - preferredLoad);
      }
    });

    return violations;
  }

  /**
   * Check room capacity constraints
   */
  checkRoomCapacity(schedule) {
    let violations = 0;

    schedule.forEach(assignment => {
      const classroom = this.classrooms.find(c => c.id === assignment.classroomId);
      const course = this.courses.find(c => c.id === assignment.courseId);
      
      if (classroom && course && course.studentCount > classroom.capacity) {
        violations++;
      }
    });

    return violations;
  }

  /**
   * Check for excessive consecutive hours
   */
  checkConsecutiveHours(schedule) {
    const teacherDailySchedule = {};
    let violations = 0;

    // Organize schedule by teacher and day
    schedule.forEach(assignment => {
      const timeSlot = this.timeSlots.find(ts => ts.id === assignment.timeSlotId);
      if (!teacherDailySchedule[assignment.teacherId]) {
        teacherDailySchedule[assignment.teacherId] = {};
      }
      if (!teacherDailySchedule[assignment.teacherId][timeSlot.day]) {
        teacherDailySchedule[assignment.teacherId][timeSlot.day] = [];
      }
      teacherDailySchedule[assignment.teacherId][timeSlot.day].push(timeSlot.slotIndex);
    });

    // Check for consecutive hours
    Object.values(teacherDailySchedule).forEach(teacherSchedule => {
      Object.values(teacherSchedule).forEach(daySlots => {
        daySlots.sort((a, b) => a - b);
        let consecutiveCount = 1;
        
        for (let i = 1; i < daySlots.length; i++) {
          if (daySlots[i] === daySlots[i-1] + 1) {
            consecutiveCount++;
            if (consecutiveCount > (this.constraints.maxConsecutiveHours || 3)) {
              violations++;
            }
          } else {
            consecutiveCount = 1;
          }
        }
      });
    });

    return violations;
  }

  /**
   * Selection using tournament selection
   */
  tournamentSelection(population) {
    const tournament = [];
    
    for (let i = 0; i < this.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    return tournament.reduce((best, individual) => 
      individual.fitness > best.fitness ? individual : best
    );
  }

  /**
   * Crossover operation to create offspring
   */
  crossover(parent1, parent2) {
    if (Math.random() > this.crossoverRate) {
      return [{ ...parent1 }, { ...parent2 }];
    }

    const crossoverPoint = Math.floor(Math.random() * parent1.schedule.length);
    
    const offspring1 = {
      id: uuidv4(),
      schedule: [
        ...parent1.schedule.slice(0, crossoverPoint),
        ...parent2.schedule.slice(crossoverPoint)
      ],
      fitness: 0,
      violations: {}
    };
    
    const offspring2 = {
      id: uuidv4(),
      schedule: [
        ...parent2.schedule.slice(0, crossoverPoint),
        ...parent1.schedule.slice(crossoverPoint)
      ],
      fitness: 0,
      violations: {}
    };

    return [offspring1, offspring2];
  }

  /**
   * Mutation operation
   */
  mutate(individual) {
    if (Math.random() > this.mutationRate) {
      return individual;
    }

    const mutatedIndividual = { ...individual };
    mutatedIndividual.schedule = [...individual.schedule];
    
    // Random mutation: change time slot or classroom for a random course
    const randomIndex = Math.floor(Math.random() * mutatedIndividual.schedule.length);
    const assignment = { ...mutatedIndividual.schedule[randomIndex] };
    
    if (Math.random() < 0.5) {
      // Mutate time slot
      assignment.timeSlotId = this.getRandomTimeSlot().id;
    } else {
      // Mutate classroom
      const course = this.courses.find(c => c.id === assignment.courseId);
      assignment.classroomId = this.getRandomClassroom(course).id;
    }
    
    mutatedIndividual.schedule[randomIndex] = assignment;
    mutatedIndividual.fitness = 0; // Reset fitness to trigger recalculation
    
    return mutatedIndividual;
  }

  /**
   * Main evolution process
   */
  async evolve() {
    try {
      // Initialize population
      let population = this.generateInitialPopulation();
      
      // Calculate initial fitness
      population.forEach(individual => {
        this.calculateFitness(individual);
      });
      
      population.sort((a, b) => b.fitness - a.fitness);
      this.bestFitness = population[0].fitness;
      
      this.onProgress({
        generation: 0,
        bestFitness: this.bestFitness,
        averageFitness: population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length,
        status: 'Initialized population'
      });

      // Evolution loop
      for (this.currentGeneration = 1; this.currentGeneration <= this.maxGenerations; this.currentGeneration++) {
        const newPopulation = [];
        
        // Elitism: keep best individuals
        for (let i = 0; i < this.eliteSize; i++) {
          newPopulation.push({ ...population[i] });
        }
        
        // Generate offspring
        while (newPopulation.length < this.populationSize) {
          const parent1 = this.tournamentSelection(population);
          const parent2 = this.tournamentSelection(population);
          
          const [offspring1, offspring2] = this.crossover(parent1, parent2);
          
          newPopulation.push(this.mutate(offspring1));
          if (newPopulation.length < this.populationSize) {
            newPopulation.push(this.mutate(offspring2));
          }
        }
        
        // Calculate fitness for new population
        newPopulation.forEach(individual => {
          if (individual.fitness === 0) {
            this.calculateFitness(individual);
          }
        });
        
        // Sort by fitness
        newPopulation.sort((a, b) => b.fitness - a.fitness);
        population = newPopulation;
        
        // Track progress
        const currentBestFitness = population[0].fitness;
        const averageFitness = population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;
        
        // Check for improvement
        if (currentBestFitness > this.bestFitness) {
          this.bestFitness = currentBestFitness;
          this.stagnantGenerations = 0;
        } else {
          this.stagnantGenerations++;
        }
        
        // Progress callback
        this.onProgress({
          generation: this.currentGeneration,
          bestFitness: currentBestFitness,
          averageFitness: averageFitness,
          stagnantGenerations: this.stagnantGenerations,
          status: `Generation ${this.currentGeneration}/${this.maxGenerations}`
        });
        
        // Store generation history
        this.generationHistory.push({
          generation: this.currentGeneration,
          bestFitness: currentBestFitness,
          averageFitness: averageFitness
        });
        
        // Convergence checks
        if (currentBestFitness >= this.targetFitness) {
          this.onProgress({
            generation: this.currentGeneration,
            bestFitness: currentBestFitness,
            averageFitness: averageFitness,
            status: 'Target fitness reached!'
          });
          break;
        }
        
        if (this.stagnantGenerations >= this.maxStagnantGenerations) {
          this.onProgress({
            generation: this.currentGeneration,
            bestFitness: currentBestFitness,
            averageFitness: averageFitness,
            status: 'Convergence detected (no improvement)'
          });
          break;
        }
        
        // Allow other processes to run
        if (this.currentGeneration % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      const bestSolution = population[0];
      const result = {
        success: true,
        bestSolution,
        statistics: {
          finalGeneration: this.currentGeneration,
          bestFitness: this.bestFitness,
          generationsHistory: this.generationHistory,
          totalViolations: Object.values(bestSolution.violations).reduce((sum, v) => sum + v, 0)
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
   * Convert the best solution to a readable timetable format
   */
  formatTimetable(solution) {
    const timetable = {
      metadata: {
        generatedAt: new Date().toISOString(),
        algorithm: 'Genetic Algorithm',
        fitness: solution.fitness,
        violations: solution.violations
      },
      schedule: {},
      teacherSchedules: {},
      classroomSchedules: {},
      statistics: {}
    };

    // Organize by days and time slots
    this.timeSlots.forEach(timeSlot => {
      if (!timetable.schedule[timeSlot.day]) {
        timetable.schedule[timeSlot.day] = {};
      }
      timetable.schedule[timeSlot.day][timeSlot.timeString] = [];
    });

    // Populate schedule
    solution.schedule.forEach(assignment => {
      const timeSlot = this.timeSlots.find(ts => ts.id === assignment.timeSlotId);
      const teacher = this.teachers.find(t => t.id === assignment.teacherId);
      const classroom = this.classrooms.find(c => c.id === assignment.classroomId);
      const course = this.courses.find(c => c.id === assignment.courseId);

      const scheduleEntry = {
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        teacherName: teacher?.name || 'Unknown Teacher',
        classroomName: classroom?.name || 'Unknown Classroom',
        studentGroup: assignment.studentGroup,
        duration: assignment.duration
      };

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
    });

    return timetable;
  }
}
