const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  available: { type: Boolean, default: true },
  startTime: { type: String, default: '08:00' },
  endTime: { type: String, default: '18:00' }
}, { _id: false });

const classroomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  building: {
    type: String,
    required: true,
    trim: true
  },
  floor: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 500
  },
  type: {
    type: String,
    required: true,
    enum: ['Lecture Hall', 'Tutorial Room', 'Computer Lab', 'Science Lab', 'Seminar Hall', 'Workshop'],
    trim: true
  },
  features: [{
    type: String,
    enum: [
      'Projector', 'Sound System', 'Air Conditioning', 'WiFi', 'Whiteboard',
      'Smart Board', 'Computers', 'Lab Equipment', 'Safety Equipment',
      'Ventilation', 'Storage', 'Stage', 'Microphone System'
    ]
  }],
  availability: {
    monday: { type: availabilitySchema, default: () => ({}) },
    tuesday: { type: availabilitySchema, default: () => ({}) },
    wednesday: { type: availabilitySchema, default: () => ({}) },
    thursday: { type: availabilitySchema, default: () => ({}) },
    friday: { type: availabilitySchema, default: () => ({}) },
    saturday: { type: availabilitySchema, default: () => ({ endTime: '13:00' }) },
    sunday: { type: availabilitySchema, default: () => ({ available: false }) }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['available', 'maintenance', 'reserved', 'out_of_order'],
    default: 'available'
  },
  suitableFor: [{
    type: String,
    enum: ['Theory', 'Practical', 'Tutorial', 'Seminar', 'Examination', 'Workshop']
  }],
  constraints: {
    requiredFeatures: [String],
    incompatibleWith: [String], // Course IDs or types
    specialRequirements: [String],
    maintenanceWindows: [{
      day: String,
      startTime: String,
      endTime: String,
      recurring: { type: Boolean, default: false }
    }]
  },
  utilizationMetrics: {
    totalHoursPerWeek: { type: Number, default: 0 },
    peakUtilizationHours: [String],
    averageOccupancy: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
classroomSchema.index({ building: 1, floor: 1 });
classroomSchema.index({ type: 1 });
classroomSchema.index({ capacity: 1 });
classroomSchema.index({ status: 1 });
classroomSchema.index({ features: 1 });

// Virtual for utilization percentage
classroomSchema.virtual('utilizationPercentage').get(function() {
  const maxHoursPerWeek = 5 * 8; // 5 days * 8 hours
  return (this.utilizationMetrics.totalHoursPerWeek / maxHoursPerWeek) * 100;
});

// Method to check if classroom is available at a specific time
classroomSchema.methods.isAvailableAt = function(day, time) {
  if (this.status !== 'available') {
    return false;
  }
  
  const dayAvailability = this.availability[day.toLowerCase()];
  if (!dayAvailability || !dayAvailability.available) {
    return false;
  }
  
  const startTime = dayAvailability.startTime;
  const endTime = dayAvailability.endTime;
  
  return time >= startTime && time <= endTime;
};

// Method to check if classroom has required features
classroomSchema.methods.hasRequiredFeatures = function(requiredFeatures = []) {
  if (!requiredFeatures.length) return true;
  return requiredFeatures.every(feature => this.features.includes(feature));
};

// Method to check if classroom is suitable for a course type
classroomSchema.methods.isSuitableFor = function(courseType) {
  if (!this.suitableFor.length) return true;
  return this.suitableFor.includes(courseType);
};

// Static method to find suitable classrooms for a course
classroomSchema.statics.findSuitableFor = function(criteria) {
  const {
    type,
    minCapacity,
    requiredFeatures = [],
    building,
    day,
    time
  } = criteria;
  
  let query = {
    status: 'available',
    capacity: { $gte: minCapacity || 1 }
  };
  
  if (type) {
    query.suitableFor = { $in: [type] };
  }
  
  if (requiredFeatures.length) {
    query.features = { $all: requiredFeatures };
  }
  
  if (building) {
    query.building = building;
  }
  
  return this.find(query);
};

// Static method to get utilization statistics
classroomSchema.statics.getUtilizationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$building',
        totalRooms: { $sum: 1 },
        averageCapacity: { $avg: '$capacity' },
        totalCapacity: { $sum: '$capacity' },
        averageUtilization: { $avg: '$utilizationMetrics.totalHoursPerWeek' }
      }
    }
  ]);
};

module.exports = mongoose.model('Classroom', classroomSchema);
