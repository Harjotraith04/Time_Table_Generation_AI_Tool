import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  subjects: [{
    id: String,
    name: String,
    expertise: {
      type: String,
      enum: ['expert', 'proficient', 'basic'],
      default: 'proficient'
    }
  }],
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      day: String,
      startTime: String,
      endTime: String
    }]
  },
  unavailableSlots: [{
    day: String,
    time: String,
    reason: String
  }],
  preferences: {
    preferredHours: {
      type: Number,
      default: 20
    },
    maxHours: {
      type: Number,
      default: 25
    },
    preferredTimeSlots: [String],
    avoidTimeSlots: [String],
    backToBackPreference: {
      type: String,
      enum: ['prefer', 'avoid', 'neutral'],
      default: 'neutral'
    }
  },
  workload: {
    currentHours: {
      type: Number,
      default: 0
    },
    assignedCourses: [String]
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
