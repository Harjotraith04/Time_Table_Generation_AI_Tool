const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['timetable-conflict', 'schedule-change', 'general', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resolved'],
    default: 'pending'
  },
  submittedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin']
    }
  },
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  adminResponse: {
    type: String
  },
  respondedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String
  },
  respondedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  comments: [{
    text: String,
    commentedBy: {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      email: String
    },
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolutionNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ 'submittedBy.userId': 1 });
querySchema.index({ type: 1 });
querySchema.index({ timetableId: 1 });

const Query = mongoose.model('Query', querySchema);

module.exports = Query;
