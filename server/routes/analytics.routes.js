import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import Review from '../models/Review.model.js';
import Employee from '../models/Employee.model.js';
import Document from '../models/Document.model.js';
import AuditLog from '../models/AuditLog.model.js';

const router = express.Router();

// Get company analytics
router.get('/company', protect, authorize('company'), async (req, res) => {
  try {
    const Company = (await import('../models/Company.model.js')).default;
    const company = await Company.findOne({ userId: req.user._id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Get statistics
    const totalReviews = await Review.countDocuments({ companyId: company._id });
    const totalEmployees = await Review.distinct('employeeId', { companyId: company._id });
    
    // Get recent reviews
    const recentReviews = await Review.find({ companyId: company._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employeeId', 'firstName lastName email');

    // Get review trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reviewTrends = await Review.aggregate([
      {
        $match: {
          companyId: company._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalReviews,
        totalEmployees: totalEmployees.length,
        recentReviews,
        reviewTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get employee analytics
router.get('/employee', protect, authorize('employee'), async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Get statistics
    const totalReviews = await Review.countDocuments({ employeeId: employee._id });
    const totalDocuments = await Document.countDocuments({ employeeId: employee._id });
    const verifiedDocuments = await Document.countDocuments({ 
      employeeId: employee._id, 
      verificationStatus: 'verified' 
    });
    
    // Get profile views (from audit logs)
    const profileViews = await AuditLog.countDocuments({
      eventType: 'profile_viewed',
      targetId: employee._id.toString()
    });

    // Get recent reviews
    const recentReviews = await Review.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('companyId', 'companyName industry');

    // Calculate score breakdown
    const reviews = await Review.find({ employeeId: employee._id });
    const scoreBreakdown = {
      workQuality: 0,
      punctuality: 0,
      behavior: 0,
      teamwork: 0,
      communication: 0,
      technicalSkills: 0,
      problemSolving: 0,
      leadership: 0
    };

    if (reviews.length > 0) {
      reviews.forEach(review => {
        Object.keys(scoreBreakdown).forEach(key => {
          scoreBreakdown[key] += review.ratings[key] || 0;
        });
      });

      Object.keys(scoreBreakdown).forEach(key => {
        scoreBreakdown[key] = Math.round((scoreBreakdown[key] / reviews.length) * 10);
      });
    }

    res.json({
      success: true,
      data: {
        totalReviews,
        totalDocuments,
        verifiedDocuments,
        profileViews,
        overallScore: employee.overallScore,
        scoreBreakdown,
        recentReviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;