const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
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
  courseId: {
    type: String,
    required: true
  },
  courseName: String,
  courseCode: String,
  sessionType: {
    type: String,
    enum: ['Theory', 'Practical', 'Tutorial', 'Seminar', 'Workshop'],
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  teacherName: String,
  classroomId: {
    type: String,
    required: true
  },
  classroomName: String,
  divisionId: String,
  batchId: String,
  studentCount: Number,
  isLocked: { type: Boolean, default: false },
  notes: String
}, { _id: false });

const conflictSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['teacher_conflict', 'room_conflict', 'student_conflict', 'constraint_violation', 'generation_error', 'system_error', 'data_error'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: String,
  involvedEntities: {
    teachers: [String],
    classrooms: [String],
    courses: [String],
    timeSlot: String
  },
  resolved: { type: Boolean, default: false },
  resolutionNotes: String
}, { _id: false });

const generationMetricsSchema = new mongoose.Schema({
  algorithm: String,
  startTime: Date,
  endTime: Date,
  duration: Number, // in milliseconds
  iterations: Number,
  convergenceRate: Number,
  finalFitness: Number,
  constraintsSatisfied: Number,
  constraintsViolated: Number,
  satisfactionRate: Number,
  parameters: mongoose.Schema.Types.Mixed
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    min: 1,
    max: 5
  },
  program: String,
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'published', 'archived'],
    default: 'draft'
  },
  schedule: [timeSlotSchema],
  conflicts: [conflictSchema],
  generationSettings: {
    algorithm: {
      type: String,
      enum: ['greedy', 'genetic', 'backtracking', 'simulated_annealing', 'csp', 'hybrid'],
      required: true,
      default: 'greedy'
    },
    populationSize: Number,
    maxGenerations: Number,
    crossoverRate: Number,
    mutationRate: Number,
    optimizationGoals: [String],
    workingDays: [String],
    startTime: String,
    endTime: String,
    slotDuration: Number,
    breakSlots: [String],
    enforceBreaks: Boolean,
    balanceWorkload: Boolean
  },
  metrics: generationMetricsSchema,
  quality: {
    overallScore: { type: Number, min: 0, max: 100 },
    teacherSatisfaction: { type: Number, min: 0, max: 100 },
    roomUtilization: { type: Number, min: 0, max: 100 },
    studentConvenience: { type: Number, min: 0, max: 100 },
    constraintCompliance: { type: Number, min: 0, max: 100 }
  },
  statistics: {
    totalClasses: Number,
    totalTeachers: Number,
    totalRooms: Number,
    totalHours: Number,
    utilizationByDay: {
      monday: Number,
      tuesday: Number,
      wednesday: Number,
      thursday: Number,
      friday: Number,
      saturday: Number
    },
    peakHours: [String],
    roomUtilizationRate: Number,
    teacherWorkloadDistribution: mongoose.Schema.Types.Mixed
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  validFrom: Date,
  validTo: Date,
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    timestamp: { type: Date, default: Date.now },
    isResolved: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
timetableSchema.index({ academicYear: 1, semester: 1, department: 1 });
timetableSchema.index({ status: 1 });
timetableSchema.index({ createdBy: 1 });
timetableSchema.index({ 'schedule.courseId': 1 });
timetableSchema.index({ 'schedule.teacherId': 1 });
timetableSchema.index({ 'schedule.classroomId': 1 });

// Virtual for generation progress
timetableSchema.virtual('generationProgress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'generating') return this.metrics?.convergenceRate || 0;
  return 0;
});

// Virtual for total classes
timetableSchema.virtual('totalClasses').get(function() {
  return this.schedule.length;
});

// Method to check for conflicts
timetableSchema.methods.detectConflicts = function() {
  const conflicts = [];
  const teacherSchedule = new Map();
  const roomSchedule = new Map();
  const studentSchedule = new Map();
  
  this.schedule.forEach(slot => {
    const timeKey = `${slot.day}_${slot.startTime}_${slot.endTime}`;
    
    // Teacher conflict detection
    if (teacherSchedule.has(slot.teacherId)) {
      const existingSlots = teacherSchedule.get(slot.teacherId);
      const hasConflict = existingSlots.some(existing => 
        existing.day === slot.day && 
        this.timeSlotsOverlap(existing, slot)
      );
      
      if (hasConflict) {
        conflicts.push({
          type: 'teacher_conflict',
          severity: 'high',
          description: `Teacher ${slot.teacherName} has overlapping classes`,
          involvedEntities: {
            teachers: [slot.teacherId],
            courses: [slot.courseId],
            timeSlot: timeKey
          }
        });
      }
    } else {
      teacherSchedule.set(slot.teacherId, []);
    }
    teacherSchedule.get(slot.teacherId).push(slot);
    
    // Room conflict detection
    if (roomSchedule.has(slot.classroomId)) {
      const existingSlots = roomSchedule.get(slot.classroomId);
      const hasConflict = existingSlots.some(existing => 
        existing.day === slot.day && 
        this.timeSlotsOverlap(existing, slot)
      );
      
      if (hasConflict) {
        conflicts.push({
          type: 'room_conflict',
          severity: 'high',
          description: `Room ${slot.classroomName} is double-booked`,
          involvedEntities: {
            classrooms: [slot.classroomId],
            courses: [slot.courseId],
            timeSlot: timeKey
          }
        });
      }
    } else {
      roomSchedule.set(slot.classroomId, []);
    }
    roomSchedule.get(slot.classroomId).push(slot);
  });
  
  return conflicts;
};

// Helper method to check if time slots overlap
timetableSchema.methods.timeSlotsOverlap = function(slot1, slot2) {
  return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
};

// Method to calculate quality metrics
timetableSchema.methods.calculateQuality = function() {
  const conflicts = this.detectConflicts();
  const totalSlots = this.schedule.length;
  
  const constraintCompliance = totalSlots > 0 ? 
    ((totalSlots - conflicts.length) / totalSlots) * 100 : 0;
  
  // Calculate room utilization
  const roomHours = new Map();
  this.schedule.forEach(slot => {
    const duration = this.calculateDuration(slot.startTime, slot.endTime);
    roomHours.set(slot.classroomId, (roomHours.get(slot.classroomId) || 0) + duration);
  });
  
  const maxPossibleHours = 8 * 6; // 8 hours * 6 days
  const avgRoomUtilization = roomHours.size > 0 ? 
    Array.from(roomHours.values()).reduce((a, b) => a + b, 0) / (roomHours.size * maxPossibleHours) * 100 : 0;
  
  const overallScore = (constraintCompliance + avgRoomUtilization) / 2;
  
  return {
    overallScore: Math.round(overallScore),
    constraintCompliance: Math.round(constraintCompliance),
    roomUtilization: Math.round(avgRoomUtilization),
    teacherSatisfaction: 85, // Placeholder - would need more complex calculation
    studentConvenience: 80 // Placeholder - would need more complex calculation
  };
};

// Helper method to calculate duration between times
timetableSchema.methods.calculateDuration = function(startTime, endTime) {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  return (end - start) / (1000 * 60 * 60); // Duration in hours
};

// Static method to find active timetables
timetableSchema.statics.findActive = function(criteria = {}) {
  return this.find({ ...criteria, isActive: true, status: { $ne: 'archived' } });
};

// Static method to get timetable statistics
timetableSchema.statics.getTimetableStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          status: '$status',
          department: '$department'
        },
        count: { $sum: 1 },
        avgQuality: { $avg: '$quality.overallScore' },
        avgGenerationTime: { $avg: '$metrics.duration' }
      }
    }
  ]);
};

module.exports = mongoose.model('Timetable', timetableSchema);
