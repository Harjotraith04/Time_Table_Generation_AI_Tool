const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 8000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable_generator',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'timetable-generator',
    audience: 'timetable-users'
  },

  // Client Configuration
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
    allowedOrigins: process.env.CORS_ORIGINS ? 
      process.env.CORS_ORIGINS.split(',') : 
      ['http://localhost:5173', 'http://localhost:3000']
  },

  // Algorithm Configuration
  algorithms: {
    default: process.env.DEFAULT_ALGORITHM || 'hybrid',
    maxGenerationTime: parseInt(process.env.MAX_GENERATION_TIME) || 3600000, // 1 hour
    defaultPopulationSize: parseInt(process.env.DEFAULT_POPULATION_SIZE) || 100,
    defaultMaxGenerations: parseInt(process.env.DEFAULT_MAX_GENERATIONS) || 1000,
    maxConcurrentGenerations: parseInt(process.env.MAX_CONCURRENT_GENERATIONS) || 5,
    enableParallelProcessing: process.env.ENABLE_PARALLEL_PROCESSING === 'true'
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? 
      process.env.ALLOWED_FILE_TYPES.split(',') : 
      ['text/csv', 'application/vnd.ms-excel'],
    destination: process.env.UPLOAD_DESTINATION || './uploads',
    tempDir: process.env.TEMP_DIR || './temp'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: process.env.FILE_LOGGING === 'true',
      filename: process.env.LOG_FILE || 'logs/app.log',
      maxSize: process.env.LOG_MAX_SIZE || '10m',
      maxFiles: process.env.LOG_MAX_FILES || '5'
    },
    console: {
      enabled: process.env.CONSOLE_LOGGING !== 'false',
      colorize: process.env.LOG_COLORIZE !== 'false'
    }
  },

  // Security Configuration
  security: {
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false',
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      }
    },
    cors: {
      credentials: true,
      optionsSuccessStatus: 200
    }
  },

  // Email Configuration (Optional)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    },
    from: process.env.FROM_EMAIL || 'noreply@timetablegenerator.com',
    templates: {
      welcome: 'welcome',
      timetableGenerated: 'timetable-generated',
      generationFailed: 'generation-failed'
    }
  },

  // Redis Configuration (Optional)
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    }
  },

  // Performance Configuration
  performance: {
    cluster: {
      enabled: process.env.CLUSTER_MODE === 'true',
      workers: process.env.WORKER_PROCESSES || 'auto'
    },
    compression: {
      enabled: process.env.COMPRESSION_ENABLED !== 'false',
      level: parseInt(process.env.COMPRESSION_LEVEL) || 6
    },
    cache: {
      enabled: process.env.CACHE_ENABLED === 'true',
      ttl: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
      maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100
    }
  },

  // Monitoring Configuration
  monitoring: {
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      endpoint: '/api/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
    },
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      endpoint: '/api/metrics',
      collectDefaultMetrics: true
    }
  },

  // Development Configuration
  development: {
    debug: process.env.DEBUG_MODE === 'true',
    apiDocs: process.env.ENABLE_API_DOCS !== 'false',
    mockData: process.env.ENABLE_MOCK_DATA === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true'
  },

  // Validation Configuration
  validation: {
    strictMode: process.env.VALIDATION_STRICT_MODE !== 'false',
    allowUnknownFields: process.env.ALLOW_UNKNOWN_FIELDS === 'true',
    stripUnknownFields: process.env.STRIP_UNKNOWN_FIELDS !== 'false'
  },

  // Timetable Specific Configuration
  timetable: {
    defaultSettings: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60, // minutes
      breakSlots: ['12:00-13:00'],
      enforceBreaks: true,
      balanceWorkload: true
    },
    constraints: {
      maxTeachersPerCourse: 5,
      maxCoursesPerTeacher: 10,
      maxStudentsPerClass: 200,
      minStudentsPerClass: 5,
      maxRoomCapacityOverflow: 0.1 // 10% overflow allowed
    },
    optimization: {
      maxOptimizationTime: 30 * 60 * 1000, // 30 minutes
      convergenceThreshold: 50,
      diversityThreshold: 0.1,
      fitnessWeights: {
        hardConstraints: 0.6,
        softConstraints: 0.2,
        optimization: 0.2
      }
    }
  }
};

// Environment-specific overrides
if (config.server.env === 'production') {
  config.logging.level = 'warn';
  config.development.debug = false;
  config.development.apiDocs = false;
  config.security.helmet.enabled = true;
}

if (config.server.env === 'test') {
  config.database.uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/timetable_generator_test';
  config.logging.level = 'error';
  config.rateLimit.max = 1000; // More lenient for testing
}

module.exports = config;
