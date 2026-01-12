import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import AuditLog from '../models/AuditLog.model.js';

const router = express.Router();

/**
 * @desc    Get audit logs with filters
 * @route   GET /api/audit/logs
 * @access  Private (Admin only)
 */
router.get('/logs', protect, authorize('admin'), apiLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 50, eventType, userId, startDate, endDate } = req.query;

    const query = {};

    if (eventType) query.eventType = eventType;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching audit logs',
      error: error.message
    });
  }
});

/**
 * @desc    Get current user's audit logs
 * @route   GET /api/audit/my-logs
 * @access  Private
 */
router.get('/my-logs', protect, apiLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const logs = await AuditLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v -userId -userEmail -userRole');

    const total = await AuditLog.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user audit logs',
      error: error.message
    });
  }
});

export default router;