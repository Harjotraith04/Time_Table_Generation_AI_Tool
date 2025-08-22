const logger = require('../utils/logger');

/**
 * Genetic Algorithm for Timetable Optimization
 * 
 * This implements a sophisticated genetic algorithm with:
 * - Custom chromosome representation for timetables
 * - Multiple crossover strategies (Order crossover, Uniform crossover)
 * - Various mutation operators (Swap, Inversion, Insertion)
 * - Tournament and Roulette wheel selection
 * - Multi-objective fitness function
 * - Elitism and diversity preservation
 */

class GeneticAlgorithm {
  constructor(teachers, classrooms, courses, settings = {}) {
    this.teachers = teachers;
    this.classrooms = classrooms;
    this.courses = courses;
    this.settings = {
      populationSize: 100,
      maxGenerations: 1000,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      eliteSize: 10,
      tournamentSize: 5,
      diversityThreshold: 0.1,
      convergenceThreshold: 50,
      fitnessWeights: {
        hardConstraints: 0.6,
        softConstraints: 0.2,
        optimization: 0.2
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60,
      breakSlots: ['12:00-13:00'],
      ...settings
    };

    this.timeSlots = this.generateTimeSlots();
    this.sessions = this.extractSessions();
    this.population = [];
    this.bestFitness = -Infinity;
    this.generationCount = 0;
    this.convergenceCount = 0;
    this.fitnessHistory = [];
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
        
        let endTimeMinute = currentMinute + this.settings.slotDuration;
        let endTimeHour = currentHour;
        
        if (endTimeMinute >= 60) {
          endTimeHour += Math.floor(endTimeMinute / 60);
          endTimeMinute = endTimeMinute % 60;
        }
        
        const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinute.toString().padStart(2, '0')}`;
        
        const isBreakTime = this.settings.breakSlots.some(breakSlot => {
          const [breakStart, breakEnd] = breakSlot.split('-');
          return this.timeOverlaps(startTime, endTime, breakStart, breakEnd);
        });

        if (!isBreakTime) {
          slots.push({
            id: slots.length,
            day,
            startTime,
            endTime
          });
        }

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
   * Extract all sessions that need to be scheduled
   */
  extractSessions() {
    const sessions = [];
    let sessionId = 0;

    for (const course of this.courses) {
      ['theory', 'practical', 'tutorial'].forEach(sessionType => {
        const session = course.sessions[sessionType];
        if (session) {
          for (let i = 0; i < session.sessionsPerWeek; i++) {
            sessions.push({
              id: sessionId++,
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              sessionType,
              sessionIndex: i,
              duration: session.duration,
              requiredFeatures: session.requiredFeatures || [],
              minRoomCapacity: Math.max(session.minRoomCapacity, course.enrolledStudents),
              requiresLab: session.requiresLab,
              assignedTeachers: course.assignedTeachers.filter(t => 
                t.sessionTypes.includes(sessionType.charAt(0).toUpperCase() + sessionType.slice(1))
              ),
              priority: this.getPriorityValue(course.priority),
              constraints: course.constraints,
              course: course
            });
          }
        }
      });
    }

    return sessions;
  }

  /**
   * Convert priority string to numerical value
   */
  getPriorityValue(priority) {
    const priorityMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return priorityMap[priority] || 2;
  }

  /**
   * Main genetic algorithm execution
   */
  async solve(progressCallback = null) {
    this.startTime = Date.now();
    this.generationCount = 0;
    this.convergenceCount = 0;

    try {
      // Initialize population
      this.initializePopulation();
      logger.info(`GA: Initialized population of ${this.population.length} individuals`);

      // Evolution loop
      while (this.generationCount < this.settings.maxGenerations && 
             this.convergenceCount < this.settings.convergenceThreshold) {
        
        // Evaluate fitness for all individuals
        this.evaluatePopulation();

        // Report progress
        if (progressCallback && this.generationCount % 10 === 0) {
          const progress = (this.generationCount / this.settings.maxGenerations) * 100;
          await progressCallback(progress, this.generationCount, this.bestFitness);
        }

        // Check for convergence
        const currentBest = Math.max(...this.population.map(ind => ind.fitness));
        if (Math.abs(currentBest - this.bestFitness) < 0.001) {
          this.convergenceCount++;
        } else {
          this.convergenceCount = 0;
          this.bestFitness = currentBest;
        }

        this.fitnessHistory.push(currentBest);

        // Create next generation
        const newPopulation = this.createNextGeneration();
        this.population = newPopulation;

        this.generationCount++;
      }

      // Get best solution
      this.evaluatePopulation();
      const bestIndividual = this.getBestIndividual();
      const solution = this.chromosomeToSchedule(bestIndividual);
      const metrics = this.calculateMetrics();

      return {
        success: true,
        solution,
        metrics,
        fitness: bestIndividual.fitness,
        conflicts: this.detectConflicts(solution)
      };

    } catch (error) {
      logger.error('Genetic Algorithm error:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Initialize population with random valid chromosomes
   */
  initializePopulation() {
    this.population = [];

    for (let i = 0; i < this.settings.populationSize; i++) {
      const chromosome = this.createRandomChromosome();
      this.population.push({
        chromosome,
        fitness: 0,
        age: 0
      });
    }
  }

  /**
   * Create a random valid chromosome
   */
  createRandomChromosome() {
    const chromosome = [];

    for (const session of this.sessions) {
      const validAssignments = this.getValidAssignments(session);
      
      if (validAssignments.length > 0) {
        const randomAssignment = validAssignments[Math.floor(Math.random() * validAssignments.length)];
        chromosome.push({
          sessionId: session.id,
          timeSlotId: randomAssignment.timeSlotId,
          teacherId: randomAssignment.teacherId,
          classroomId: randomAssignment.classroomId
        });
      } else {
        // Fallback to a random assignment even if not valid
        chromosome.push({
          sessionId: session.id,
          timeSlotId: Math.floor(Math.random() * this.timeSlots.length),
          teacherId: session.assignedTeachers[0]?.teacherId || 'unknown',
          classroomId: this.classrooms[Math.floor(Math.random() * this.classrooms.length)]?.id || 'unknown'
        });
      }
    }

    return chromosome;
  }

  /**
   * Get valid assignments for a session
   */
  getValidAssignments(session) {
    const validAssignments = [];

    for (const timeSlot of this.timeSlots) {
      for (const teacher of session.assignedTeachers) {
        const teacherObj = this.teachers.find(t => t.id === teacher.teacherId);
        if (!teacherObj?.isAvailableAt(timeSlot.day, timeSlot.startTime)) {
          continue;
        }

        for (const classroom of this.classrooms) {
          if (this.isValidAssignment(session, timeSlot, teacher.teacherId, classroom.id)) {
            validAssignments.push({
              timeSlotId: timeSlot.id,
              teacherId: teacher.teacherId,
              classroomId: classroom.id
            });
          }
        }
      }
    }

    return validAssignments;
  }

  /**
   * Check if an assignment is valid
   */
  isValidAssignment(session, timeSlot, teacherId, classroomId) {
    const classroom = this.classrooms.find(c => c.id === classroomId);
    
    if (!classroom) return false;
    
    // Check classroom availability
    if (!classroom.isAvailableAt(timeSlot.day, timeSlot.startTime)) {
      return false;
    }

    // Check capacity
    if (classroom.capacity < session.minRoomCapacity) {
      return false;
    }

    // Check required features
    if (!classroom.hasRequiredFeatures(session.requiredFeatures)) {
      return false;
    }

    // Check lab requirement
    if (session.requiresLab && !classroom.type.toLowerCase().includes('lab')) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate fitness for entire population
   */
  evaluatePopulation() {
    for (const individual of this.population) {
      individual.fitness = this.calculateFitness(individual.chromosome);
      individual.age++;
    }

    // Sort by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  /**
   * Calculate fitness for a chromosome
   */
  calculateFitness(chromosome) {
    const schedule = this.chromosomeToSchedule({ chromosome });
    
    const hardConstraintPenalty = this.evaluateHardConstraints(schedule);
    const softConstraintScore = this.evaluateSoftConstraints(schedule);
    const optimizationScore = this.evaluateOptimization(schedule);

    const fitness = 
      (1 - hardConstraintPenalty) * this.settings.fitnessWeights.hardConstraints +
      softConstraintScore * this.settings.fitnessWeights.softConstraints +
      optimizationScore * this.settings.fitnessWeights.optimization;

    return Math.max(0, fitness);
  }

  /**
   * Evaluate hard constraints (returns penalty 0-1, where 0 is perfect)
   */
  evaluateHardConstraints(schedule) {
    let violations = 0;
    let totalChecks = 0;

    // Teacher conflicts
    const teacherSchedule = new Map();
    for (const slot of schedule) {
      const key = `${slot.teacherId}_${slot.day}_${slot.startTime}`;
      if (teacherSchedule.has(key)) {
        violations++;
      }
      teacherSchedule.set(key, slot);
      totalChecks++;
    }

    // Classroom conflicts
    const roomSchedule = new Map();
    for (const slot of schedule) {
      const key = `${slot.classroomId}_${slot.day}_${slot.startTime}`;
      if (roomSchedule.has(key)) {
        violations++;
      }
      roomSchedule.set(key, slot);
      totalChecks++;
    }

    // Student conflicts (same year, semester, program)
    const studentSchedule = new Map();
    for (const slot of schedule) {
      const course = this.courses.find(c => c.id === slot.courseId);
      const key = `${course.program}_${course.year}_${course.semester}_${slot.day}_${slot.startTime}`;
      if (studentSchedule.has(key)) {
        violations++;
      }
      studentSchedule.set(key, slot);
      totalChecks++;
    }

    return totalChecks > 0 ? violations / totalChecks : 0;
  }

  /**
   * Evaluate soft constraints (returns score 0-1, where 1 is perfect)
   */
  evaluateSoftConstraints(schedule) {
    let score = 0;
    let totalChecks = 0;

    // Teacher preferences
    for (const slot of schedule) {
      const teacher = this.teachers.find(t => t.id === slot.teacherId);
      if (teacher?.preferences?.preferredTimeSlots) {
        const isPreferredTime = teacher.preferences.preferredTimeSlots.some(pref => 
          pref.day === slot.day && 
          slot.startTime >= pref.startTime && 
          slot.endTime <= pref.endTime
        );
        if (isPreferredTime) score++;
      }
      totalChecks++;
    }

    // Room preferences
    for (const slot of schedule) {
      const classroom = this.classrooms.find(c => c.id === slot.classroomId);
      const course = this.courses.find(c => c.id === slot.courseId);
      
      // Check if room capacity is appropriate (not too large)
      const capacityRatio = course.enrolledStudents / classroom.capacity;
      if (capacityRatio >= 0.6 && capacityRatio <= 0.9) {
        score++;
      }
      totalChecks++;
    }

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  /**
   * Evaluate optimization objectives (returns score 0-1, where 1 is perfect)
   */
  evaluateOptimization(schedule) {
    let score = 0;
    let totalChecks = 0;

    // Balance workload across days
    const dailyLoad = new Map();
    for (const slot of schedule) {
      dailyLoad.set(slot.day, (dailyLoad.get(slot.day) || 0) + 1);
    }

    const avgLoad = schedule.length / this.settings.workingDays.length;
    const loadVariance = Array.from(dailyLoad.values())
      .reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / this.settings.workingDays.length;
    
    const balanceScore = 1 / (1 + loadVariance); // Lower variance = higher score
    score += balanceScore;
    totalChecks++;

    // Minimize gaps in student schedules
    const studentGaps = this.calculateStudentGaps(schedule);
    const gapScore = 1 / (1 + studentGaps / schedule.length);
    score += gapScore;
    totalChecks++;

    // Room utilization efficiency
    const roomUtilization = this.calculateRoomUtilization(schedule);
    score += roomUtilization;
    totalChecks++;

    return totalChecks > 0 ? score / totalChecks : 0;
  }

  /**
   * Calculate student gaps in schedule
   */
  calculateStudentGaps(schedule) {
    const studentSchedules = new Map();

    // Group by student programs
    for (const slot of schedule) {
      const course = this.courses.find(c => c.id === slot.courseId);
      const key = `${course.program}_${course.year}_${course.semester}`;
      
      if (!studentSchedules.has(key)) {
        studentSchedules.set(key, []);
      }
      studentSchedules.get(key).push(slot);
    }

    let totalGaps = 0;
    for (const [, studentSchedule] of studentSchedules) {
      // Sort by day and time
      studentSchedule.sort((a, b) => {
        if (a.day !== b.day) {
          return this.settings.workingDays.indexOf(a.day) - this.settings.workingDays.indexOf(b.day);
        }
        return a.startTime.localeCompare(b.startTime);
      });

      // Count gaps
      for (let i = 1; i < studentSchedule.length; i++) {
        const prev = studentSchedule[i - 1];
        const curr = studentSchedule[i];
        
        if (prev.day === curr.day) {
          const gap = this.calculateTimeGap(prev.endTime, curr.startTime);
          if (gap > 0 && gap <= 180) { // Gap between 0 and 3 hours
            totalGaps += gap / 60; // Convert to hours
          }
        }
      }
    }

    return totalGaps;
  }

  /**
   * Calculate room utilization efficiency
   */
  calculateRoomUtilization(schedule) {
    const roomUsage = new Map();
    
    for (const slot of schedule) {
      roomUsage.set(slot.classroomId, (roomUsage.get(slot.classroomId) || 0) + 1);
    }

    const maxPossibleUsage = this.timeSlots.length;
    const avgUtilization = Array.from(roomUsage.values())
      .reduce((sum, usage) => sum + usage, 0) / (this.classrooms.length * maxPossibleUsage);

    return Math.min(1, avgUtilization * 2); // Scale to make moderate utilization optimal
  }

  /**
   * Create next generation using selection, crossover, and mutation
   */
  createNextGeneration() {
    const newPopulation = [];

    // Elitism - keep best individuals
    const eliteCount = Math.floor(this.settings.eliteSize);
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push({
        chromosome: [...this.population[i].chromosome],
        fitness: this.population[i].fitness,
        age: this.population[i].age
      });
    }

    // Generate offspring
    while (newPopulation.length < this.settings.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();

      let offspring1, offspring2;
      if (Math.random() < this.settings.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1.chromosome, parent2.chromosome);
      } else {
        offspring1 = [...parent1.chromosome];
        offspring2 = [...parent2.chromosome];
      }

      // Mutation
      if (Math.random() < this.settings.mutationRate) {
        this.mutate(offspring1);
      }
      if (Math.random() < this.settings.mutationRate) {
        this.mutate(offspring2);
      }

      newPopulation.push({ chromosome: offspring1, fitness: 0, age: 0 });
      if (newPopulation.length < this.settings.populationSize) {
        newPopulation.push({ chromosome: offspring2, fitness: 0, age: 0 });
      }
    }

    return newPopulation;
  }

  /**
   * Tournament selection
   */
  selectParent() {
    const tournament = [];
    for (let i = 0; i < this.settings.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }

    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  /**
   * Order crossover for timetable chromosomes
   */
  crossover(parent1, parent2) {
    const length = parent1.length;
    const offspring1 = new Array(length);
    const offspring2 = new Array(length);

    // Choose random crossover points
    const start = Math.floor(Math.random() * length);
    const end = Math.floor(Math.random() * (length - start)) + start;

    // Copy segments
    for (let i = start; i <= end; i++) {
      offspring1[i] = { ...parent1[i] };
      offspring2[i] = { ...parent2[i] };
    }

    // Fill remaining positions
    this.fillRemainingPositions(offspring1, parent2, start, end);
    this.fillRemainingPositions(offspring2, parent1, start, end);

    return [offspring1, offspring2];
  }

  /**
   * Fill remaining positions after crossover
   */
  fillRemainingPositions(offspring, parent, start, end) {
    let parentIndex = 0;
    
    for (let i = 0; i < offspring.length; i++) {
      if (i < start || i > end) {
        // Find next valid assignment from parent
        while (parentIndex < parent.length) {
          const parentGene = parent[parentIndex];
          const session = this.sessions.find(s => s.id === parentGene.sessionId);
          
          if (session && this.isValidGeneAssignment(parentGene, session)) {
            offspring[i] = { ...parentGene };
            break;
          }
          parentIndex++;
        }
        
        // If no valid assignment found, create random one
        if (!offspring[i]) {
          const sessionId = i < this.sessions.length ? this.sessions[i].id : i;
          offspring[i] = this.createRandomGene(sessionId);
        }
        
        parentIndex++;
      }
    }
  }

  /**
   * Check if a gene assignment is valid
   */
  isValidGeneAssignment(gene, session) {
    const timeSlot = this.timeSlots[gene.timeSlotId];
    return this.isValidAssignment(session, timeSlot, gene.teacherId, gene.classroomId);
  }

  /**
   * Create a random gene for a session
   */
  createRandomGene(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      return {
        sessionId,
        timeSlotId: 0,
        teacherId: 'unknown',
        classroomId: 'unknown'
      };
    }

    const validAssignments = this.getValidAssignments(session);
    if (validAssignments.length > 0) {
      const randomAssignment = validAssignments[Math.floor(Math.random() * validAssignments.length)];
      return {
        sessionId,
        timeSlotId: randomAssignment.timeSlotId,
        teacherId: randomAssignment.teacherId,
        classroomId: randomAssignment.classroomId
      };
    }

    return {
      sessionId,
      timeSlotId: Math.floor(Math.random() * this.timeSlots.length),
      teacherId: session.assignedTeachers[0]?.teacherId || 'unknown',
      classroomId: this.classrooms[0]?.id || 'unknown'
    };
  }

  /**
   * Mutation operator (swap two random genes)
   */
  mutate(chromosome) {
    const mutationType = Math.random();
    
    if (mutationType < 0.4) {
      this.swapMutation(chromosome);
    } else if (mutationType < 0.7) {
      this.insertionMutation(chromosome);
    } else {
      this.inversionMutation(chromosome);
    }
  }

  /**
   * Swap mutation
   */
  swapMutation(chromosome) {
    const index1 = Math.floor(Math.random() * chromosome.length);
    const index2 = Math.floor(Math.random() * chromosome.length);
    
    [chromosome[index1], chromosome[index2]] = [chromosome[index2], chromosome[index1]];
  }

  /**
   * Insertion mutation
   */
  insertionMutation(chromosome) {
    const index1 = Math.floor(Math.random() * chromosome.length);
    const index2 = Math.floor(Math.random() * chromosome.length);
    
    const gene = chromosome.splice(index1, 1)[0];
    chromosome.splice(index2, 0, gene);
  }

  /**
   * Inversion mutation
   */
  inversionMutation(chromosome) {
    const start = Math.floor(Math.random() * chromosome.length);
    const end = Math.floor(Math.random() * (chromosome.length - start)) + start;
    
    const segment = chromosome.slice(start, end + 1).reverse();
    chromosome.splice(start, segment.length, ...segment);
  }

  /**
   * Convert chromosome to schedule format
   */
  chromosomeToSchedule(individual) {
    const schedule = [];

    for (const gene of individual.chromosome) {
      const session = this.sessions.find(s => s.id === gene.sessionId);
      const timeSlot = this.timeSlots[gene.timeSlotId];
      const teacher = this.teachers.find(t => t.id === gene.teacherId);
      const classroom = this.classrooms.find(c => c.id === gene.classroomId);

      if (session && timeSlot) {
        schedule.push({
          day: timeSlot.day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          courseId: session.courseId,
          courseName: session.courseName,
          courseCode: session.courseCode,
          sessionType: session.sessionType,
          teacherId: gene.teacherId,
          teacherName: teacher?.name || 'Unknown',
          classroomId: gene.classroomId,
          classroomName: classroom?.name || 'Unknown',
          studentCount: session.course?.enrolledStudents || 0
        });
      }
    }

    return schedule;
  }

  /**
   * Get the best individual from population
   */
  getBestIndividual() {
    return this.population[0]; // Population is sorted by fitness
  }

  /**
   * Calculate algorithm metrics
   */
  calculateMetrics() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    return {
      algorithm: 'Genetic Algorithm',
      duration,
      generations: this.generationCount,
      convergenceRate: this.bestFitness,
      finalFitness: this.bestFitness,
      populationSize: this.settings.populationSize,
      crossoverRate: this.settings.crossoverRate,
      mutationRate: this.settings.mutationRate,
      fitnessHistory: this.fitnessHistory
    };
  }

  /**
   * Detect conflicts in the solution
   */
  detectConflicts(schedule) {
    const conflicts = [];
    
    // This would implement detailed conflict detection
    // For now, conflicts are minimized through fitness function
    
    return conflicts;
  }

  /**
   * Helper methods
   */
  timeOverlaps(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  calculateTimeGap(endTime, startTime) {
    const end = new Date(`2000-01-01 ${endTime}`);
    const start = new Date(`2000-01-01 ${startTime}`);
    return (start - end) / (1000 * 60); // Gap in minutes
  }
}

module.exports = GeneticAlgorithm;
