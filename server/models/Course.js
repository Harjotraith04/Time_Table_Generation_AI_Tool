import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  // Basic Information
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Academic Information
  school: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
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
  
  // Course Type and Classification
  courseType: {
    type: String,
    enum: ['core', 'elective', 'open_elective', 'department_elective', 'audit'],
    required: true,
    default: 'core'
  },
  category: {
    type: String,
    enum: ['theory', 'practical', 'tutorial', 'project', 'seminar'],
    required: true
  },
  
  // Credit and Hours Information
  credits: {
    theory: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    practical: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    tutorial: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    total: {
      type: Number,
      required: true,
      min: 1,
      max: 30
    }
  },
  
  // Weekly Schedule Requirements
  weeklySchedule: {
    theoryHours: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },
    practicalHours: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },
    tutorialHours: {
      type: Number,
      required: true,
      min: 0,
      max: 20
    },
    totalHours: {
      type: Number,
      required: true,
      min: 1,
      max: 40
    }
  },
  
  // Batching Information
  batching: {
    isRequired: {
      type: Boolean,
      default: false
    },
    batchSize: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    maxBatches: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },
    batchType: {
      type: String,
      enum: ['fixed', 'dynamic', 'flexible'],
      default: 'fixed'
    }
  },
  
  // Prerequisites and Dependencies
  prerequisites: [{
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
    isRequired: {
      type: Boolean,
      default: true
    }
  }],
  
  // Faculty Assignment
  assignedFaculty: [{
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    role: {
      type: String,
      enum: ['primary', 'secondary', 'lab_instructor', 'tutorial_instructor'],
      default: 'primary'
    },
    hoursAllocated: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  
  // Student Information
  enrolledStudents: {
    totalCount: {
      type: Number,
      default: 0,
      min: 0
    },
    divisions: [{
      divisionName: {
        type: String,
        required: true,
        trim: true
      },
      studentCount: {
        type: Number,
        required: true,
        min: 1
      },
      batches: [{
        batchName: {
          type: String,
          required: true,
          trim: true
        },
        studentCount: {
          type: Number,
          required: true,
          min: 1
        }
      }]
    }]
  },
  
  // Scheduling Constraints
  schedulingConstraints: {
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    preferredTimeSlots: [{
      startTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }],
    restrictedDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    restrictedTimeSlots: [{
      startTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }],
    consecutiveHours: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    },
    requiresBreak: {
      type: Boolean,
      default: false
    }
  },
  
  // Room Requirements
  roomRequirements: {
    roomType: {
      type: String,
      enum: ['lecture', 'lab', 'computer', 'tutorial', 'seminar', 'auditorium'],
      required: true
    },
    minCapacity: {
      type: Number,
      required: true,
      min: 1
    },
    preferredFeatures: [{
      type: String,
      trim: true
    }],
    requiredEquipment: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
    }]
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
courseSchema.index({ courseCode: 1 });
courseSchema.index({ school: 1, program: 1 });
courseSchema.index({ academicYear: 1, semester: 1 });
courseSchema.index({ courseType: 1 });
courseSchema.index({ 'assignedFaculty.teacherId': 1 });

// Virtual for total credits
courseSchema.virtual('totalCredits').get(function() {
  return this.credits.theory + this.credits.practical + this.credits.tutorial;
});

// Virtual for total weekly hours
courseSchema.virtual('totalWeeklyHours').get(function() {
  return this.weeklySchedule.theoryHours + this.weeklySchedule.practicalHours + this.weeklySchedule.tutorialHours;
});

// Pre-save middleware
courseSchema.pre('save', function(next) {
  // Validate total credits match
  if (this.credits.total !== this.totalCredits) {
    this.credits.total = this.totalCredits;
  }
  
  // Validate total weekly hours match
  if (this.weeklySchedule.totalHours !== this.totalWeeklyHours) {
    this.weeklySchedule.totalHours = this.totalWeeklyHours;
  }
  
  next();
});

// Static methods
courseSchema.statics.findByProgram = function(program, academicYear, semester) {
  return this.find({
    program: program,
    academicYear: academicYear,
    semester: semester,
    isActive: true
  });
};

courseSchema.statics.findByFaculty = function(teacherId) {
  return this.find({
    'assignedFaculty.teacherId': teacherId,
    isActive: true
  });
};

courseSchema.statics.findByType = function(courseType) {
  return this.find({
    courseType: courseType,
    isActive: true
  });
};

// Instance methods
courseSchema.methods.canBeScheduledOn = function(day) {
  if (this.schedulingConstraints.restrictedDays.includes(day)) {
    return false;
  }
  
  if (this.schedulingConstraints.preferredDays.length > 0) {
    return this.schedulingConstraints.preferredDays.includes(day);
  }
  
  return true;
};

courseSchema.methods.canBeScheduledAt = function(startTime, endTime) {
  const hasRestrictedTime = this.schedulingConstraints.restrictedTimeSlots.some(slot => {
    const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
    const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);
    const requestedStart = new Date(`2000-01-01 ${startTime}`);
    const requestedEnd = new Date(`2000-01-01 ${endTime}`);
    
    return (requestedStart < slotEnd && requestedEnd > slotStart);
  });
  
  if (hasRestrictedTime) return false;
  
  const hasPreferredTime = this.schedulingConstraints.preferredTimeSlots.some(slot => {
    const slotStart = new Date(`2000-01-01 ${slot.startTime}`);
    const slotEnd = new Date(`2000-01-01 ${slot.endTime}`);
    const requestedStart = new Date(`2000-01-01 ${startTime}`);
    const requestedEnd = new Date(`2000-01-01 ${endTime}`);
    
    return (requestedStart >= slotStart && requestedEnd <= slotEnd);
  });
  
  return hasPreferredTime || this.schedulingConstraints.preferredTimeSlots.length === 0;
};

courseSchema.methods.getRequiredRoomCapacity = function() {
  let maxCapacity = 0;
  
  this.enrolledStudents.divisions.forEach(division => {
    division.batches.forEach(batch => {
      maxCapacity = Math.max(maxCapacity, batch.studentCount);
    });
  });
  
  return maxCapacity;
};

courseSchema.methods.isElective = function() {
  return ['elective', 'open_elective', 'department_elective'].includes(this.courseType);
};

const Course = mongoose.model('Course', courseSchema);

export default Course;
