import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  // Basic Information
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Location Information
  building: {
    type: String,
    required: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  wing: {
    type: String,
    trim: true
  },
  
  // Capacity and Type
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  roomType: {
    type: String,
    enum: ['lecture', 'lab', 'computer', 'tutorial', 'seminar', 'auditorium'],
    required: true
  },
  
  // Equipment and Facilities
  equipment: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    isWorking: {
      type: Boolean,
      default: true
    }
  }],
  
  // Special Requirements
  specialRequirements: [{
    type: String,
    trim: true
  }],
  
  // Availability and Constraints
  availability: {
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
    maintenanceSlots: [{
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
  
  // Room Features
  features: {
    hasProjector: {
      type: Boolean,
      default: false
    },
    hasWhiteboard: {
      type: Boolean,
      default: true
    },
    hasAirConditioning: {
      type: Boolean,
      default: false
    },
    hasWheelchairAccess: {
      type: Boolean,
      default: false
    },
    hasInternet: {
      type: Boolean,
      default: false
    },
    hasSoundSystem: {
      type: Boolean,
      default: false
    }
  },
  
  // Scheduling Constraints
  schedulingConstraints: {
    maxConsecutiveHours: {
      type: Number,
      default: 4,
      min: 1,
      max: 8
    },
    requiresBreakAfter: {
      type: Number,
      default: 2,
      min: 0,
      max: 4
    },
    preferredSubjects: [{
      type: String,
      trim: true
    }],
    restrictedSubjects: [{
      type: String,
      trim: true
    }]
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isUnderMaintenance: {
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
classroomSchema.index({ roomId: 1 });
classroomSchema.index({ building: 1, floor: 1 });
classroomSchema.index({ roomType: 1 });
classroomSchema.index({ capacity: 1 });
classroomSchema.index({ 'availability.workingDays': 1 });

// Virtual for room identifier
classroomSchema.virtual('fullRoomId').get(function() {
  return `${this.building}-${this.floor}-${this.roomId}`;
});

// Virtual for availability status
classroomSchema.virtual('isAvailable').get(function() {
  return this.isActive && !this.isUnderMaintenance;
});

// Pre-save middleware
classroomSchema.pre('save', function(next) {
  // Ensure room name is unique within building and floor
  if (this.isModified('roomName') || this.isModified('building') || this.isModified('floor')) {
    this.constructor.findOne({
      building: this.building,
      floor: this.floor,
      roomName: this.roomName,
      _id: { $ne: this._id }
    }).then(existingRoom => {
      if (existingRoom) {
        next(new Error('Room name must be unique within the same building and floor'));
      } else {
        next();
      }
    }).catch(next);
  } else {
    next();
  }
});

// Static methods
classroomSchema.statics.findByType = function(roomType) {
  return this.find({ roomType: roomType, isActive: true });
};

classroomSchema.statics.findByCapacity = function(minCapacity, maxCapacity) {
  return this.find({
    capacity: { $gte: minCapacity, $lte: maxCapacity },
    isActive: true
  });
};

classroomSchema.statics.findAvailableRooms = function(day, startTime, endTime, capacity, roomType) {
  return this.find({
    isActive: true,
    isUnderMaintenance: false,
    capacity: { $gte: capacity },
    roomType: roomType,
    'availability.workingDays': day,
    $and: [
      {
        'availability.workingHours.startTime': { $lte: startTime }
      },
      {
        'availability.workingHours.endTime': { $gte: endTime }
      }
    ]
  });
};

// Instance methods
classroomSchema.methods.isAvailableAt = function(day, startTime, endTime) {
  if (!this.isActive || this.isUnderMaintenance) return false;
  
  // Check if room works on the specified day
  if (!this.availability.workingDays.includes(day)) return false;
  
  // Check working hours
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  const workStart = new Date(`2000-01-01 ${this.availability.workingHours.startTime}`);
  const workEnd = new Date(`2000-01-01 ${this.availability.workingHours.endTime}`);
  
  if (start < workStart || end > workEnd) return false;
  
  // Check maintenance slots
  const hasMaintenanceConflict = this.availability.maintenanceSlots.some(slot => {
    if (slot.day !== day) return false;
    
    const maintenanceStart = new Date(`2000-01-01 ${slot.startTime}`);
    const maintenanceEnd = new Date(`2000-01-01 ${slot.endTime}`);
    
    return (start < maintenanceEnd && end > maintenanceStart);
  });
  
  return !hasMaintenanceConflict;
};

classroomSchema.methods.canAccommodateSubject = function(subjectType, studentCount) {
  // Check capacity
  if (studentCount > this.capacity) return false;
  
  // Check room type compatibility
  const typeCompatibility = {
    'lecture': ['lecture', 'auditorium', 'seminar'],
    'lab': ['lab', 'computer'],
    'tutorial': ['tutorial', 'lecture'],
    'practical': ['lab', 'computer'],
    'computer': ['computer', 'lab']
  };
  
  return typeCompatibility[subjectType]?.includes(this.roomType) || false;
};

classroomSchema.methods.getUtilizationScore = function() {
  // Calculate room utilization score based on features and capacity
  let score = 0;
  
  if (this.features.hasProjector) score += 10;
  if (this.features.hasAirConditioning) score += 15;
  if (this.features.hasInternet) score += 20;
  if (this.features.hasSoundSystem) score += 10;
  
  // Capacity efficiency (optimal capacity range)
  if (this.capacity >= 20 && this.capacity <= 60) score += 20;
  else if (this.capacity > 60) score += 15;
  else score += 10;
  
  return score;
};

const Classroom = mongoose.model('Classroom', classroomSchema);

export default Classroom;
