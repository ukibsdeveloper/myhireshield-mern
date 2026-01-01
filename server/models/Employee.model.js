import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  // Address
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    country: {
      type: String,
      default: 'India'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required']
    }
  },
  // Professional Information
  currentDesignation: String,
  totalExperience: {
    type: Number,
    default: 0 // in years
  },
  skills: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: String,
    institution: String,
    year: Number,
    percentage: Number
  }],
  workHistory: [{
    companyName: String,
    designation: String,
    startDate: Date,
    endDate: Date,
    currentlyWorking: Boolean,
    responsibilities: String
  }],
  // Profile
  profilePicture: String,
  bio: String,
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  // Score and Verification
  overallScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationBadges: [{
    type: {
      type: String,
      enum: ['identity', 'education', 'experience', 'police', 'address']
    },
    verified: Boolean,
    verifiedAt: Date
  }],
  // Privacy and Consent
  profileVisible: {
    type: Boolean,
    default: false // Must give consent first
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  consentGivenAt: Date,
  dataRetentionConsent: {
    type: Boolean,
    default: false
  },
  // Statistics
  profileViews: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  searchAppearances: {
    type: Number,
    default: 0
  },
  // Settings
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'semi-public', 'private'],
      default: 'semi-public'
    },
    showContactInfo: {
      type: Boolean,
      default: false
    }
  },
  // Metadata
  lastActive: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
employeeSchema.index({ userId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text' });
employeeSchema.index({ overallScore: -1 });
employeeSchema.index({ verified: 1 });
employeeSchema.index({ profileVisible: 1, consentGiven: 1 });
employeeSchema.index({ skills: 1 });
employeeSchema.index({ 'address.city': 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
employeeSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Update overall score based on reviews
employeeSchema.methods.updateScore = async function() {
  const Review = mongoose.model('Review');
  
  const reviews = await Review.find({ employeeId: this._id });
  
  if (reviews.length === 0) {
    this.overallScore = 0;
    this.totalReviews = 0;
  } else {
    const totalScore = reviews.reduce((sum, review) => {
      const ratings = Object.values(review.ratings);
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return sum + avgRating;
    }, 0);
    
    this.overallScore = Math.round((totalScore / reviews.length) * 10); // Convert to 0-100
    this.totalReviews = reviews.length;
  }
  
  await this.save();
  return this.overallScore;
};

// Check if profile is complete
employeeSchema.methods.isProfileComplete = function() {
  return !!(
    this.firstName &&
    this.lastName &&
    this.email &&
    this.phone &&
    this.dateOfBirth &&
    this.address.city &&
    this.address.state &&
    this.skills.length > 0 &&
    this.education.length > 0
  );
};

// Increment profile views
employeeSchema.methods.incrementViews = async function() {
  this.profileViews += 1;
  this.lastViewedAt = new Date();
  await this.save();
};

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;