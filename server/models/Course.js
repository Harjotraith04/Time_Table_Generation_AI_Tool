const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Tutorial', 'Seminar', 'Workshop'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 30,
    max: 180
  },
  requiredFeatures: [String],
  minRoomCapacity: { type: Number, default: 30 },
  preferredRoomType: String,
  requiresLab: { type: Boolean, default: false },
  canBeSplit: { type: Boolean, default: false }, // Can be divided into multiple sessions
  sessionsPerWeek: { type: Number, default: 1, min: 1, max: 10 }
}, { _id: false });

const courseSchema = new mongoose.Schema({
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
    maxlength: 150
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  program: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sessions: {
    theory: sessionSchema,
    practical: sessionSchema,
    tutorial: sessionSchema
  },
  totalHoursPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  enrolledStudents: {
    type: Number,
    required: true,
    min: 1,
    max: 500
  },
  divisions: [{
    divisionId: String,
    studentCount: Number,
    batches: [{
      batchId: String,
      studentCount: Number,
      type: { type: String, enum: ['Lab', 'Tutorial', 'Regular'] }
    }]
  }],
  assignedTeachers: [{
    teacherId: { type: String, required: true },
    sessionTypes: [{ type: String, enum: ['Theory', 'Practical', 'Tutorial'] }],
    isPrimary: { type: Boolean, default: false },
    canTeachAlone: { type: Boolean, default: true }
  }],
  constraints: {
    preferredTimeSlots: [{
      day: String,
      startTime: String,
      endTime: String,
      sessionType: String
    }],
    avoidTimeSlots: [{
      day: String,
      startTime: String,
      endTime: String,
      reason: String
    }],
    mustBeConsecutive: { type: Boolean, default: false },
    cannotBeOnSameDay: [String], // Course IDs
    mustBeOnSameDay: [String], // Course IDs
    requiresBreakBefore: { type: Boolean, default: false },
    requiresBreakAfter: { type: Boolean, default: false },
    maxGapBetweenSessions: { type: Number, default: 240 }, // in minutes
    specialRequirements: [String]
  },
  prerequisites: [String], // Course IDs
  corequisites: [String], // Course IDs that must be taken together
  isActive: {
    type: Boolean,
    default: true
  },
  isCore: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ department: 1, year: 1, semester: 1 });
courseSchema.index({ program: 1 });
courseSchema.index({ 'assignedTeachers.teacherId': 1 });
courseSchema.index({ isActive: 1 });

// Virtual for total sessions per week
courseSchema.virtual('totalSessionsPerWeek').get(function() {
  let total = 0;
  if (this.sessions.theory) total += this.sessions.theory.sessionsPerWeek;
  if (this.sessions.practical) total += this.sessions.practical.sessionsPerWeek;
  if (this.sessions.tutorial) total += this.sessions.tutorial.sessionsPerWeek;
  return total;
});

// Virtual for required room types
courseSchema.virtual('requiredRoomTypes').get(function() {
  const types = new Set();
  if (this.sessions.theory) types.add('Lecture Hall');
  if (this.sessions.practical) types.add('Lab');
  if (this.sessions.tutorial) types.add('Tutorial Room');
  return Array.from(types);
});

// Method to check if course conflicts with another course's timing
courseSchema.methods.conflictsWith = function(otherCourse, timeSlot) {
  // Check if courses have same students (same year, semester, program)
  const sameStudents = this.year === otherCourse.year && 
                      this.semester === otherCourse.semester && 
                      this.program === otherCourse.program;
  
  if (sameStudents) return true;
  
  // Check if courses have same teachers
  const thisTeachers = this.assignedTeachers.map(t => t.teacherId);
  const otherTeachers = otherCourse.assignedTeachers.map(t => t.teacherId);
  const sharedTeachers = thisTeachers.some(t => otherTeachers.includes(t));
  
  return sharedTeachers;
};

// Method to get session requirements
courseSchema.methods.getSessionRequirements = function(sessionType) {
  const session = this.sessions[sessionType.toLowerCase()];
  if (!session) return null;
  
  return {
    type: sessionType,
    duration: session.duration,
    requiredFeatures: session.requiredFeatures || [],
    minRoomCapacity: Math.max(session.minRoomCapacity, this.enrolledStudents),
    preferredRoomType: session.preferredRoomType,
    requiresLab: session.requiresLab,
    sessionsPerWeek: session.sessionsPerWeek
  };
};

// Static method to find courses by criteria
courseSchema.statics.findByCriteria = function(criteria) {
  const { department, year, semester, program, teacher, isActive = true } = criteria;
  
  let query = { isActive };
  
  if (department) query.department = department;
  if (year) query.year = year;
  if (semester) query.semester = semester;
  if (program) query.program = program;
  if (teacher) query['assignedTeachers.teacherId'] = teacher;
  
  return this.find(query);
};

// Static method to get course statistics
courseSchema.statics.getCourseStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          department: '$department',
          year: '$year',
          semester: '$semester'
        },
        totalCourses: { $sum: 1 },
        totalCredits: { $sum: '$credits' },
        totalHours: { $sum: '$totalHoursPerWeek' },
        totalStudents: { $sum: '$enrolledStudents' }
      }
    }
  ]);
};

module.exports = mongoose.model('Course', courseSchema);
