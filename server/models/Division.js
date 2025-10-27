const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Lab', 'Tutorial', 'Regular'],
    default: 'Regular'
  },
  studentCount: {
    type: Number,
    required: true,
    min: 1
  },
  students: [{
    type: String // student IDs
  }]
}, { _id: false });

const divisionSchema = new mongoose.Schema({
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
  studentCount: {
    type: Number,
    required: true,
    min: 1,
    max: 500
  },
  labBatches: {
    type: Number,
    default: 0,
    min: 0
  },
  batches: [batchSchema],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
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
divisionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes
divisionSchema.index({ program: 1, year: 1, semester: 1 });
divisionSchema.index({ status: 1 });

// Static methods
divisionSchema.statics.findByProgram = function(program, year, semester) {
  const query = { program, status: 'Active' };
  if (year) query.year = year;
  if (semester) query.semester = semester;
  return this.find(query);
};

const Division = mongoose.model('Division', divisionSchema);

module.exports = Division;
