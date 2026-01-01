import User from '../models/User.model.js';
import Company from '../models/Company.model.js';
import Employee from '../models/Employee.model.js';
import AuditLog from '../models/AuditLog.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Get device info from request
const getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  return {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: userAgent,
    browser: userAgent.split(' ').pop(),
    device: /mobile/i.test(userAgent) ? 'mobile' : 'desktop'
  };
};

// @desc    Register company
// @route   POST /api/auth/register/company
// @access  Public
export const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      email,
      password,
      website,
      industry,
      companySize,
      address,
      contactPerson,
      gstin,
      cin
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'company'
    });

    // Create company profile
    const company = await Company.create({
      userId: user._id,
      companyName,
      email,
      website,
      industry,
      companySize,
      address,
      contactPerson,
      gstin,
      cin
    });

    // Update user with profile reference
    user.profileId = company._id;
    await user.save();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    try {
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - MyHireShield',
        template: 'emailVerification',
        data: {
          name: companyName,
          verificationUrl
        }
      });
    } catch (emailErr) {
      console.error('Warning: failed to send verification email:', emailErr);
      // proceed without failing registration
    }

    // Create audit log
    try {
      await AuditLog.createLog({
        userId: user._id,
        userEmail: email,
        userRole: 'company',
        eventType: 'user_registration',
        eventData: {
          companyName,
          industry,
          companySize
        },
        ...getDeviceInfo(req),
        status: 'success'
      });
    } catch (auditErr) {
      console.error('Warning: failed to create audit log:', auditErr);
    }

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register company error:', error);
    console.error(error.stack);
    
    // Create audit log for failed registration
    try {
      await AuditLog.createLog({
        userId: null,
        userEmail: req.body.email,
        userRole: 'company',
        eventType: 'user_registration',
        eventData: { error: error.message },
        ...getDeviceInfo(req),
        status: 'failure',
        errorMessage: error.message
      });
    } catch (auditErr) {
      console.error('Warning: failed to create audit log in error handler:', auditErr);
    }

    res.status(500).json({
      success: false,
      message: 'Error registering company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Register employee
// @route   POST /api/auth/register/employee
// @access  Public
export const registerEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      city,
      state,
      pincode
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user account
    const user = await User.create({
      email,
      password,
      role: 'employee'
    });

    // server/controllers/auth.controller.js mein ye change karein:

    // Create employee profile with proper mapping from flat frontend data
    const employee = await Employee.create({
      userId: user._id,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender: gender.toLowerCase(),
      address: {
        city: city || '',      // Frontend 'city' -> Backend 'address.city'
        state: state || '',    // Frontend 'state' -> Backend 'address.state'
        pincode: pincode || '',// Frontend 'pincode' -> Backend 'address.pincode'
        country: 'India'
      }
    });

    
    // Update user with profile reference
    user.profileId = employee._id;
    await user.save();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - MyHireShield',
      template: 'emailVerification',
      data: {
        name: `${firstName} ${lastName}`,
        verificationUrl
      }
    });

    // Create audit log
    await AuditLog.createLog({
      userId: user._id,
      userEmail: email,
      userRole: 'employee',
      eventType: 'user_registration',
      eventData: {
        name: `${firstName} ${lastName}`,
        totalExperience: 0
      },
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register employee error:', error);
    
    await AuditLog.createLog({
      userId: null,
      userEmail: req.body.email,
      userRole: 'employee',
      eventType: 'user_registration',
      eventData: { error: error.message },
      ...getDeviceInfo(req),
      status: 'failure',
      errorMessage: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Error registering employee',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    // Find user with password
    const user = await User.findOne({ email, role }).select('+password');

    if (!user) {
      // Create audit log for failed attempt
      await AuditLog.createLog({
        userId: null,
        userEmail: email,
        userRole: role,
        eventType: 'failed_login_attempt',
        eventData: { reason: 'User not found' },
        ...getDeviceInfo(req),
        status: 'failure'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      await user.incLoginAttempts();

      await AuditLog.createLog({
        userId: user._id,
        userEmail: email,
        userRole: role,
        eventType: 'failed_login_attempt',
        eventData: { reason: 'Incorrect password' },
        ...getDeviceInfo(req),
        status: 'failure'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Get profile data
    let profileData = null;
    if (role === 'company') {
      profileData = await Company.findOne({ userId: user._id });
    } else if (role === 'employee') {
      profileData = await Employee.findOne({ userId: user._id });
    }

    // Create audit log
    await AuditLog.createLog({
      userId: user._id,
      userEmail: email,
      userRole: role,
      eventType: 'user_login',
      eventData: { loginMethod: 'email_password' },
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        profile: profileData
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    // Get profile data
    let profileData = null;
    if (user.role === 'company') {
      profileData = await Company.findOne({ userId: user._id });
    } else if (user.role === 'employee') {
      profileData = await Employee.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        profile: profileData
      }
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Create audit log
    await AuditLog.createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: 'user_logout',
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Create audit log
    await AuditLog.createLog({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'email_verification',
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset Request - MyHireShield',
      template: 'passwordReset',
      data: {
        name: user.email,
        resetUrl
      }
    });

    // Create audit log
    await AuditLog.createLog({
      userId: user._id,
      userEmail: email,
      userRole: user.role,
      eventType: 'password_reset',
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset email'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Create audit log
    await AuditLog.createLog({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'password_change',
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Create audit log
    await AuditLog.createLog({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      eventType: 'password_change',
      ...getDeviceInfo(req),
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};