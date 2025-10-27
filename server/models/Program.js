const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
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
  school: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate']
  },
  duration: {
    type: Number, // in years
    required: true,
    min: 1,
    max: 8
  },
  totalSemesters: {
    type: Number,
    required: true,
    min: 1,
    max: 16
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  description: {
    type: String,
    maxlength: 500
  },
  requirements: {
    minCredits: Number,
    coreCredits: Number,
    electiveCredits: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
programSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
programSchema.index({ school: 1, type: 1 });
programSchema.index({ status: 1 });

// Static methods
programSchema.statics.findBySchool = function(school) {
  return this.find({ school, status: 'Active' });
};

programSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'Active' });
};

const Program = mongoose.model('Program', programSchema);

module.exports = Program;
