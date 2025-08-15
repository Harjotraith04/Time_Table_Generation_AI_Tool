import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  // Basic Information
  teacherId: {
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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Teacher Type
  teacherType: {
    type: String,
    enum: ['core', 'visiting'],
    required: true,
    default: 'core'
  },
  
  // Academic Information
  school: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  
  // Teaching Assignments
  subjects: [{
    subjectCode: {
      type: String,
      required: true,
      trim: true
    },
    subjectName: {
      type: String,
      required: true,
      trim: true
    },
    subjectType: {
      type: String,
      enum: ['theory', 'tutorial', 'lab', 'practical'],
      required: true
    },
    hoursPerWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 40
    }
  }],
  
  // Workload Constraints
  maxHoursPerWeek: {
    type: Number,
    required: true,
    default: 40,
    min: 1,
    max: 60
  },
  currentHoursPerWeek: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Academic Period Assignment
  academicYears: [{
    year: {
      type: String,
      required: true,
      trim: true
    },
    semesters: [{
      type: String,
      enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'],
      required: true
    }]
  }],
  
  // Availability & Constraints
  availability: {
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }],
    timeSlots: [{
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
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    unavailableSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      reason: {
        type: String,
        trim: true
      }
    }]
  },
  
  // Priority Settings
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ school: 1, department: 1 });
teacherSchema.index({ teacherType: 1 });
teacherSchema.index({ 'subjects.subjectCode': 1 });

// Virtual for total hours
teacherSchema.virtual('totalHoursPerWeek').get(function() {
  return this.subjects.reduce((total, subject) => total + subject.hoursPerWeek, 0);
});

// Virtual for remaining hours
teacherSchema.virtual('remainingHoursPerWeek').get(function() {
  return this.maxHoursPerWeek - this.currentHoursPerWeek;
});

// Pre-save middleware
teacherSchema.pre('save', function(next) {
  // Update current hours based on subjects
  this.currentHoursPerWeek = this.totalHoursPerWeek;
  next();
});

// Static methods
teacherSchema.statics.findBySubject = function(subjectCode) {
  return this.find({ 'subjects.subjectCode': subjectCode });
};

teacherSchema.statics.findBySchool = function(school) {
  return this.find({ school: school });
};

teacherSchema.statics.findAvailableTeachers = function(day, startTime, endTime) {
  return this.find({
    isActive: true,
    'availability.workingDays': day,
    'availability.timeSlots': {
      $elemMatch: {
        day: day,
        startTime: { $lte: startTime },
        endTime: { $gte: endTime },
        isAvailable: true
      }
    }
  });
};

// Instance methods
teacherSchema.methods.isAvailableAt = function(day, startTime, endTime) {
  const dayAvailability = this.availability.timeSlots.find(
    slot => slot.day === day && slot.isAvailable
  );
  
  if (!dayAvailability) return false;
  
  const slotStart = new Date(`2000-01-01 ${dayAvailability.startTime}`);
  const slotEnd = new Date(`2000-01-01 ${dayAvailability.endTime}`);
  const requestedStart = new Date(`2000-01-01 ${startTime}`);
  const requestedEnd = new Date(`2000-01-01 ${endTime}`);
  
  return slotStart <= requestedStart && slotEnd >= requestedEnd;
};

teacherSchema.methods.canTeachSubject = function(subjectCode, subjectType) {
  return this.subjects.some(subject => 
    subject.subjectCode === subjectCode && 
    subject.subjectType === subjectType
  );
};

teacherSchema.methods.hasCapacity = function(additionalHours = 0) {
  return (this.currentHoursPerWeek + additionalHours) <= this.maxHoursPerWeek;
};

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
