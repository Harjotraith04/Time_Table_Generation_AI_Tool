import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'computer', 'seminar', 'auditorium', 'tutorial'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  facilities: [{
    type: String,
    enum: ['projector', 'whiteboard', 'smartboard', 'computers', 'lab_equipment', 'audio_system', 'video_conferencing', 'air_conditioning']
  }],
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false
      },
      elevatorAccess: {
        type: Boolean,
        default: false
      }
    }
  },
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
  maintenanceSchedule: [{
    date: Date,
    startTime: String,
    endTime: String,
    description: String
  }],
  bookings: [{
    date: Date,
    timeSlot: String,
    purpose: String,
    bookedBy: String
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
  restrictions: {
    departmentOnly: String,
    courseTypes: [String],
    minimumCapacity: Number,
    maximumCapacity: Number
  }
}, {
  timestamps: true
});

const Classroom = mongoose.model('Classroom', classroomSchema);

export default Classroom;
