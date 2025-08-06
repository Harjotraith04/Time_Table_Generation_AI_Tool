import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'completed', 'published', 'archived'],
    default: 'draft'
  },
  generationSettings: {
    algorithm: {
      type: String,
      enum: ['genetic', 'backtracking', 'simulated_annealing'],
      default: 'genetic'
    },
    parameters: {
      populationSize: Number,
      maxGenerations: Number,
      crossoverRate: Number,
      mutationRate: Number,
      targetFitness: Number
    },
    constraints: {
      workingDays: [String],
      startTime: String,
      endTime: String,
      slotDuration: Number,
      breakSlots: [String],
      maxConsecutiveHours: Number,
      enforceBreaks: Boolean,
      balanceWorkload: Boolean
    },
    optimizationGoals: [String]
  },
  schedule: [{
    courseId: String,
    courseName: String,
    teacherId: String,
    teacherName: String,
    classroomId: String,
    classroomName: String,
    timeSlotId: String,
    day: String,
    startTime: String,
    endTime: String,
    studentGroup: String,
    duration: Number,
    type: String
  }],
  metadata: {
    generatedAt: Date,
    generatedBy: String,
    algorithm: String,
    fitness: Number,
    violations: {
      teacherConflicts: Number,
      classroomConflicts: Number,
      studentConflicts: Number,
      teacherPreferences: Number,
      workloadBalance: Number,
      roomCapacity: Number,
      consecutiveHours: Number
    },
    statistics: {
      totalCourses: Number,
      totalTeachers: Number,
      totalClassrooms: Number,
      totalTimeSlots: Number,
      generationTime: Number, // in milliseconds
      finalGeneration: Number
    }
  },
  teacherSchedules: mongoose.Schema.Types.Mixed,
  classroomSchedules: mongoose.Schema.Types.Mixed,
  studentSchedules: mongoose.Schema.Types.Mixed,
  conflicts: [{
    type: {
      type: String,
      enum: ['teacher_conflict', 'classroom_conflict', 'student_conflict', 'capacity_issue', 'preference_violation']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    affectedEntities: [String],
    timeSlot: String,
    day: String,
    suggestions: [String]
  }],
  approvals: [{
    approvedBy: String,
    approvedAt: Date,
    role: String,
    comments: String
  }],
  publishedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  backupData: {
    teachers: [mongoose.Schema.Types.Mixed],
    classrooms: [mongoose.Schema.Types.Mixed],
    courses: [mongoose.Schema.Types.Mixed]
  }
}, {
  timestamps: true
});

// Indexes for better performance
timetableSchema.index({ academicYear: 1, semester: 1, department: 1 });
timetableSchema.index({ status: 1 });
timetableSchema.index({ 'schedule.teacherId': 1 });
timetableSchema.index({ 'schedule.classroomId': 1 });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
