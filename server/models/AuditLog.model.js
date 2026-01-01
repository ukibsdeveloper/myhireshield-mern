import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: String,
  userRole: {
    type: String,
    enum: ['company', 'employee', 'admin', 'anonymous']
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      // Authentication
      'user_login',
      'user_logout',
      'user_registration',
      'password_change',
      'password_reset',
      'email_verification',
      'two_factor_enabled',
      'two_factor_disabled',
      'failed_login_attempt',
      // Profile
      'profile_created',
      'profile_updated',
      'profile_viewed',
      'profile_deleted',
      // Reviews
      'review_created',
      'review_updated',
      'review_deleted',
      'review_viewed',
      'review_flagged',
      // Documents
      'document_uploaded',
      'document_verified',
      'document_rejected',
      'document_deleted',
      'document_viewed',
      // Search
      'employee_searched',
      'search_filter_applied',
      // Data Rights
      'data_exported',
      'consent_given',
      'consent_withdrawn',
      'account_deleted',
      // Security
      'suspicious_activity',
      'ip_blocked',
      'account_suspended',
      'account_activated'
    ]
  },
  eventData: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  browser: String,
  os: String,
  device: String,
  sessionId: String,
  // Location data (optional)
  location: {
    country: String,
    city: String,
    region: String
  },
  // Status
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  errorMessage: String,
  // Metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ userRole: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index - automatically delete logs older than 2 years
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

// Static method to create audit log
auditLogSchema.statics.createLog = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error - audit logging should not break main functionality
    return null;
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to detect suspicious activity
auditLogSchema.statics.detectSuspiciousActivity = async function(userId) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Check for multiple failed login attempts
  const failedLogins = await this.countDocuments({
    userId,
    eventType: 'failed_login_attempt',
    timestamp: { $gte: oneHourAgo }
  });
  
  if (failedLogins >= 5) {
    return {
      suspicious: true,
      reason: 'Multiple failed login attempts',
      count: failedLogins
    };
  }
  
  // Check for rapid profile views from same user
  const profileViews = await this.countDocuments({
    userId,
    eventType: 'profile_viewed',
    timestamp: { $gte: oneHourAgo }
  });
  
  if (profileViews >= 50) {
    return {
      suspicious: true,
      reason: 'Excessive profile views',
      count: profileViews
    };
  }
  
  return { suspicious: false };
};

// Static method to get event statistics
auditLogSchema.statics.getEventStats = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;