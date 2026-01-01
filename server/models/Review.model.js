import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company ID is required']
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  // 8-Parameter Rating System (1-10 scale)
  ratings: {
    workQuality: {
      type: Number,
      required: [true, 'Work quality rating is required'],
      min: 1,
      max: 10
    },
    punctuality: {
      type: Number,
      required: [true, 'Punctuality rating is required'],
      min: 1,
      max: 10
    },
    behavior: {
      type: Number,
      required: [true, 'Behavior rating is required'],
      min: 1,
      max: 10
    },
    teamwork: {
      type: Number,
      required: [true, 'Teamwork rating is required'],
      min: 1,
      max: 10
    },
    communication: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: 1,
      max: 10
    },
    technicalSkills: {
      type: Number,
      required: [true, 'Technical skills rating is required'],
      min: 1,
      max: 10
    },
    problemSolving: {
      type: Number,
      required: [true, 'Problem solving rating is required'],
      min: 1,
      max: 10
    },
    reliability: {
      type: Number,
      required: [true, 'Reliability rating is required'],
      min: 1,
      max: 10
    }
  },
  // Employment Details
  employmentDetails: {
    designation: {
      type: String,
      required: [true, 'Designation is required']
    },
    department: String,
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: [true, 'Employment type is required']
    },
    reasonForLeaving: String
  },
  // Review Content
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    minlength: [50, 'Comment must be at least 50 characters'],
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  wouldRehire: {
    type: Boolean,
    required: [true, 'Would rehire field is required']
  },
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  // Moderation
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  // Edit History
  editHistory: [{
    editedAt: Date,
    previousRatings: mongoose.Schema.Types.Mixed,
    previousComment: String,
    reason: String
  }],
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: Date,
  deletionReason: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ companyId: 1, createdAt: -1 });
reviewSchema.index({ employeeId: 1, createdAt: -1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ flagged: 1 });
reviewSchema.index({ moderationStatus: 1 });

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = Object.values(this.ratings);
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for days since employment ended
reviewSchema.virtual('daysSinceEmploymentEnded').get(function() {
  if (!this.employmentDetails.endDate) return null;
  const now = new Date();
  const endDate = new Date(this.employmentDetails.endDate);
  const diffTime = Math.abs(now - endDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Check if review is within 15-day window
reviewSchema.methods.isWithinReviewWindow = function() {
  const daysSince = this.daysSinceEmploymentEnded;
  return daysSince !== null && daysSince <= 15;
};

// Calculate employment duration in months
reviewSchema.methods.getEmploymentDuration = function() {
  const start = new Date(this.employmentDetails.startDate);
  const end = new Date(this.employmentDetails.endDate);
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return months;
};

// server/models/Review.model.js

// Pre-save middleware ko isse badal dein
reviewSchema.pre('save', async function() {
  if (this.isNew) {
    // Virtual field 'daysSinceEmploymentEnded' ka use karein
    const daysSince = this.daysSinceEmploymentEnded;
    
    if (daysSince !== null && daysSince > 15) {
      // Seedha Error throw karein, Mongoose ise catch kar lega
      throw new Error('Reviews must be submitted within 15 days of employment end date');
    }
  }
});


// Post-save middleware to update employee score
reviewSchema.post('save', async function() {
  try {
    const Employee = mongoose.model('Employee');
    const employee = await Employee.findById(this.employeeId);
    if (employee) {
      await employee.updateScore();
    }
  } catch (error) {
    console.error('Error updating employee score:', error);
  }
});

// Post-remove middleware to update employee score
reviewSchema.post('remove', async function() {
  try {
    const Employee = mongoose.model('Employee');
    const employee = await Employee.findById(this.employeeId);
    if (employee) {
      await employee.updateScore();
    }
  } catch (error) {
    console.error('Error updating employee score:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;