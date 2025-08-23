import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// ==================== ALGORITHM CONFIGURATION ====================

/**
 * @route GET /api/algorithm/algorithms
 * @desc Get available algorithms
 * @access Private
 */
router.get('/algorithms', asyncHandler(async (req, res) => {
  const algorithms = [
    {
      id: 'genetic',
      name: 'Genetic Algorithm',
      description: 'Evolutionary algorithm that uses selection, crossover, and mutation to find optimal solutions',
      parameters: {
        maxIterations: {
          type: 'number',
          default: 1000,
          min: 100,
          max: 10000,
          description: 'Maximum number of generations'
        },
        populationSize: {
          type: 'number',
          default: 100,
          min: 20,
          max: 500,
          description: 'Size of the population'
        },
        mutationRate: {
          type: 'number',
          default: 0.1,
          min: 0.01,
          max: 0.5,
          description: 'Probability of mutation'
        },
        crossoverRate: {
          type: 'number',
          default: 0.8,
          min: 0.5,
          max: 0.95,
          description: 'Probability of crossover'
        },
        eliteSize: {
          type: 'number',
          default: 10,
          min: 1,
          max: 50,
          description: 'Number of best individuals to preserve'
        }
      },
      advantages: [
        'Handles complex constraint combinations',
        'Can find global optima',
        'Robust and flexible'
      ],
      disadvantages: [
        'May take longer to converge',
        'Results can vary between runs',
        'Requires parameter tuning'
      ],
      bestFor: [
        'Large datasets',
        'Complex constraint scenarios',
        'When optimality is important'
      ]
    },
    {
      id: 'constraint_satisfaction',
      name: 'Constraint Satisfaction',
      description: 'Systematic approach that focuses on satisfying all hard constraints first',
      parameters: {
        maxBacktracks: {
          type: 'number',
          default: 1000,
          min: 100,
          max: 10000,
          description: 'Maximum backtracking attempts'
        },
        variableOrdering: {
          type: 'string',
          default: 'most_constrained',
          options: ['most_constrained', 'least_constrained', 'random'],
          description: 'Strategy for selecting variables'
        },
        valueOrdering: {
          type: 'string',
          default: 'least_constraining',
          options: ['least_constraining', 'most_constraining', 'random'],
          description: 'Strategy for selecting values'
        }
      },
      advantages: [
        'Guarantees constraint satisfaction',
        'Systematic and predictable',
        'Good for strict requirements'
      ],
      disadvantages: [
        'May not find optimal solutions',
        'Can be slow for large problems',
        'Less flexible than heuristic methods'
      ],
      bestFor: [
        'Strict constraint requirements',
        'Small to medium datasets',
        'When feasibility is more important than optimality'
      ]
    },
    {
      id: 'heuristic',
      name: 'Heuristic Algorithm',
      description: 'Fast greedy approach using domain-specific rules and heuristics',
      parameters: {
        priorityWeight: {
          type: 'number',
          default: 0.7,
          min: 0.1,
          max: 0.9,
          description: 'Weight for priority-based decisions'
        },
        conflictThreshold: {
          type: 'number',
          default: 0.3,
          min: 0.1,
          max: 0.5,
          description: 'Threshold for conflict resolution'
        },
        maxRetries: {
          type: 'number',
          default: 5,
          min: 1,
          max: 20,
          description: 'Maximum retry attempts'
        }
      },
      advantages: [
        'Very fast execution',
        'Predictable results',
        'Easy to understand and modify'
      ],
      disadvantages: [
        'May not find optimal solutions',
        'Can get stuck in local optima',
        'Less robust for complex constraints'
      ],
      bestFor: [
        'Quick timetable generation',
        'Simple constraint scenarios',
        'When speed is more important than optimality'
      ]
    }
  ];

  res.json({
    success: true,
    data: algorithms
  });
}));

/**
 * @route GET /api/algorithm/constraints
 * @desc Get available constraint types
 * @access Private
 */
router.get('/constraints', asyncHandler(async (req, res) => {
  const constraints = {
    hard: [
      {
        id: 'teacherConflict',
        name: 'Teacher Conflict',
        description: 'A teacher cannot be scheduled for multiple classes at the same time',
        category: 'scheduling',
        severity: 'critical',
        examples: [
          'Dr. Smith cannot teach Math 101 and Physics 201 simultaneously',
          'Lab instructor cannot be in two different labs at the same time'
        ]
      },
      {
        id: 'roomConflict',
        name: 'Room Conflict',
        description: 'A room cannot be occupied by multiple classes at the same time',
        category: 'resource',
        severity: 'critical',
        examples: [
          'Room A101 cannot host both Math 101 and English 201',
          'Lab L201 cannot be used for two different practical sessions'
        ]
      },
      {
        id: 'teacherAvailability',
        name: 'Teacher Availability',
        description: 'Teachers can only be scheduled during their available time slots',
        category: 'availability',
        severity: 'critical',
        examples: [
          'Dr. Johnson is only available on Monday, Wednesday, Friday',
          'Visiting faculty has specific time constraints'
        ]
      },
      {
        id: 'roomAvailability',
        name: 'Room Availability',
        description: 'Rooms can only be used during their operational hours',
        category: 'availability',
        severity: 'critical',
        examples: [
          'Computer labs are only available 9 AM - 5 PM',
          'Some rooms have maintenance schedules'
        ]
      },
      {
        id: 'workingHours',
        name: 'Working Hours',
        description: 'Classes must be scheduled within institutional working hours',
        category: 'institutional',
        severity: 'critical',
        examples: [
          'No classes before 8 AM or after 6 PM',
          'Weekend classes follow different schedules'
        ]
      },
      {
        id: 'coursePrerequisites',
        name: 'Course Prerequisites',
        description: 'Some courses require other courses to be completed first',
        category: 'academic',
        severity: 'high',
        examples: [
          'Calculus II requires Calculus I to be completed',
          'Advanced programming requires basic programming skills'
        ]
      },
      {
        id: 'roomCapacity',
        name: 'Room Capacity',
        description: 'Room must accommodate the number of students in the class',
        category: 'resource',
        severity: 'high',
        examples: [
          'Class of 50 students cannot be assigned to a 30-seat room',
          'Lab sessions need appropriate equipment capacity'
        ]
      },
      {
        id: 'roomTypeCompatibility',
        name: 'Room Type Compatibility',
        description: 'Room type must match the subject requirements',
        category: 'resource',
        severity: 'high',
        examples: [
          'Lab subjects require laboratory rooms',
          'Computer programming needs computer labs'
        ]
      }
    ],
    soft: [
      {
        id: 'teacherWorkloadBalance',
        name: 'Teacher Workload Balance',
        description: 'Teachers should have reasonably balanced teaching loads',
        category: 'workload',
        severity: 'medium',
        examples: [
          'Avoid one teacher having 8 hours while another has 2 hours',
          'Distribute workload evenly across faculty'
        ]
      },
      {
        id: 'roomUtilization',
        name: 'Room Utilization',
        description: 'Rooms should be used efficiently without overloading',
        category: 'resource',
        severity: 'medium',
        examples: [
          'Avoid some rooms being empty while others are overbooked',
          'Balance usage across different building areas'
        ]
      },
      {
        id: 'dayDistribution',
        name: 'Day Distribution',
        description: 'Classes should be distributed evenly across working days',
        category: 'scheduling',
        severity: 'low',
        examples: [
          'Avoid Monday being overloaded while Friday is light',
          'Balance workload across the week'
        ]
      },
      {
        id: 'consecutiveHours',
        name: 'Consecutive Hours',
        description: 'Teachers should have breaks between consecutive classes',
        category: 'workload',
        severity: 'medium',
        examples: [
          'Avoid 4 consecutive hours without breaks',
          'Provide reasonable rest periods'
        ]
      },
      {
        id: 'preferredTimeSlots',
        name: 'Preferred Time Slots',
        description: 'Some subjects work better at certain times',
        category: 'preference',
        severity: 'low',
        examples: [
          'Lab sessions work better in morning slots',
          'Theory classes preferred in afternoon'
        ]
      },
      {
        id: 'teacherPreferences',
        name: 'Teacher Preferences',
        description: 'Respect teacher preferences when possible',
        category: 'preference',
        severity: 'low',
        examples: [
          'Some teachers prefer morning classes',
          'Respect personal scheduling preferences'
        ]
      },
      {
        id: 'roomPreferences',
        name: 'Room Preferences',
        description: 'Use preferred rooms when available',
        category: 'preference',
        severity: 'low',
        examples: [
          'Use rooms closer to teacher offices',
          'Prefer rooms with specific equipment'
        ]
      }
    ]
  };

  res.json({
    success: true,
    data: constraints
  });
}));

/**
 * @route GET /api/algorithm/optimization-goals
 * @desc Get available optimization goals
 * @access Private
 */
router.get('/optimization-goals', asyncHandler(async (req, res) => {
  const optimizationGoals = [
    {
      id: 'constraint_satisfaction',
      name: 'Constraint Satisfaction',
      description: 'Maximize the number of satisfied constraints',
      priority: 'high',
      metrics: ['hard_constraint_violations', 'soft_constraint_violations'],
      weight: 0.4
    },
    {
      id: 'workload_balance',
      name: 'Workload Balance',
      description: 'Balance teaching load across faculty members',
      priority: 'medium',
      metrics: ['teacher_workload_variance', 'teacher_workload_range'],
      weight: 0.2
    },
    {
      id: 'resource_efficiency',
      name: 'Resource Efficiency',
      description: 'Optimize room and equipment utilization',
      priority: 'medium',
      metrics: ['room_utilization_rate', 'equipment_usage_efficiency'],
      weight: 0.2
    },
    {
      id: 'schedule_quality',
      name: 'Schedule Quality',
      description: 'Improve overall schedule quality and student experience',
      priority: 'low',
      metrics: ['consecutive_hours', 'day_distribution', 'break_distribution'],
      weight: 0.1
    },
    {
      id: 'operational_efficiency',
      name: 'Operational Efficiency',
      description: 'Minimize operational costs and complexity',
      priority: 'low',
      metrics: ['room_changes', 'teacher_movements', 'maintenance_slots'],
      weight: 0.1
    }
  ];

  res.json({
    success: true,
    data: optimizationGoals
  });
}));

/**
 * @route POST /api/algorithm/validate-parameters
 * @desc Validate algorithm parameters
 * @access Private
 */
router.post('/validate-parameters', [
  body('algorithm').isIn(['genetic', 'constraint_satisfaction', 'heuristic']).withMessage('Invalid algorithm'),
  body('parameters').isObject().withMessage('Parameters must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { algorithm, parameters } = req.body;
  const validationResults = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: []
  };

  // Algorithm-specific validation
  switch (algorithm) {
    case 'genetic':
      if (parameters.maxIterations && (parameters.maxIterations < 100 || parameters.maxIterations > 10000)) {
        validationResults.errors.push('maxIterations should be between 100 and 10000');
        validationResults.isValid = false;
      }
      
      if (parameters.populationSize && (parameters.populationSize < 20 || parameters.populationSize > 500)) {
        validationResults.errors.push('populationSize should be between 20 and 500');
        validationResults.isValid = false;
      }
      
      if (parameters.mutationRate && (parameters.mutationRate < 0.01 || parameters.mutationRate > 0.5)) {
        validationResults.errors.push('mutationRate should be between 0.01 and 0.5');
        validationResults.isValid = false;
      }
      
      if (parameters.eliteSize && parameters.populationSize && parameters.eliteSize > parameters.populationSize * 0.5) {
        validationResults.warnings.push('eliteSize should not exceed 50% of populationSize');
      }
      break;

    case 'constraint_satisfaction':
      if (parameters.maxBacktracks && (parameters.maxBacktracks < 100 || parameters.maxBacktracks > 10000)) {
        validationResults.errors.push('maxBacktracks should be between 100 and 10000');
        validationResults.isValid = false;
      }
      break;

    case 'heuristic':
      if (parameters.priorityWeight && (parameters.priorityWeight < 0.1 || parameters.priorityWeight > 0.9)) {
        validationResults.errors.push('priorityWeight should be between 0.1 and 0.9');
        validationResults.isValid = false;
      }
      break;
  }

  // General recommendations
  if (algorithm === 'genetic' && parameters.populationSize > 200) {
    validationResults.recommendations.push('Large population size may increase computation time significantly');
  }

  if (algorithm === 'constraint_satisfaction' && parameters.maxBacktracks > 5000) {
    validationResults.recommendations.push('High backtrack limit may cause long execution times');
  }

  res.json({
    success: true,
    data: validationResults
  });
}));

/**
 * @route POST /api/algorithm/recommend
 * @desc Get algorithm recommendations based on data size
 * @access Private
 */
router.post('/recommend', [
  body('dataSize').isObject().withMessage('Data size must be an object'),
  body('dataSize.teachers').isInt({ min: 1 }).withMessage('Teacher count must be positive'),
  body('dataSize.courses').isInt({ min: 1 }).withMessage('Course count must be positive'),
  body('dataSize.classrooms').isInt({ min: 1 }).withMessage('Classroom count must be positive'),
  body('constraintComplexity').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid constraint complexity'),
  body('timeConstraint').optional().isIn(['fast', 'balanced', 'thorough']).withMessage('Invalid time constraint')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { dataSize, constraintComplexity = 'medium', timeConstraint = 'balanced' } = req.body;
  const totalEntities = dataSize.teachers + dataSize.courses + dataSize.classrooms;

  const recommendations = [];

  // Algorithm recommendations based on data size
  if (totalEntities <= 50) {
    recommendations.push({
      algorithm: 'heuristic',
      reason: 'Small dataset - heuristic approach will be fast and effective',
      confidence: 'high',
      estimatedTime: '1-5 minutes'
    });
    
    recommendations.push({
      algorithm: 'constraint_satisfaction',
      reason: 'Small dataset - systematic approach can find optimal solutions quickly',
      confidence: 'medium',
      estimatedTime: '5-15 minutes'
    });
  } else if (totalEntities <= 200) {
    recommendations.push({
      algorithm: 'genetic',
      reason: 'Medium dataset - genetic algorithm provides good balance of speed and quality',
      confidence: 'high',
      estimatedTime: '10-30 minutes'
    });
    
    recommendations.push({
      algorithm: 'constraint_satisfaction',
      reason: 'Medium dataset - systematic approach still feasible',
      confidence: 'medium',
      estimatedTime: '15-45 minutes'
    });
  } else {
    recommendations.push({
      algorithm: 'genetic',
      reason: 'Large dataset - genetic algorithm scales well and finds good solutions',
      confidence: 'high',
      estimatedTime: '30-120 minutes'
    });
    
    recommendations.push({
      algorithm: 'heuristic',
      reason: 'Large dataset - heuristic approach for quick results',
      confidence: 'medium',
      estimatedTime: '5-20 minutes'
    });
  }

  // Adjust based on constraint complexity
  if (constraintComplexity === 'high') {
    recommendations.forEach(rec => {
      if (rec.algorithm === 'heuristic') {
        rec.confidence = 'low';
        rec.reason += ' - Complex constraints may limit heuristic effectiveness';
      }
    });
  }

  // Adjust based on time constraints
  if (timeConstraint === 'fast') {
    recommendations.sort((a, b) => {
      const timeA = parseInt(a.estimatedTime.split('-')[0]);
      const timeB = parseInt(b.estimatedTime.split('-')[0]);
      return timeA - timeB;
    });
  } else if (timeConstraint === 'thorough') {
    recommendations.sort((a, b) => {
      const quality = { 'genetic': 3, 'constraint_satisfaction': 2, 'heuristic': 1 };
      return quality[b.algorithm] - quality[a.algorithm];
    });
  }

  res.json({
    success: true,
    data: {
      recommendations,
      dataSize: totalEntities,
      constraintComplexity,
      timeConstraint
    }
  });
}));

export default router;
