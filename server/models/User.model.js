import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['company', 'employee', 'admin'],
    required: [true, 'User role is required']
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  phoneNumber: String,
  phoneVerified: { type: Boolean, default: false },
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: String,
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'role'
  },
  ipAddresses: [{
    ip: String,
    timestamp: Date
  }],
  sessions: [{
    token: String,
    createdAt: Date,
    expiresAt: Date,
    device: String,
    browser: String
  }]
}, {
  timestamps: true
});

// Fix: Duplicate indexes remove kar diye (Terminal warnings hat jayengi)
userSchema.index({ role: 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ isActive: 1 });

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', async function() {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    // Yahan next() ki zarurat nahi hai agar function 'async' hai
  } catch (error) {
    throw error; // Mongoose automatically isse catch kar lega
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // this.password tabhi milega agar .select('+password') use kiya ho query mein
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

userSchema.methods.generateEmailVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15);
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.generatePasswordResetToken = function() {
  const token = Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return token;
};

userSchema.methods.updateLastLogin = function(ipAddress, device, browser) {
  this.lastLogin = Date.now();
  this.ipAddresses.push({ ip: ipAddress, timestamp: Date.now() });
  if (this.ipAddresses.length > 10) this.ipAddresses = this.ipAddresses.slice(-10);
  return this.save();
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.twoFactorSecret;
  delete user.sessions;
  return user;
};

const User = mongoose.model('User', userSchema);
export default User;