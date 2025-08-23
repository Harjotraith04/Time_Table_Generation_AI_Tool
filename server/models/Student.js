const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
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
      match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    }
  },
  academicInfo: {
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
    division: {
      type: String,
      required: true,
      trim: true
    },
    batch: {
      type: String,
      trim: true
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true
    },
    admissionDate: {
      type: Date,
      required: true
    },
    academicYear: {
      type: String,
      required: true
    }
  },
  enrolledCourses: [{
    courseId: {
      type: String,
      required: true
    },
    courseName: String,
    courseCode: String,
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Dropped', 'Failed'],
      default: 'Active'
    }
  }],
  attendance: {
    totalClasses: { type: Number, default: 0 },
    classesAttended: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Suspended', 'Transferred'],
    default: 'Active'
  },
  guardianInfo: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  notes: [{
    date: { type: Date, default: Date.now },
    content: String,
    addedBy: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
studentSchema.index({ 'academicInfo.department': 1, 'academicInfo.year': 1, 'academicInfo.semester': 1 });
studentSchema.index({ 'academicInfo.program': 1, 'academicInfo.division': 1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Method to update attendance
studentSchema.methods.updateAttendance = function() {
  if (this.attendance.totalClasses > 0) {
    this.attendance.attendancePercentage = (this.attendance.classesAttended / this.attendance.totalClasses) * 100;
  }
};

// Static method to find students by course
studentSchema.statics.findByCourse = function(courseId) {
  return this.find({ 'enrolledCourses.courseId': courseId, status: 'Active' });
};

// Static method to find students by division
studentSchema.statics.findByDivision = function(department, program, year, semester, division) {
  return this.find({
    'academicInfo.department': department,
    'academicInfo.program': program,
    'academicInfo.year': year,
    'academicInfo.semester': semester,
    'academicInfo.division': division,
    status: 'Active'
  });
};

module.exports = mongoose.model('Student', studentSchema);
