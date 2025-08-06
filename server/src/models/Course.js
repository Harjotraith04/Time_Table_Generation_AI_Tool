import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 6
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
    max: 6
  },
  type: {
    type: String,
    enum: ['theory', 'practical', 'tutorial', 'seminar', 'project'],
    required: true
  },
  teacherId: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in hours
    required: true,
    min: 1,
    max: 4
  },
  hoursPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  studentGroup: {
    type: String,
    required: true
  },
  studentCount: {
    type: Number,
    required: true,
    min: 1
  },
  batches: [{
    id: String,
    name: String,
    studentCount: Number
  }],
  prerequisites: [String],
  roomRequirements: {
    type: {
      type: String,
      enum: ['lecture', 'lab', 'computer', 'seminar', 'auditorium', 'tutorial']
    },
    facilities: [String],
    minimumCapacity: Number
  },
  schedulingConstraints: {
    preferredDays: [String],
    avoidDays: [String],
    preferredTimeSlots: [String],
    avoidTimeSlots: [String],
    consecutiveSlots: {
      type: Boolean,
      default: false
    },
    maxGapsPerDay: {
      type: Number,
      default: 2
    }
  },
  assessments: [{
    type: {
      type: String,
      enum: ['midterm', 'final', 'quiz', 'assignment', 'project', 'viva']
    },
    date: Date,
    duration: Number,
    roomRequirements: String
  }],
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conflictsWith: [String], // Course IDs that cannot be scheduled at the same time
  linkedCourses: [String], // Course IDs that should be scheduled together or in sequence
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
