import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import Employee from '../models/Employee.model.js';
import AuditLog from '../models/AuditLog.model.js';

const router = express.Router();

/**
 * @desc    Give consent for data processing
 * @route   POST /api/consent
 * @access  Private (Employee only)
 */
router.post('/', protect, authorize('employee'), apiLimiter, async (req, res) => {
  try {
    const { consentType, consentGiven } = req.body;

    const employee = await Employee.findOne({ userId: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Update consent status
    employee.consentGiven = consentGiven;
    employee.consentType = consentType;
    employee.consentDate = new Date();
    await employee.save();

    // Log the consent action
    await AuditLog.createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: consentGiven ? 'consent_given' : 'consent_withdrawn',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: consentGiven ? 'Consent given successfully' : 'Consent withdrawn successfully',
      data: {
        consentGiven: employee.consentGiven,
        consentType: employee.consentType,
        consentDate: employee.consentDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing consent',
      error: error.message
    });
  }
});

/**
 * @desc    Withdraw consent
 * @route   POST /api/consent/withdraw
 * @access  Private (Employee only)
 */
router.post('/withdraw', protect, authorize('employee'), apiLimiter, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    employee.consentGiven = false;
    employee.consentType = null;
    employee.consentDate = new Date();
    await employee.save();

    // Log the consent withdrawal
    await AuditLog.createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: 'consent_withdrawn',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Consent withdrawn successfully',
      data: {
        consentGiven: employee.consentGiven,
        consentDate: employee.consentDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error withdrawing consent',
      error: error.message
    });
  }
});

/**
 * @desc    Get consent status
 * @route   GET /api/consent/status
 * @access  Private (Employee only)
 */
router.get('/status', protect, authorize('employee'), apiLimiter, async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id })
      .select('consentGiven consentType consentDate');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        consentGiven: employee.consentGiven || false,
        consentType: employee.consentType,
        consentDate: employee.consentDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching consent status',
      error: error.message
    });
  }
});

export default router;