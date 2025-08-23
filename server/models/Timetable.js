import mongoose from 'mongoose';

const timetableEntrySchema = new mongoose.Schema({
  // Course Information
  courseCode: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  subjectType: {
    type: String,
    enum: ['theory', 'practical', 'tutorial', 'lab'],
    required: true
  },
  
  // Faculty Information
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  teacherName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Room Information
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Time and Day Information
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  
  // Batch Information
  batch: {
    type: String,
    trim: true
  },
  division: {
    type: String,
    trim: true
  },
  
  // Duration
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  }
}, {
  _id: false,
  timestamps: false
});

const timetableSchema = new mongoose.Schema({
  // Basic Information
  timetableId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Academic Information
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
    required: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  school: {
    type: String,
    required: true,
    trim: true
  },
  
  // Timetable Scope
  scope: {
    type: String,
    enum: ['class', 'teacher', 'room', 'division', 'batch'],
    required: true
  },
  targetId: {
    type: String,
    required: true,
    trim: true
  },
  
  // Schedule Configuration
  scheduleConfig: {
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }],
    workingHours: {
      startTime: {
        type: String,
        required: true,
        default: '09:00',
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        default: '17:00',
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      isBreak: {
        type: Boolean,
        default: false
      },
      breakType: {
        type: String,
        enum: ['short', 'lunch', 'long'],
        default: 'short'
      }
    }]
  },
  
  // Timetable Entries
  entries: [timetableEntrySchema],
  
  // Generation Information
  generationInfo: {
    algorithm: {
      type: String,
      required: true,
      trim: true
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    iterations: {
      type: Number,
      default: 0
    },
    fitnessScore: {
      type: Number,
      default: 0
    },
    constraintViolations: {
      hard: {
        type: Number,
        default: 0
      },
      soft: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Validation Results
  validation: {
    isValid: {
      type: Boolean,
      default: false
    },
    errors: [{
      type: {
        type: String,
        enum: ['hard_constraint', 'soft_constraint', 'warning'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      entry: {
        type: mongoose.Schema.Types.Mixed
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      }
    }],
    warnings: [{
      type: String,
      trim: true
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'generating', 'generated', 'validated', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
timetableSchema.index({ timetableId: 1 });
timetableSchema.index({ academicYear: 1, semester: 1, program: 1 });
timetableSchema.index({ scope: 1, targetId: 1 });
timetableSchema.index({ status: 1 });
timetableSchema.index({ 'entries.day': 1, 'entries.startTime': 1 });
timetableSchema.index({ 'entries.teacherId': 1 });
timetableSchema.index({ 'entries.roomId': 1 });

// Virtual for total entries
timetableSchema.virtual('totalEntries').get(function() {
  return this.entries.length;
});

// Virtual for total hours
timetableSchema.virtual('totalHours').get(function() {
  return this.entries.reduce((total, entry) => total + entry.duration, 0);
});

// Virtual for generation duration
timetableSchema.virtual('generationDuration').get(function() {
  if (this.generationInfo.startTime && this.generationInfo.endTime) {
    return this.generationInfo.endTime - this.generationInfo.startTime;
  }
  return null;
});

// Pre-save middleware
timetableSchema.pre('save', function(next) {
  // Generate timetable ID if not provided
  if (!this.timetableId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.timetableId = `TT_${this.academicYear}_${this.semester}_${this.program}_${timestamp}_${random}`.toUpperCase();
  }
  
  // Update generation end time if status is generated
  if (this.status === 'generated' && !this.generationInfo.endTime) {
    this.generationInfo.endTime = new Date();
  }
  
  next();
});

// Static methods
timetableSchema.statics.findByProgram = function(program, academicYear, semester) {
  return this.find({
    program: program,
    academicYear: academicYear,
    semester: semester
  });
};

timetableSchema.statics.findByTeacher = function(teacherId) {
  return this.find({
    'entries.teacherId': teacherId
  });
};

timetableSchema.statics.findByRoom = function(roomId) {
  return this.find({
    'entries.roomId': roomId
  });
};

timetableSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Instance methods
timetableSchema.methods.getEntriesByDay = function(day) {
  return this.entries.filter(entry => entry.day === day);
};

timetableSchema.methods.getEntriesByTeacher = function(teacherId) {
  return this.entries.filter(entry => entry.teacherId.toString() === teacherId.toString());
};

timetableSchema.methods.getEntriesByRoom = function(roomId) {
  return this.entries.filter(entry => entry.roomId.toString() === roomId.toString());
};

timetableSchema.methods.getEntriesByTime = function(day, startTime, endTime) {
  return this.entries.filter(entry => {
    if (entry.day !== day) return false;
    
    const entryStart = new Date(`2000-01-01 ${entry.startTime}`);
    const entryEnd = new Date(`2000-01-01 ${entry.endTime}`);
    const requestedStart = new Date(`2000-01-01 ${startTime}`);
    const requestedEnd = new Date(`2000-01-01 ${endTime}`);
    
    return (entryStart < requestedEnd && entryEnd > requestedStart);
  });
};

timetableSchema.methods.hasConflict = function(day, startTime, endTime, excludeEntryId = null) {
  const conflictingEntries = this.getEntriesByTime(day, startTime, endTime);
  
  if (excludeEntryId) {
    return conflictingEntries.some(entry => entry._id !== excludeEntryId);
  }
  
  return conflictingEntries.length > 0;
};

timetableSchema.methods.validateConstraints = function() {
  const errors = [];
  const warnings = [];
  
  // Check for teacher conflicts
  const teacherSchedules = {};
  this.entries.forEach(entry => {
    const key = `${entry.teacherId}_${entry.day}_${entry.startTime}`;
    if (teacherSchedules[key]) {
      errors.push({
        type: 'hard_constraint',
        message: `Teacher ${entry.teacherName} has conflicting schedule on ${entry.day} at ${entry.startTime}`,
        entry: entry,
        severity: 'critical'
      });
    } else {
      teacherSchedules[key] = entry;
    }
  });
  
  // Check for room conflicts
  const roomSchedules = {};
  this.entries.forEach(entry => {
    const key = `${entry.roomId}_${entry.day}_${entry.startTime}`;
    if (roomSchedules[key]) {
      errors.push({
        type: 'hard_constraint',
        message: `Room ${entry.roomName} has conflicting schedule on ${entry.day} at ${entry.startTime}`,
        entry: entry,
        severity: 'critical'
      });
    } else {
      roomSchedules[key] = entry;
    }
  });
  
  // Check for consecutive hours without breaks
  const consecutiveHours = {};
  this.entries.forEach(entry => {
    const key = `${entry.teacherId}_${entry.day}`;
    if (!consecutiveHours[key]) {
      consecutiveHours[key] = [];
    }
    consecutiveHours[key].push(entry);
  });
  
  Object.values(consecutiveHours).forEach(dayEntries => {
    dayEntries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    for (let i = 0; i < dayEntries.length - 1; i++) {
      const current = dayEntries[i];
      const next = dayEntries[i + 1];
      
      if (current.endTime === next.startTime) {
        warnings.push({
          type: 'warning',
          message: `Teacher ${current.teacherName} has consecutive classes without break on ${current.day}`,
          entry: current,
          severity: 'medium'
        });
      }
    }
  });
  
  this.validation.errors = errors;
  this.validation.warnings = warnings;
  this.validation.isValid = errors.length === 0;
  
  return {
    isValid: this.validation.isValid,
    errors: errors,
    warnings: warnings
  };
};

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
