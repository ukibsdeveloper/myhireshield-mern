import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee ID is required']
  },
  documentType: {
    type: String,
    enum: [
      'aadhaar',
      'pan',
      'passport',
      'driving_license',
      'educational_certificate',
      'experience_letter',
      'police_verification',
      'address_proof',
      'bank_statement',
      'other'
    ],
    required: [true, 'Document type is required']
  },
  documentNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'under_review'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  rejectionReason: String,
  // Automated Verification Results
  autoVerification: {
    attempted: {
      type: Boolean,
      default: false
    },
    success: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    extractedData: mongoose.Schema.Types.Mixed,
    errors: [String],
    verifiedAt: Date
  },
  // OCR Extracted Data
  extractedText: String,
  extractedData: {
    name: String,
    documentNumber: String,
    issueDate: Date,
    expiryDate: Date,
    address: String,
    otherFields: mongoose.Schema.Types.Mixed
  },
  // Document Metadata
  issueDate: Date,
  expiryDate: Date,
  issuingAuthority: String,
  // Security
  encrypted: {
    type: Boolean,
    default: false
  },
  accessLog: [{
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessedAt: Date,
    purpose: String,
    ipAddress: String
  }],
  // Flags
  isSuspicious: {
    type: Boolean,
    default: false
  },
  suspiciousReasons: [String],
  requiresManualReview: {
    type: Boolean,
    default: false
  },
  // Metadata
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ employeeId: 1, documentType: 1 });
documentSchema.index({ verificationStatus: 1 });
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ verifiedAt: -1 });

// Virtual for document age
documentSchema.virtual('documentAge').get(function() {
  const now = new Date();
  const uploaded = new Date(this.uploadedAt);
  const diffTime = Math.abs(now - uploaded);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for is expired
documentSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > new Date(this.expiryDate);
});

// Method to log access
documentSchema.methods.logAccess = async function(userId, purpose, ipAddress) {
  this.accessLog.push({
    accessedBy: userId,
    accessedAt: new Date(),
    purpose,
    ipAddress
  });
  await this.save();
};

// Method to mark as verified
documentSchema.methods.markAsVerified = async function(verifiedBy) {
  this.verificationStatus = 'verified';
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  await this.save();
  
  // Update employee verification badges
  const Employee = mongoose.model('Employee');
  const employee = await Employee.findById(this.employeeId);
  if (employee) {
    await employee.updateVerificationStatus();
  }
};

// Method to mark as rejected
documentSchema.methods.markAsRejected = async function(reason, rejectedBy) {
  this.verificationStatus = 'rejected';
  this.rejectionReason = reason;
  this.verifiedBy = rejectedBy;
  this.verifiedAt = new Date();
  await this.save();
};

// Static method to get verification statistics
documentSchema.statics.getVerificationStats = async function(employeeId) {
  const stats = await this.aggregate([
    { $match: { employeeId: mongoose.Types.ObjectId(employeeId) } },
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    total: stats.reduce((sum, stat) => sum + stat.count, 0),
    verified: stats.find(s => s._id === 'verified')?.count || 0,
    pending: stats.find(s => s._id === 'pending')?.count || 0,
    rejected: stats.find(s => s._id === 'rejected')?.count || 0,
    underReview: stats.find(s => s._id === 'under_review')?.count || 0
  };
};

const Document = mongoose.model('Document', documentSchema);

export default Document;