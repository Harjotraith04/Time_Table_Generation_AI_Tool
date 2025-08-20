const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('./auth');
const { logger } = require('../server');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * @route   GET /api/algorithm/algorithms
 * @desc    Get available algorithms with their descriptions and parameters
 * @access  Private
 */
router.get('/algorithms', (req, res) => {
  try {
    const algorithms = [
      {
        id: 'genetic',
        name: 'Genetic Algorithm',
        description: 'Evolutionary algorithm that uses selection, crossover, and mutation to find optimal solutions',
        category: 'Metaheuristic',
        complexity: 'High',
        recommendedFor: ['Large datasets', 'Complex constraints', 'Multi-objective optimization'],
        pros: [
          'Excellent for complex constraint handling',
          'Good global optimization capabilities',
          'Highly scalable to large problems',
          'Can handle multiple objectives simultaneously',
          'Robust against local optima'
        ],
        cons: [
          'Longer computation time',
          'Requires parameter tuning',
          'No guarantee of optimal solution',
          'Can be memory intensive'
        ],
        parameters: {
          populationSize: {
            type: 'integer',
            default: 100,
            min: 20,
            max: 500,
            description: 'Number of individuals in each generation'
          },
          maxGenerations: {
            type: 'integer',
            default: 1000,
            min: 100,
            max: 5000,
            description: 'Maximum number of generations to evolve'
          },
          crossoverRate: {
            type: 'float',
            default: 0.8,
            min: 0.1,
            max: 1.0,
            description: 'Probability of crossover between parents'
          },
          mutationRate: {
            type: 'float',
            default: 0.1,
            min: 0.01,
            max: 0.5,
            description: 'Probability of mutation in offspring'
          },
          eliteSize: {
            type: 'integer',
            default: 10,
            min: 1,
            max: 50,
            description: 'Number of best individuals to preserve each generation'
          },
          tournamentSize: {
            type: 'integer',
            default: 5,
            min: 2,
            max: 20,
            description: 'Size of tournament for parent selection'
          }
        },
        estimatedTime: {
          small: '2-5 minutes',
          medium: '5-15 minutes',
          large: '15-45 minutes'
        },
        qualityScore: 9.5
      },
      {
        id: 'csp',
        name: 'Constraint Satisfaction Problem (CSP)',
        description: 'Systematic approach using constraint propagation and backtracking to find valid solutions',
        category: 'Exact Algorithm',
        complexity: 'Medium',
        recommendedFor: ['Well-defined constraints', 'Guaranteed feasible solutions', 'Moderate complexity problems'],
        pros: [
          'Guaranteed to find solution if one exists',
          'Fast for well-constrained problems',
          'Excellent constraint handling',
          'Deterministic results',
          'Memory efficient'
        ],
        cons: [
          'May struggle with large datasets',
          'Can get trapped in infeasible regions',
          'Limited optimization capabilities',
          'Performance depends on constraint ordering'
        ],
        parameters: {
          maxBacktrackingSteps: {
            type: 'integer',
            default: 10000,
            min: 1000,
            max: 100000,
            description: 'Maximum number of backtracking steps before giving up'
          },
          variableOrdering: {
            type: 'string',
            default: 'MRV',
            options: ['MRV', 'LCV', 'Random'],
            description: 'Heuristic for variable ordering (Most Constraining Variable, Least Constraining Value, Random)'
          },
          valueOrdering: {
            type: 'string',
            default: 'LCV',
            options: ['LCV', 'Random'],
            description: 'Heuristic for value ordering'
          },
          arcConsistency: {
            type: 'boolean',
            default: true,
            description: 'Enable arc consistency preprocessing'
          },
          forwardChecking: {
            type: 'boolean',
            default: true,
            description: 'Enable forward checking during search'
          }
        },
        estimatedTime: {
          small: '30 seconds - 2 minutes',
          medium: '2-8 minutes',
          large: '8-25 minutes'
        },
        qualityScore: 8.5
      },
      {
        id: 'hybrid',
        name: 'Hybrid CSP-GA',
        description: 'Combines CSP for initial feasible solution with GA for optimization',
        category: 'Hybrid Algorithm',
        complexity: 'High',
        recommendedFor: ['Complex problems requiring both feasibility and optimization', 'Large-scale scheduling'],
        pros: [
          'Best of both worlds - feasibility and optimization',
          'Higher solution quality',
          'Robust performance across problem types',
          'Adaptive to problem characteristics',
          'Good balance of speed and quality'
        ],
        cons: [
          'More complex implementation',
          'Higher computational overhead',
          'Requires careful parameter balancing',
          'Longer setup time'
        ],
        parameters: {
          cspTimeLimit: {
            type: 'integer',
            default: 300,
            min: 60,
            max: 1800,
            description: 'Time limit for CSP phase (seconds)'
          },
          gaGenerations: {
            type: 'integer',
            default: 500,
            min: 100,
            max: 2000,
            description: 'Number of GA generations for optimization phase'
          },
          hybridRatio: {
            type: 'float',
            default: 0.3,
            min: 0.1,
            max: 0.7,
            description: 'Ratio of time allocated to CSP vs GA phases'
          }
        },
        estimatedTime: {
          small: '3-8 minutes',
          medium: '8-20 minutes',
          large: '20-60 minutes'
        },
        qualityScore: 9.8
      },
      {
        id: 'backtracking',
        name: 'Backtracking Search',
        description: 'Classic systematic search algorithm with intelligent backtracking',
        category: 'Exact Algorithm',
        complexity: 'Low',
        recommendedFor: ['Simple problems', 'Quick prototyping', 'Educational purposes'],
        pros: [
          'Simple and reliable',
          'Fast for small problems',
          'Guaranteed optimal solution',
          'Easy to understand and debug',
          'Minimal memory usage'
        ],
        cons: [
          'Exponential time complexity',
          'Poor scalability',
          'No optimization beyond feasibility',
          'Can be very slow for large problems'
        ],
        parameters: {
          maxDepth: {
            type: 'integer',
            default: 1000,
            min: 100,
            max: 10000,
            description: 'Maximum search depth'
          },
          timeLimit: {
            type: 'integer',
            default: 600,
            min: 60,
            max: 3600,
            description: 'Time limit in seconds'
          }
        },
        estimatedTime: {
          small: '30 seconds - 1 minute',
          medium: '1-5 minutes',
          large: '5+ minutes (may not complete)'
        },
        qualityScore: 7.0
      },
      {
        id: 'simulated_annealing',
        name: 'Simulated Annealing',
        description: 'Probabilistic optimization algorithm inspired by metallurgical annealing',
        category: 'Metaheuristic',
        complexity: 'Medium',
        recommendedFor: ['Continuous optimization', 'Avoiding local optima', 'Single-objective problems'],
        pros: [
          'Good at escaping local optima',
          'Simple implementation',
          'Flexible and adaptable',
          'Good performance-to-complexity ratio',
          'Can work with any solution representation'
        ],
        cons: [
          'Requires careful temperature scheduling',
          'No guarantee of global optimum',
          'Can be slow to converge',
          'Parameter sensitive'
        ],
        parameters: {
          initialTemperature: {
            type: 'float',
            default: 1000.0,
            min: 100.0,
            max: 10000.0,
            description: 'Starting temperature for annealing process'
          },
          coolingRate: {
            type: 'float',
            default: 0.995,
            min: 0.9,
            max: 0.999,
            description: 'Rate at which temperature decreases'
          },
          maxIterations: {
            type: 'integer',
            default: 10000,
            min: 1000,
            max: 100000,
            description: 'Maximum number of iterations'
          },
          minTemperature: {
            type: 'float',
            default: 0.1,
            min: 0.01,
            max: 10.0,
            description: 'Minimum temperature to stop annealing'
          }
        },
        estimatedTime: {
          small: '1-3 minutes',
          medium: '3-12 minutes',
          large: '12-35 minutes'
        },
        qualityScore: 8.0
      }
    ];

    res.json({
      success: true,
      data: {
        algorithms,
        recommendations: generateAlgorithmRecommendations()
      }
    });

  } catch (error) {
    logger.error('Error fetching algorithms:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching algorithms'
    });
  }
});

/**
 * @route   GET /api/algorithm/constraints
 * @desc    Get available constraint types and their configurations
 * @access  Private
 */
router.get('/constraints', (req, res) => {
  try {
    const constraints = {
      hard: [
        {
          id: 'teacher_conflict',
          name: 'Teacher Conflict',
          description: 'Prevent teachers from being assigned to multiple classes at the same time',
          category: 'Resource Conflict',
          priority: 'critical',
          violationPenalty: 1000,
          isConfigurable: false
        },
        {
          id: 'room_conflict',
          name: 'Room Conflict',
          description: 'Prevent multiple classes from being assigned to the same room at the same time',
          category: 'Resource Conflict',
          priority: 'critical',
          violationPenalty: 1000,
          isConfigurable: false
        },
        {
          id: 'student_conflict',
          name: 'Student Conflict',
          description: 'Prevent students from having multiple classes at the same time',
          category: 'Resource Conflict',
          priority: 'critical',
          violationPenalty: 1000,
          isConfigurable: false
        },
        {
          id: 'teacher_availability',
          name: 'Teacher Availability',
          description: 'Ensure teachers are only assigned during their available hours',
          category: 'Availability',
          priority: 'critical',
          violationPenalty: 800,
          isConfigurable: true,
          parameters: {
            strictMode: {
              type: 'boolean',
              default: true,
              description: 'Strictly enforce availability windows'
            }
          }
        },
        {
          id: 'room_capacity',
          name: 'Room Capacity',
          description: 'Ensure room capacity is sufficient for enrolled students',
          category: 'Capacity',
          priority: 'high',
          violationPenalty: 600,
          isConfigurable: true,
          parameters: {
            utilizationThreshold: {
              type: 'float',
              default: 0.9,
              min: 0.5,
              max: 1.0,
              description: 'Maximum room utilization allowed'
            }
          }
        },
        {
          id: 'required_features',
          name: 'Required Features',
          description: 'Ensure rooms have all required features for specific courses',
          category: 'Resource Requirements',
          priority: 'high',
          violationPenalty: 500,
          isConfigurable: false
        }
      ],
      soft: [
        {
          id: 'teacher_preferences',
          name: 'Teacher Preferences',
          description: 'Respect teacher preferred time slots and avoid unwanted times',
          category: 'Preferences',
          priority: 'medium',
          weight: 50,
          isConfigurable: true,
          parameters: {
            preferenceWeight: {
              type: 'float',
              default: 1.0,
              min: 0.1,
              max: 2.0,
              description: 'Weight for teacher preferences'
            }
          }
        },
        {
          id: 'balanced_workload',
          name: 'Balanced Teacher Workload',
          description: 'Distribute teaching hours evenly among teachers',
          category: 'Load Balancing',
          priority: 'medium',
          weight: 40,
          isConfigurable: true,
          parameters: {
            maxDeviationPercent: {
              type: 'float',
              default: 20.0,
              min: 5.0,
              max: 50.0,
              description: 'Maximum allowed deviation from average workload (%)'
            }
          }
        },
        {
          id: 'minimize_gaps',
          name: 'Minimize Student Gaps',
          description: 'Reduce gaps between classes for students',
          category: 'Student Convenience',
          priority: 'medium',
          weight: 35,
          isConfigurable: true,
          parameters: {
            maxGapHours: {
              type: 'integer',
              default: 2,
              min: 1,
              max: 4,
              description: 'Maximum allowed gap between classes (hours)'
            }
          }
        },
        {
          id: 'consecutive_sessions',
          name: 'Consecutive Sessions',
          description: 'Schedule related sessions consecutively when beneficial',
          category: 'Session Grouping',
          priority: 'low',
          weight: 20,
          isConfigurable: true,
          parameters: {
            enforceConsecutive: {
              type: 'boolean',
              default: false,
              description: 'Enforce consecutive scheduling for linked sessions'
            }
          }
        },
        {
          id: 'prime_time_usage',
          name: 'Prime Time Usage',
          description: 'Prioritize important courses during peak hours',
          category: 'Time Optimization',
          priority: 'low',
          weight: 15,
          isConfigurable: true,
          parameters: {
            primeTimeStart: {
              type: 'string',
              default: '10:00',
              description: 'Start of prime time period'
            },
            primeTimeEnd: {
              type: 'string',
              default: '15:00',
              description: 'End of prime time period'
            }
          }
        },
        {
          id: 'room_utilization',
          name: 'Optimal Room Utilization',
          description: 'Maximize efficient use of available rooms',
          category: 'Resource Optimization',
          priority: 'medium',
          weight: 30,
          isConfigurable: true,
          parameters: {
            targetUtilization: {
              type: 'float',
              default: 0.75,
              min: 0.5,
              max: 0.95,
              description: 'Target room utilization rate'
            }
          }
        }
      ],
      preferences: [
        {
          id: 'department_clustering',
          name: 'Department Clustering',
          description: 'Group courses from same department in nearby time slots',
          category: 'Organization',
          weight: 25,
          isConfigurable: true
        },
        {
          id: 'senior_faculty_priority',
          name: 'Senior Faculty Priority',
          description: 'Give scheduling preference to senior faculty members',
          category: 'Hierarchy',
          weight: 20,
          isConfigurable: true
        },
        {
          id: 'lab_session_timing',
          name: 'Lab Session Timing',
          description: 'Schedule lab sessions at optimal times',
          category: 'Session Type',
          weight: 30,
          isConfigurable: true,
          parameters: {
            preferredLabTimes: {
              type: 'array',
              default: ['14:00-17:00'],
              description: 'Preferred time windows for lab sessions'
            }
          }
        }
      ]
    };

    res.json({
      success: true,
      data: constraints
    });

  } catch (error) {
    logger.error('Error fetching constraints:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching constraints'
    });
  }
});

/**
 * @route   GET /api/algorithm/optimization-goals
 * @desc    Get available optimization goals
 * @access  Private
 */
router.get('/optimization-goals', (req, res) => {
  try {
    const optimizationGoals = [
      {
        id: 'minimize_conflicts',
        name: 'Minimize Conflicts',
        description: 'Reduce all types of scheduling conflicts to the minimum',
        category: 'Conflict Resolution',
        priority: 'critical',
        weight: 1.0,
        measuredBy: 'Number of conflicts per total assignments',
        targetValue: 0,
        isDefault: true
      },
      {
        id: 'balanced_schedule',
        name: 'Balanced Schedule',
        description: 'Distribute classes evenly across days and time slots',
        category: 'Load Distribution',
        priority: 'high',
        weight: 0.8,
        measuredBy: 'Variance in daily class distribution',
        targetValue: 'Minimize variance',
        isDefault: true
      },
      {
        id: 'teacher_preferences',
        name: 'Teacher Satisfaction',
        description: 'Maximize adherence to teacher preferences and availability',
        category: 'Satisfaction',
        priority: 'medium',
        weight: 0.6,
        measuredBy: 'Percentage of preferred time slots used',
        targetValue: '> 80%',
        isDefault: true
      },
      {
        id: 'resource_optimization',
        name: 'Resource Utilization',
        description: 'Optimize usage of classrooms and other resources',
        category: 'Efficiency',
        priority: 'medium',
        weight: 0.7,
        measuredBy: 'Room utilization percentage',
        targetValue: '70-85%',
        isDefault: true
      },
      {
        id: 'student_convenience',
        name: 'Student Convenience',
        description: 'Minimize gaps and travel time for students',
        category: 'Student Experience',
        priority: 'medium',
        weight: 0.5,
        measuredBy: 'Average gap time between classes',
        targetValue: '< 1 hour',
        isDefault: true
      },
      {
        id: 'minimize_overtime',
        name: 'Minimize Overtime',
        description: 'Keep all activities within standard working hours',
        category: 'Time Management',
        priority: 'high',
        weight: 0.9,
        measuredBy: 'Classes scheduled outside standard hours',
        targetValue: 0,
        isDefault: false
      },
      {
        id: 'energy_efficiency',
        name: 'Energy Efficiency',
        description: 'Minimize building energy usage by clustering activities',
        category: 'Sustainability',
        priority: 'low',
        weight: 0.3,
        measuredBy: 'Number of buildings in use simultaneously',
        targetValue: 'Minimize',
        isDefault: false
      },
      {
        id: 'travel_minimization',
        name: 'Travel Minimization',
        description: 'Reduce movement between buildings for all stakeholders',
        category: 'Logistics',
        priority: 'low',
        weight: 0.4,
        measuredBy: 'Inter-building transitions per day',
        targetValue: 'Minimize',
        isDefault: false
      }
    ];

    res.json({
      success: true,
      data: optimizationGoals
    });

  } catch (error) {
    logger.error('Error fetching optimization goals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching optimization goals'
    });
  }
});

/**
 * @route   POST /api/algorithm/validate-parameters
 * @desc    Validate algorithm parameters
 * @access  Private
 */
router.post('/validate-parameters', [
  body('algorithm').isIn(['genetic', 'csp', 'hybrid', 'backtracking', 'simulated_annealing']),
  body('parameters').isObject()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { algorithm, parameters } = req.body;
    const validation = validateAlgorithmParameters(algorithm, parameters);

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    logger.error('Error validating parameters:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while validating parameters'
    });
  }
});

/**
 * @route   POST /api/algorithm/recommend
 * @desc    Get algorithm recommendations based on problem characteristics
 * @access  Private
 */
router.post('/recommend', [
  body('dataSize.teachers').isInt({ min: 1 }),
  body('dataSize.classrooms').isInt({ min: 1 }),
  body('dataSize.courses').isInt({ min: 1 }),
  body('constraints').optional().isArray(),
  body('priorities').optional().isObject(),
  body('timeLimit').optional().isInt({ min: 60, max: 7200 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { dataSize, constraints = [], priorities = {}, timeLimit = 1800 } = req.body;
    const recommendations = generateAlgorithmRecommendationsForProblem(dataSize, constraints, priorities, timeLimit);

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    logger.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while generating recommendations'
    });
  }
});

/**
 * Helper function to validate algorithm parameters
 */
function validateAlgorithmParameters(algorithm, parameters) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: []
  };

  // Define parameter constraints for each algorithm
  const parameterConstraints = {
    genetic: {
      populationSize: { min: 20, max: 500, type: 'integer' },
      maxGenerations: { min: 100, max: 5000, type: 'integer' },
      crossoverRate: { min: 0.1, max: 1.0, type: 'float' },
      mutationRate: { min: 0.01, max: 0.5, type: 'float' },
      eliteSize: { min: 1, max: 50, type: 'integer' },
      tournamentSize: { min: 2, max: 20, type: 'integer' }
    },
    csp: {
      maxBacktrackingSteps: { min: 1000, max: 100000, type: 'integer' },
      variableOrdering: { options: ['MRV', 'LCV', 'Random'], type: 'string' },
      valueOrdering: { options: ['LCV', 'Random'], type: 'string' },
      arcConsistency: { type: 'boolean' },
      forwardChecking: { type: 'boolean' }
    },
    simulated_annealing: {
      initialTemperature: { min: 100.0, max: 10000.0, type: 'float' },
      coolingRate: { min: 0.9, max: 0.999, type: 'float' },
      maxIterations: { min: 1000, max: 100000, type: 'integer' },
      minTemperature: { min: 0.01, max: 10.0, type: 'float' }
    }
  };

  const constraints = parameterConstraints[algorithm];
  if (!constraints) {
    validation.errors.push(`Unknown algorithm: ${algorithm}`);
    validation.isValid = false;
    return validation;
  }

  // Validate each parameter
  for (const [param, value] of Object.entries(parameters)) {
    const constraint = constraints[param];
    if (!constraint) {
      validation.warnings.push(`Unknown parameter: ${param}`);
      continue;
    }

    // Type validation
    if (constraint.type === 'integer' && !Number.isInteger(value)) {
      validation.errors.push(`Parameter ${param} must be an integer`);
      validation.isValid = false;
    } else if (constraint.type === 'float' && typeof value !== 'number') {
      validation.errors.push(`Parameter ${param} must be a number`);
      validation.isValid = false;
    } else if (constraint.type === 'boolean' && typeof value !== 'boolean') {
      validation.errors.push(`Parameter ${param} must be a boolean`);
      validation.isValid = false;
    } else if (constraint.type === 'string' && typeof value !== 'string') {
      validation.errors.push(`Parameter ${param} must be a string`);
      validation.isValid = false;
    }

    // Range validation
    if (constraint.min !== undefined && value < constraint.min) {
      validation.errors.push(`Parameter ${param} must be at least ${constraint.min}`);
      validation.isValid = false;
    }
    if (constraint.max !== undefined && value > constraint.max) {
      validation.errors.push(`Parameter ${param} must be at most ${constraint.max}`);
      validation.isValid = false;
    }

    // Options validation
    if (constraint.options && !constraint.options.includes(value)) {
      validation.errors.push(`Parameter ${param} must be one of: ${constraint.options.join(', ')}`);
      validation.isValid = false;
    }
  }

  // Add algorithm-specific recommendations
  if (algorithm === 'genetic') {
    if (parameters.populationSize < 50) {
      validation.recommendations.push('Consider increasing population size for better convergence');
    }
    if (parameters.mutationRate > 0.2) {
      validation.warnings.push('High mutation rate may slow convergence');
    }
  }

  return validation;
}

/**
 * Helper function to generate general algorithm recommendations
 */
function generateAlgorithmRecommendations() {
  return {
    beginners: {
      recommended: 'csp',
      reason: 'CSP provides reliable results with minimal parameter tuning'
    },
    largeDdatasets: {
      recommended: 'genetic',
      reason: 'Genetic algorithms scale well with problem complexity'
    },
    qualityFocused: {
      recommended: 'hybrid',
      reason: 'Hybrid approach provides the best solution quality'
    },
    timeCritical: {
      recommended: 'backtracking',
      reason: 'Backtracking is fastest for simple problems'
    },
    general: {
      recommended: 'hybrid',
      reason: 'Best overall performance across different problem types'
    }
  };
}

/**
 * Helper function to generate algorithm recommendations for specific problems
 */
function generateAlgorithmRecommendationsForProblem(dataSize, constraints, priorities, timeLimit) {
  const { teachers, classrooms, courses } = dataSize;
  const problemComplexity = teachers * classrooms * courses;

  const recommendations = [];

  // Size-based recommendations
  if (problemComplexity < 1000) {
    recommendations.push({
      algorithm: 'csp',
      score: 9.0,
      reason: 'Small problem size - CSP will find optimal solution quickly',
      estimatedTime: '1-3 minutes',
      confidence: 'high'
    });
    recommendations.push({
      algorithm: 'backtracking',
      score: 8.5,
      reason: 'Simple and fast for small problems',
      estimatedTime: '30 seconds - 1 minute',
      confidence: 'high'
    });
  } else if (problemComplexity < 10000) {
    recommendations.push({
      algorithm: 'hybrid',
      score: 9.5,
      reason: 'Medium problem size - hybrid approach provides best balance',
      estimatedTime: '5-15 minutes',
      confidence: 'high'
    });
    recommendations.push({
      algorithm: 'genetic',
      score: 9.0,
      reason: 'Good optimization capabilities for medium complexity',
      estimatedTime: '8-20 minutes',
      confidence: 'medium'
    });
  } else {
    recommendations.push({
      algorithm: 'genetic',
      score: 9.0,
      reason: 'Large problem size - genetic algorithm handles complexity well',
      estimatedTime: '15-45 minutes',
      confidence: 'medium'
    });
    recommendations.push({
      algorithm: 'hybrid',
      score: 8.5,
      reason: 'Complex problems benefit from hybrid approach',
      estimatedTime: '20-60 minutes',
      confidence: 'medium'
    });
  }

  // Time constraint considerations
  if (timeLimit < 300) { // Less than 5 minutes
    recommendations.forEach(rec => {
      if (rec.algorithm === 'genetic' || rec.algorithm === 'hybrid') {
        rec.score -= 2.0;
        rec.warnings = ['Time limit may be too short for this algorithm'];
      }
    });
  }

  // Sort by score
  recommendations.sort((a, b) => b.score - a.score);

  return {
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
    problemAnalysis: {
      complexity: problemComplexity < 1000 ? 'Low' : problemComplexity < 10000 ? 'Medium' : 'High',
      estimatedOptimalAlgorithm: recommendations[0]?.algorithm,
      considerations: generateConsiderations(dataSize, constraints, timeLimit)
    }
  };
}

/**
 * Helper function to generate problem-specific considerations
 */
function generateConsiderations(dataSize, constraints, timeLimit) {
  const considerations = [];

  if (dataSize.teachers > dataSize.classrooms * 1.5) {
    considerations.push('High teacher-to-room ratio may require extended hours or parallel sessions');
  }

  if (dataSize.courses > dataSize.teachers * 3) {
    considerations.push('High course-to-teacher ratio may require teachers to handle multiple courses');
  }

  if (timeLimit < 600) {
    considerations.push('Short time limit may compromise solution quality');
  }

  if (constraints.length > 10) {
    considerations.push('Many constraints may increase generation time');
  }

  return considerations;
}

module.exports = router;
