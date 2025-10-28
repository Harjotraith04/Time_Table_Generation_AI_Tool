const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  type: {
    type: String,
    enum: ['National Holiday', 'Festival', 'Examination', 'Vacation', 'Academic Event', 'Other'],
    default: 'National Holiday'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  isDateRange: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Validate that either date or date range is provided
holidaySchema.pre('save', function(next) {
  if (this.isDateRange) {
    if (!this.startDate || !this.endDate) {
      next(new Error('Start date and end date are required for date range'));
    }
    if (this.startDate > this.endDate) {
      next(new Error('Start date must be before end date'));
    }
  } else {
    if (!this.date) {
      next(new Error('Date is required for single day event'));
    }
  }
  next();
});

module.exports = mongoose.model('Holiday', holidaySchema);
