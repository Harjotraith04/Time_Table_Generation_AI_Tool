const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  available: { type: Boolean, default: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' }
}, { _id: false });

const teacherSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Teaching Assistant'],
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  maxHoursPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 40,
    default: 20
  },
  availability: {
    monday: { type: availabilitySchema, default: () => ({}) },
    tuesday: { type: availabilitySchema, default: () => ({}) },
    wednesday: { type: availabilitySchema, default: () => ({}) },
    thursday: { type: availabilitySchema, default: () => ({}) },
    friday: { type: availabilitySchema, default: () => ({}) },
    saturday: { type: availabilitySchema, default: () => ({ available: false }) },
    sunday: { type: availabilitySchema, default: () => ({ available: false }) }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  },
  preferences: {
    preferredTimeSlots: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    avoidTimeSlots: [{
      day: String,
      startTime: String,
      endTime: String
    }],
    preferredRooms: [String],
    maxConsecutiveHours: { type: Number, default: 3 },
    allowBackToBack: { type: Boolean, default: true },
    preferredBreakTime: { type: String, default: '12:00-13:00' }
  },
  constraints: {
    cannotTeachWith: [String], // Teacher IDs
    mustTeachWith: [String], // Teacher IDs for team teaching
    specialRequirements: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
teacherSchema.index({ id: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ subjects: 1 });

// Virtual for current workload calculation
teacherSchema.virtual('currentWorkload').get(function() {
  // This would be calculated based on current timetable assignments
  return 0; // Placeholder
});

// Method to check if teacher is available at a specific time
teacherSchema.methods.isAvailableAt = function(day, time) {
  const dayAvailability = this.availability[day.toLowerCase()];
  if (!dayAvailability || !dayAvailability.available) {
    return false;
  }
  
  const startTime = dayAvailability.startTime;
  const endTime = dayAvailability.endTime;
  
  return time >= startTime && time <= endTime;
};

// Method to get teaching load percentage
teacherSchema.methods.getTeachingLoadPercentage = function(currentHours = 0) {
  return (currentHours / this.maxHoursPerWeek) * 100;
};

// Static method to find teachers by subject
teacherSchema.statics.findBySubject = function(subject) {
  return this.find({ 
    subjects: { $in: [subject] },
    status: 'active'
  });
};

module.exports = mongoose.model('Teacher', teacherSchema);
