import express from 'express';
import { HybridAdvancedTimetableGenerator } from '../algorithms/HybridAdvancedTimetableGenerator.js';

const router = express.Router();

/**
 * Get available algorithms
 */
router.get('/algorithms', (req, res) => {
  res.json({
    algorithms: [
      {
        id: 'genetic',
        name: 'Genetic Algorithm',
        description: 'Evolutionary algorithm that evolves solutions over generations',
        pros: [
          'Excellent for complex constraint problems',
          'Can find near-optimal solutions',
          'Handles large datasets well',
          'Good at avoiding local optima'
        ],
        cons: [
          'Longer computation time',
          'May require parameter tuning',
          'Results may vary between runs'
        ],
        parameters: {
          populationSize: {
            default: 100,
            min: 20,
            max: 500,
            description: 'Number of individuals in each generation'
          },
          maxGenerations: {
            default: 1000,
            min: 100,
            max: 5000,
            description: 'Maximum number of generations to evolve'
          },
          crossoverRate: {
            default: 0.8,
            min: 0.1,
            max: 1.0,
            description: 'Probability of crossover between parents'
          },
          mutationRate: {
            default: 0.1,
            min: 0.01,
            max: 0.5,
            description: 'Probability of mutation in offspring'
          },
          targetFitness: {
            default: 0.95,
            min: 0.5,
            max: 1.0,
            description: 'Target fitness to stop evolution early'
          }
        },
        estimatedTime: '2-5 minutes',
        complexity: 'high',
        recommended: true
      },
      {
        id: 'backtracking',
        name: 'Backtracking Algorithm',
        description: 'Systematic search algorithm that explores all possibilities',
        pros: [
          'Guaranteed to find solution if exists',
          'Fast for smaller datasets',
          'Deterministic results'
        ],
        cons: [
          'May be slow for large datasets',
          'Can get stuck with complex constraints',
          'Limited optimization capability'
        ],
        parameters: {
          maxDepth: {
            default: 1000,
            min: 100,
            max: 10000,
            description: 'Maximum search depth'
          },
          timeout: {
            default: 300,
            min: 60,
            max: 1800,
            description: 'Maximum time in seconds'
          }
        },
        estimatedTime: '30 seconds - 2 minutes',
        complexity: 'medium',
        recommended: false
      },
      {
        id: 'hybrid_advanced',
        name: 'Hybrid Advanced Algorithm',
        description: 'State-of-the-art hybrid algorithm combining CSP, Simulated Annealing, and Tabu Search',
        pros: [
          'Handles complex constraints (core/elective subjects)',
          'Supports batch scheduling and parallel sessions',
          'Advanced constraint satisfaction techniques',
          'Multi-objective optimization',
          'Excellent for large-scale timetabling',
          'Deterministic core subject scheduling'
        ],
        cons: [
          'Longer computation time for very large datasets',
          'More complex parameter tuning',
          'Requires more memory'
        ],
        parameters: {
          maxIterations: {
            default: 10000,
            min: 1000,
            max: 50000,
            description: 'Maximum iterations for optimization'
          },
          initialTemperature: {
            default: 1000,
            min: 100,
            max: 5000,
            description: 'Initial temperature for simulated annealing'
          },
          coolingRate: {
            default: 0.95,
            min: 0.8,
            max: 0.99,
            description: 'Temperature cooling rate'
          },
          tabuListSize: {
            default: 50,
            min: 10,
            max: 200,
            description: 'Size of tabu list for forbidden moves'
          },
          domainFilteringStrength: {
            default: 0.8,
            min: 0.1,
            max: 1.0,
            description: 'Strength of domain filtering in CSP'
          }
        },
        estimatedTime: '3-10 minutes',
        complexity: 'very high',
        recommended: true
      },
      {
        id: 'simulated_annealing',
        name: 'Simulated Annealing',
        description: 'Probabilistic optimization technique inspired by metallurgy',
        pros: [
          'Good balance of speed and quality',
          'Can escape local optima',
          'Flexible and adaptable'
        ],
        cons: [
          'Requires careful parameter tuning',
          'Results may vary',
          'May not find global optimum'
        ],
        parameters: {
          initialTemperature: {
            default: 1000,
            min: 100,
            max: 10000,
            description: 'Starting temperature for annealing'
          },
          coolingRate: {
            default: 0.95,
            min: 0.8,
            max: 0.99,
            description: 'Rate of temperature reduction'
          },
          minTemperature: {
            default: 1,
            min: 0.1,
            max: 10,
            description: 'Minimum temperature to stop'
          },
          maxIterations: {
            default: 10000,
            min: 1000,
            max: 50000,
            description: 'Maximum iterations per temperature'
          }
        },
        estimatedTime: '1-3 minutes',
        complexity: 'medium',
        recommended: false
      }
    ]
  });
});

/**
 * Get constraint types and descriptions
 */
router.get('/constraints', (req, res) => {
  res.json({
    constraints: [
      {
        id: 'teacher_conflicts',
        name: 'Teacher Conflicts',
        description: 'Prevent teachers from being assigned to multiple classes at the same time',
        type: 'hard',
        weight: 10,
        mandatory: true
      },
      {
        id: 'classroom_conflicts',
        name: 'Classroom Conflicts',
        description: 'Prevent multiple classes from being assigned to the same room at the same time',
        type: 'hard',
        weight: 10,
        mandatory: true
      },
      {
        id: 'student_conflicts',
        name: 'Student Group Conflicts',
        description: 'Prevent student groups from having multiple classes at the same time',
        type: 'hard',
        weight: 8,
        mandatory: true
      },
      {
        id: 'room_capacity',
        name: 'Room Capacity',
        description: 'Ensure classroom capacity is sufficient for the number of students',
        type: 'hard',
        weight: 5,
        mandatory: true
      },
      {
        id: 'teacher_availability',
        name: 'Teacher Availability',
        description: 'Respect teacher availability and preferred time slots',
        type: 'soft',
        weight: 3,
        mandatory: false
      },
      {
        id: 'workload_balance',
        name: 'Workload Balance',
        description: 'Distribute teaching hours evenly among teachers',
        type: 'soft',
        weight: 2,
        mandatory: false
      },
      {
        id: 'consecutive_hours',
        name: 'Consecutive Hours Limit',
        description: 'Limit the number of consecutive teaching hours for teachers',
        type: 'soft',
        weight: 1,
        mandatory: false
      },
      {
        id: 'break_enforcement',
        name: 'Break Enforcement',
        description: 'Ensure mandatory breaks are respected',
        type: 'hard',
        weight: 4,
        mandatory: true
      },
      {
        id: 'room_type_matching',
        name: 'Room Type Matching',
        description: 'Match course requirements with appropriate room types',
        type: 'soft',
        weight: 3,
        mandatory: false
      },
      {
        id: 'day_distribution',
        name: 'Day Distribution',
        description: 'Distribute classes evenly across working days',
        type: 'soft',
        weight: 1,
        mandatory: false
      }
    ]
  });
});

/**
 * Get optimization goals
 */
router.get('/optimization-goals', (req, res) => {
  res.json({
    goals: [
      {
        id: 'minimize_conflicts',
        name: 'Minimize Conflicts',
        description: 'Reduce all types of scheduling conflicts to minimum',
        priority: 'high',
        weight: 10
      },
      {
        id: 'balanced_schedule',
        name: 'Balanced Schedule',
        description: 'Distribute classes evenly across time slots and days',
        priority: 'medium',
        weight: 5
      },
      {
        id: 'teacher_preferences',
        name: 'Teacher Preferences',
        description: 'Maximize adherence to teacher availability and preferences',
        priority: 'medium',
        weight: 4
      },
      {
        id: 'resource_optimization',
        name: 'Resource Optimization',
        description: 'Optimize utilization of classrooms and facilities',
        priority: 'medium',
        weight: 3
      },
      {
        id: 'student_convenience',
        name: 'Student Convenience',
        description: 'Minimize gaps and optimize student schedules',
        priority: 'low',
        weight: 2
      },
      {
        id: 'travel_time',
        name: 'Minimize Travel Time',
        description: 'Reduce travel time between different buildings/floors',
        priority: 'low',
        weight: 1
      }
    ]
  });
});

/**
 * Validate algorithm parameters
 */
router.post('/validate-parameters', (req, res) => {
  try {
    const { algorithm, parameters } = req.body;
    
    if (!algorithm) {
      return res.status(400).json({
        error: 'Algorithm not specified'
      });
    }

    const algorithmDefinitions = {
      genetic: {
        populationSize: { min: 20, max: 500, type: 'number' },
        maxGenerations: { min: 100, max: 5000, type: 'number' },
        crossoverRate: { min: 0.1, max: 1.0, type: 'number' },
        mutationRate: { min: 0.01, max: 0.5, type: 'number' },
        targetFitness: { min: 0.5, max: 1.0, type: 'number' }
      },
      hybrid_advanced: {
        maxIterations: { min: 1000, max: 50000, type: 'number' },
        initialTemperature: { min: 100, max: 5000, type: 'number' },
        coolingRate: { min: 0.8, max: 0.99, type: 'number' },
        tabuListSize: { min: 10, max: 200, type: 'number' },
        domainFilteringStrength: { min: 0.1, max: 1.0, type: 'number' }
      },
      backtracking: {
        maxDepth: { min: 100, max: 10000, type: 'number' },
        timeout: { min: 60, max: 1800, type: 'number' }
      },
      simulated_annealing: {
        initialTemperature: { min: 100, max: 10000, type: 'number' },
        coolingRate: { min: 0.8, max: 0.99, type: 'number' },
        minTemperature: { min: 0.1, max: 10, type: 'number' },
        maxIterations: { min: 1000, max: 50000, type: 'number' }
      }
    };

    const algorithmParams = algorithmDefinitions[algorithm];
    if (!algorithmParams) {
      return res.status(400).json({
        error: 'Invalid algorithm',
        message: `Algorithm '${algorithm}' is not supported`
      });
    }

    const errors = [];
    const warnings = [];

    Object.entries(parameters || {}).forEach(([param, value]) => {
      const definition = algorithmParams[param];
      
      if (!definition) {
        warnings.push(`Unknown parameter '${param}' for algorithm '${algorithm}'`);
        return;
      }

      if (definition.type === 'number') {
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`Parameter '${param}' must be a number`);
          return;
        }

        if (value < definition.min || value > definition.max) {
          errors.push(`Parameter '${param}' must be between ${definition.min} and ${definition.max}`);
        }
      }
    });

    // Check for missing required parameters
    Object.keys(algorithmParams).forEach(param => {
      if (!(param in (parameters || {}))) {
        warnings.push(`Parameter '${param}' not specified, will use default value`);
      }
    });

    const isValid = errors.length === 0;

    res.json({
      valid: isValid,
      errors,
      warnings,
      algorithm,
      estimatedTime: getEstimatedTime(algorithm, parameters)
    });

  } catch (error) {
    console.error('Error validating parameters:', error);
    res.status(500).json({
      error: 'Failed to validate parameters',
      message: error.message
    });
  }
});

/**
 * Get estimated generation time
 */
function getEstimatedTime(algorithm, parameters = {}) {
  switch (algorithm) {
    case 'genetic':
      const popSize = parameters.populationSize || 100;
      const maxGen = parameters.maxGenerations || 1000;
      const estimatedSeconds = Math.ceil((popSize * maxGen) / 10000);
      return `${Math.max(30, estimatedSeconds)} seconds`;
    
    case 'hybrid_advanced':
      const maxIter = parameters.maxIterations || 10000;
      const estimatedAdvanced = Math.ceil(maxIter / 500) * 20; // More time due to complexity
      return `${Math.max(120, estimatedAdvanced)} seconds`;
    
    case 'backtracking':
      return '30-120 seconds';
    
    case 'simulated_annealing':
      const maxIterSA = parameters.maxIterations || 10000;
      const estimatedSA = Math.ceil(maxIterSA / 1000) * 10;
      return `${Math.max(30, estimatedSA)} seconds`;
    
    default:
      return 'Unknown';
  }
}

/**
 * Get algorithm recommendations based on data size
 */
router.post('/recommend', async (req, res) => {
  try {
    const { dataSize } = req.body;
    
    const recommendations = [];

    if (dataSize.courses <= 50 && dataSize.teachers <= 20 && dataSize.classrooms <= 30) {
      recommendations.push({
        algorithm: 'backtracking',
        reason: 'Small dataset - backtracking will be fast and find optimal solution',
        confidence: 'high',
        estimatedTime: '30-60 seconds'
      });
    }

    if (dataSize.courses >= 20) {
      recommendations.push({
        algorithm: 'hybrid_advanced',
        reason: 'Advanced algorithm ideal for complex constraints, core/elective subjects, and batch scheduling',
        confidence: 'high',
        estimatedTime: '3-10 minutes'
      });
    }

    if (dataSize.courses >= 30) {
      recommendations.push({
        algorithm: 'genetic',
        reason: 'Medium to large dataset - genetic algorithm handles complexity well',
        confidence: 'high',
        estimatedTime: '2-5 minutes'
      });
    }

    if (dataSize.courses >= 20 && dataSize.courses <= 100) {
      recommendations.push({
        algorithm: 'simulated_annealing',
        reason: 'Good balance of speed and optimization for medium datasets',
        confidence: 'medium',
        estimatedTime: '1-3 minutes'
      });
    }

    // Default to hybrid advanced algorithm if no specific recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        algorithm: 'hybrid_advanced',
        reason: 'Advanced algorithm suitable for complex timetabling scenarios',
        confidence: 'high',
        estimatedTime: '3-10 minutes'
      });
    }

    res.json({
      recommendations: recommendations.sort((a, b) => {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }),
      dataSize
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

export default router;
