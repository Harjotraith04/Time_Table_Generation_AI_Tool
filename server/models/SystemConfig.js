const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  // General Policies
  generalPolicies: {
    maxConsecutiveHours: {
      type: Number,
      default: 3,
      min: 2,
      max: 4
    },
    maxDailyHours: {
      type: Number,
      default: 8,
      min: 6,
      max: 10
    },
    minBreakBetweenSessions: {
      type: Number,
      default: 15,
      min: 10,
      max: 30
    },
    maxTeachingHoursPerDay: {
      type: Number,
      default: 6,
      min: 4,
      max: 8
    },
    preferredClassroomUtilization: {
      type: Number,
      default: 80,
      min: 60,
      max: 100
    },
    allowBackToBackLabs: {
      type: Boolean,
      default: false
    },
    prioritizeTeacherPreferences: {
      type: Boolean,
      default: true
    },
    allowSplitSessions: {
      type: Boolean,
      default: false
    },
    maxStudentsPerClass: {
      type: Number,
      default: 60,
      min: 30,
      max: 100
    },
    minRoomCapacityBuffer: {
      type: Number,
      default: 10,
      min: 5,
      max: 20
    },
    allowOverlappingLabs: {
      type: Boolean,
      default: false
    },
    prioritizeCoreBefore: {
      type: Boolean,
      default: true
    },
    avoidFirstLastPeriod: {
      type: Boolean,
      default: false
    },
    requireLabAssistant: {
      type: Boolean,
      default: true
    }
  },

  // Working Hours
  workingHours: {
    startTime: {
      type: String,
      default: '09:00',
      required: true
    },
    endTime: {
      type: String,
      default: '17:00',
      required: true
    },
    lunchBreakStart: {
      type: String,
      default: '12:30'
    },
    lunchBreakEnd: {
      type: String,
      default: '13:30'
    },
    periodDuration: {
      type: Number,
      default: 50,
      min: 40,
      max: 60
    },
    breakDuration: {
      type: Number,
      default: 10,
      min: 5,
      max: 15
    },
    labPeriodDuration: {
      type: Number,
      default: 120,
      min: 90,
      max: 180
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    maxPeriodsPerDay: {
      type: Number,
      default: 8,
      min: 6,
      max: 10
    },
    earlyMorningStart: {
      type: String,
      default: '08:00'
    },
    eveningEndTime: {
      type: String,
      default: '18:00'
    }
  },

  // Academic Calendar
  academicCalendar: {
    academicYearStart: {
      type: Date,
      required: true
    },
    academicYearEnd: {
      type: Date,
      required: true
    },
    semester1Start: {
      type: Date,
      required: true
    },
    semester1End: {
      type: Date,
      required: true
    },
    semester2Start: {
      type: Date,
      required: true
    },
    semester2End: {
      type: Date,
      required: true
    },
    totalWeeks: {
      type: Number,
      default: 16,
      min: 12,
      max: 20
    },
    examWeeks: {
      type: Number,
      default: 2,
      min: 1,
      max: 4
    },
    vacationWeeks: {
      type: Number,
      default: 4,
      min: 2,
      max: 8
    }
  },

  // Constraint Rules
  constraintRules: {
    minGapBetweenExams: {
      type: Number,
      default: 2,
      min: 1,
      max: 7
    },
    maxSubjectsPerDay: {
      type: Number,
      default: 6,
      min: 4,
      max: 8
    },
    preferMorningLabs: {
      type: Boolean,
      default: true
    },
    avoidFridayAfternoon: {
      type: Boolean,
      default: true
    },
    balanceWorkload: {
      type: Boolean,
      default: true
    },
    groupSimilarSubjects: {
      type: Boolean,
      default: false
    },
    maintainTeacherContinuity: {
      type: Boolean,
      default: true
    },
    prioritizePopularSlots: {
      type: Boolean,
      default: false
    }
  },

  // Metadata
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active configuration exists
systemConfigSchema.index({ isActive: 1 });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
