import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Classroom from '../models/Classroom.js';
import Timetable from '../models/Timetable.js';

class TimetableGenerator {
  constructor(config = {}) {
    this.config = {
      maxIterations: parseInt(process.env.MAX_ITERATIONS) || 1000,
      populationSize: parseInt(process.env.POPULATION_SIZE) || 100,
      mutationRate: parseFloat(process.env.MUTATION_RATE) || 0.1,
      crossoverRate: parseFloat(process.env.CROSSOVER_RATE) || 0.8,
      eliteSize: parseInt(process.env.ELITE_SIZE) || 10,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      workingHours: {
        start: process.env.WORKING_HOURS_START || 9,
        end: process.env.WORKING_HOURS_END || 17
      },
      breakDuration: parseInt(process.env.BREAK_DURATION_MINUTES) || 15,
      lunchDuration: parseInt(process.env.LUNCH_DURATION_MINUTES) || 40,
      maxHoursPerDay: parseInt(process.env.MAX_HOURS_PER_DAY) || 8,
      maxHoursPerWeek: parseInt(process.env.MAX_HOURS_PER_WEEK) || 40,
      ...config
    };
    
    this.timeSlots = this.generateTimeSlots();
    this.constraints = new TimetableConstraints();
  }

  /**
   * Generate time slots for the working day
   */
  generateTimeSlots() {
    const slots = [];
    const startHour = this.config.workingHours.start;
    const endHour = this.config.workingHours.end;
    
    for (let hour = startHour; hour < endHour; hour++) {
      // Regular time slot
      slots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        isBreak: false
      });
      
      // Break after 2 hours (except last slot)
      if (hour < endHour - 1 && (hour - startHour + 1) % 2 === 0) {
        slots.push({
          startTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:${this.config.breakDuration.toString().padStart(2, '0')}`,
          isBreak: true,
          breakType: 'short'
        });
      }
    }
    
    // Add lunch break
    const lunchStart = Math.floor((startHour + endHour) / 2);
    slots.push({
      startTime: `${lunchStart.toString().padStart(2, '0')}:00`,
      endTime: `${(lunchStart + 1).toString().padStart(2, '0')}:${this.config.lunchDuration.toString().padStart(2, '0')}`,
      isBreak: true,
      breakType: 'lunch'
    });
    
    return slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /**
   * Main timetable generation method
   */
  async generateTimetable(params) {
    const {
      academicYear,
      semester,
      program,
      school,
      scope = 'class',
      targetId,
      algorithm = 'genetic',
      customConstraints = {}
    } = params;

    console.log(`🚀 Starting timetable generation for ${program} ${semester} ${academicYear}`);

    try {
      // Fetch all required data
      const [courses, teachers, classrooms] = await Promise.all([
        Course.findByProgram(program, academicYear, semester),
        Teacher.find({ isActive: true }),
        Classroom.find({ isActive: true })
      ]);

      if (!courses.length) {
        throw new Error('No courses found for the specified program and semester');
      }

      // Initialize timetable
      const timetable = new Timetable({
        academicYear,
        semester,
        program,
        school,
        scope,
        targetId,
        scheduleConfig: {
          workingDays: this.config.workingDays,
          workingHours: {
            startTime: `${this.config.workingHours.start}:00`,
            endTime: `${this.config.workingHours.end}:00`
          },
          timeSlots: this.timeSlots
        },
        generationInfo: {
          algorithm,
          startTime: new Date(),
          parameters: this.config
        },
        status: 'generating'
      });

      // Generate timetable based on algorithm
      let entries;
      switch (algorithm.toLowerCase()) {
        case 'genetic':
          entries = await this.generateWithGeneticAlgorithm(courses, teachers, classrooms, customConstraints);
          break;
        case 'constraint_satisfaction':
          entries = await this.generateWithConstraintSatisfaction(courses, teachers, classrooms, customConstraints);
          break;
        case 'heuristic':
          entries = await this.generateWithHeuristic(courses, teachers, classrooms, customConstraints);
          break;
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      // Validate and finalize timetable
      timetable.entries = entries;
      timetable.status = 'generated';
      timetable.generationInfo.endTime = new Date();
      
      // Validate constraints
      const validation = timetable.validateConstraints();
      timetable.validation = validation;
      
      if (validation.isValid) {
        timetable.status = 'validated';
      }

      return timetable;

    } catch (error) {
      console.error('Error generating timetable:', error);
      throw error;
    }
  }

  /**
   * Genetic Algorithm for timetable generation
   */
  async generateWithGeneticAlgorithm(courses, teachers, classrooms, customConstraints) {
    console.log('🧬 Using Genetic Algorithm for timetable generation');
    
    // Initialize population
    let population = this.initializePopulation(courses, teachers, classrooms);
    let bestSolution = null;
    let bestFitness = -Infinity;
    
    for (let generation = 0; generation < this.config.maxIterations; generation++) {
      // Evaluate fitness for all individuals
      const fitnessScores = population.map(individual => ({
        individual,
        fitness: this.calculateFitness(individual, customConstraints)
      }));
      
      // Sort by fitness
      fitnessScores.sort((a, b) => b.fitness - a.fitness);
      
      // Update best solution
      if (fitnessScores[0].fitness > bestFitness) {
        bestFitness = fitnessScores[0].fitness;
        bestSolution = JSON.parse(JSON.stringify(fitnessScores[0].individual));
      }
      
      // Check for convergence
      if (this.hasConverged(fitnessScores)) {
        console.log(`Converged at generation ${generation}`);
        break;
      }
      
      // Create new population
      const newPopulation = [];
      
      // Elitism: keep best individuals
      for (let i = 0; i < this.config.eliteSize; i++) {
        newPopulation.push(fitnessScores[i].individual);
      }
      
      // Generate rest of population through crossover and mutation
      while (newPopulation.length < this.config.populationSize) {
        const parent1 = this.tournamentSelection(fitnessScores);
        const parent2 = this.tournamentSelection(fitnessScores);
        
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child);
        
        newPopulation.push(child);
      }
      
      population = newPopulation;
      
      if (generation % 100 === 0) {
        console.log(`Generation ${generation}: Best Fitness = ${bestFitness.toFixed(2)}`);
      }
    }
    
    console.log(`🎯 Best solution found with fitness: ${bestFitness.toFixed(2)}`);
    return this.convertToTimetableEntries(bestSolution, courses, teachers, classrooms);
  }

  /**
   * Initialize population for genetic algorithm
   */
  initializePopulation(courses, teachers, classrooms) {
    const population = [];
    
    for (let i = 0; i < this.config.populationSize; i++) {
      const individual = this.createRandomIndividual(courses, teachers, classrooms);
      population.push(individual);
    }
    
    return population;
  }

  /**
   * Create a random individual (timetable solution)
   */
  createRandomIndividual(courses, teachers, classrooms) {
    const individual = [];
    
    courses.forEach(course => {
      const courseEntries = this.generateCourseEntries(course, teachers, classrooms);
      individual.push(...courseEntries);
    });
    
    return individual;
  }

  /**
   * Generate entries for a specific course
   */
  generateCourseEntries(course, teachers, classrooms) {
    const entries = [];
    const { theoryHours, practicalHours, tutorialHours } = course.weeklySchedule;
    
    // Generate theory entries
    if (theoryHours > 0) {
      const theoryEntries = this.distributeHours(
        course, 'theory', theoryHours, teachers, classrooms
      );
      entries.push(...theoryEntries);
    }
    
    // Generate practical entries
    if (practicalHours > 0) {
      const practicalEntries = this.distributeHours(
        course, 'practical', practicalHours, teachers, classrooms
      );
      entries.push(...practicalEntries);
    }
    
    // Generate tutorial entries
    if (tutorialHours > 0) {
      const tutorialEntries = this.distributeHours(
        course, 'tutorial', tutorialHours, teachers, classrooms
      );
      entries.push(...tutorialEntries);
    }
    
    return entries;
  }

  /**
   * Distribute hours across available time slots
   */
  distributeHours(course, subjectType, totalHours, teachers, classrooms) {
    const entries = [];
    let remainingHours = totalHours;
    
    // Get available teachers for this subject
    const availableTeachers = teachers.filter(teacher => 
      teacher.canTeachSubject(course.courseCode, subjectType)
    );
    
    if (availableTeachers.length === 0) {
      throw new Error(`No available teachers for course ${course.courseCode} (${subjectType})`);
    }
    
    // Get available classrooms for this subject type
    const availableClassrooms = classrooms.filter(room => 
      room.canAccommodateSubject(subjectType, course.getRequiredRoomCapacity())
    );
    
    if (availableClassrooms.length === 0) {
      throw new Error(`No available classrooms for course ${course.courseCode} (${subjectType})`);
    }
    
    // Distribute hours across working days
    const workingDays = this.config.workingDays.filter(day => 
      course.canBeScheduledOn(day)
    );
    
    while (remainingHours > 0) {
      const day = workingDays[Math.floor(Math.random() * workingDays.length)];
      const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
      const classroom = availableClassrooms[Math.floor(Math.random() * availableClassrooms.length)];
      
      // Find available time slot
      const timeSlot = this.findAvailableTimeSlot(day, course, teacher, classroom);
      
      if (timeSlot) {
        const entry = {
          courseCode: course.courseCode,
          courseName: course.courseName,
          subjectType,
          teacherId: teacher._id,
          teacherName: teacher.name,
          roomId: classroom._id,
          roomName: classroom.roomName,
          day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          duration: 1,
          batch: this.getBatchForCourse(course),
          division: this.getDivisionForCourse(course)
        };
        
        entries.push(entry);
        remainingHours--;
      }
    }
    
    return entries;
  }

  /**
   * Find available time slot for a course
   */
  findAvailableTimeSlot(day, course, teacher, classroom) {
    const availableSlots = this.timeSlots.filter(slot => 
      !slot.isBreak && 
      course.canBeScheduledAt(slot.startTime, slot.endTime) &&
      teacher.isAvailableAt(day, slot.startTime, slot.endTime) &&
      classroom.isAvailableAt(day, slot.startTime, slot.endTime)
    );
    
    return availableSlots.length > 0 ? availableSlots[0] : null;
  }

  /**
   * Get batch information for a course
   */
  getBatchForCourse(course) {
    if (course.batching.isRequired && course.batching.maxBatches > 1) {
      const batchNames = [];
      for (let i = 1; i <= course.batching.maxBatches; i++) {
        batchNames.push(`B${i}`);
      }
      return batchNames[Math.floor(Math.random() * batchNames.length)];
    }
    return null;
  }

  /**
   * Get division information for a course
   */
  getDivisionForCourse(course) {
    if (course.enrolledStudents.divisions.length > 0) {
      const randomDivision = course.enrolledStudents.divisions[
        Math.floor(Math.random() * course.enrolledStudents.divisions.length)
      ];
      return randomDivision.divisionName;
    }
    return null;
  }

  /**
   * Calculate fitness score for an individual
   */
  calculateFitness(individual, customConstraints) {
    let fitness = 0;
    
    // Hard constraints (must be satisfied)
    const hardConstraintViolations = this.constraints.checkHardConstraints(individual);
    if (hardConstraintViolations.length > 0) {
      fitness -= hardConstraintViolations.length * 1000; // Heavy penalty
      return fitness;
    }
    
    // Soft constraints (preferred but not required)
    const softConstraintViolations = this.constraints.checkSoftConstraints(individual);
    fitness -= softConstraintViolations.length * 10;
    
    // Quality metrics
    fitness += this.calculateQualityScore(individual);
    
    // Custom constraints
    if (customConstraints) {
      fitness += this.evaluateCustomConstraints(individual, customConstraints);
    }
    
    return fitness;
  }

  /**
   * Calculate quality score based on various metrics
   */
  calculateQualityScore(individual) {
    let score = 0;
    
    // Even distribution across days
    const dayDistribution = {};
    individual.forEach(entry => {
      dayDistribution[entry.day] = (dayDistribution[entry.day] || 0) + 1;
    });
    
    const avgPerDay = individual.length / this.config.workingDays.length;
    Object.values(dayDistribution).forEach(count => {
      score += 10 - Math.abs(count - avgPerDay);
    });
    
    // Teacher workload balance
    const teacherWorkload = {};
    individual.forEach(entry => {
      teacherWorkload[entry.teacherId] = (teacherWorkload[entry.teacherId] || 0) + entry.duration;
    });
    
    const avgTeacherWorkload = individual.length / Object.keys(teacherWorkload).length;
    Object.values(teacherWorkload).forEach(workload => {
      score += 5 - Math.abs(workload - avgTeacherWorkload);
    });
    
    // Room utilization
    const roomUtilization = {};
    individual.forEach(entry => {
      roomUtilization[entry.roomId] = (roomUtilization[entry.roomId] || 0) + entry.duration;
    });
    
    const avgRoomUtilization = individual.length / Object.keys(roomUtilization).length;
    Object.values(roomUtilization).forEach(utilization => {
      score += 5 - Math.abs(utilization - avgRoomUtilization);
    });
    
    return score;
  }

  /**
   * Evaluate custom constraints
   */
  evaluateCustomConstraints(individual, customConstraints) {
    let score = 0;
    
    // Add custom constraint evaluation logic here
    // This can be extended based on specific requirements
    
    return score;
  }

  /**
   * Tournament selection for genetic algorithm
   */
  tournamentSelection(fitnessScores, tournamentSize = 3) {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * fitnessScores.length);
      tournament.push(fitnessScores[randomIndex]);
    }
    
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    ).individual;
  }

  /**
   * Crossover operation for genetic algorithm
   */
  crossover(parent1, parent2) {
    if (Math.random() > this.config.crossoverRate) {
      return parent1;
    }
    
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    const child = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];
    
    return child;
  }

  /**
   * Mutation operation for genetic algorithm
   */
  mutate(individual) {
    const mutated = JSON.parse(JSON.stringify(individual));
    
    mutated.forEach((entry, index) => {
      if (Math.random() < this.config.mutationRate) {
        // Randomly change day, time, or room
        const mutationType = Math.floor(Math.random() * 3);
        
        switch (mutationType) {
          case 0: // Change day
            entry.day = this.config.workingDays[
              Math.floor(Math.random() * this.config.workingDays.length)
            ];
            break;
          case 1: // Change time
            const randomSlot = this.timeSlots[
              Math.floor(Math.random() * this.timeSlots.length)
            ];
            if (!randomSlot.isBreak) {
              entry.startTime = randomSlot.startTime;
              entry.endTime = randomSlot.endTime;
            }
            break;
          case 2: // Change room (would need to check compatibility)
            break;
        }
      }
    });
    
    return mutated;
  }

  /**
   * Check if population has converged
   */
  hasConverged(fitnessScores) {
    const topFitness = fitnessScores[0].fitness;
    const bottomFitness = fitnessScores[fitnessScores.length - 1].fitness;
    
    return Math.abs(topFitness - bottomFitness) < 0.01;
  }

  /**
   * Convert solution to timetable entries format
   */
  convertToTimetableEntries(solution, courses, teachers, classrooms) {
    return solution.map(entry => ({
      courseCode: entry.courseCode,
      courseName: entry.courseName,
      subjectType: entry.subjectType,
      teacherId: entry.teacherId,
      teacherName: entry.teacherName,
      roomId: entry.roomId,
      roomName: entry.roomName,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      duration: entry.duration,
      batch: entry.batch,
      division: entry.division
    }));
  }

  /**
   * Alternative: Constraint Satisfaction approach
   */
  async generateWithConstraintSatisfaction(courses, teachers, classrooms, customConstraints) {
    console.log('🔒 Using Constraint Satisfaction approach');
    // Implementation for constraint satisfaction algorithm
    throw new Error('Constraint Satisfaction algorithm not yet implemented');
  }

  /**
   * Alternative: Heuristic approach
   */
  async generateWithHeuristic(courses, teachers, classrooms, customConstraints) {
    console.log('💡 Using Heuristic approach');
    // Implementation for heuristic algorithm
    throw new Error('Heuristic algorithm not yet implemented');
  }
}

export default TimetableGenerator;
