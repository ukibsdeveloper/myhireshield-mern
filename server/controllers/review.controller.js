import Review from '../models/Review.model.js';
import Employee from '../models/Employee.model.js';
import Company from '../models/Company.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { sendEmail } from '../utils/email.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Company only)
// server/controllers/review.controller.js




// server/controllers/review.controller.js

export const createReview = async (req, res) => {
  try {
    const { employeeId, ratings, employmentDetails, comment, wouldRehire } = req.body;

    // Data structuring aur explicit Number conversion taaki "NaN" na aaye
    const reviewData = {
      companyId: req.user.profileId,
      employeeId,
      ratings: {
        workQuality: Number(ratings.workQuality) || 1,
        punctuality: Number(ratings.punctuality) || 1,
        behavior: Number(ratings.behavior) || 1,
        teamwork: Number(ratings.teamwork) || 1,
        communication: Number(ratings.communication) || 1,
        technicalSkills: Number(ratings.technicalSkills) || 1,
        problemSolving: Number(ratings.problemSolving) || 1,
        reliability: Number(ratings.reliability) || 1
      },
      employmentDetails: {
        designation: employmentDetails.designation,
        startDate: new Date(employmentDetails.startDate),
        endDate: new Date(employmentDetails.endDate),
        employmentType: employmentDetails.employmentType
      },
      comment,
      wouldRehire: Boolean(wouldRehire)
    };

    // Review create
    const review = await Review.create(reviewData);

    // Score Update logic
    const employee = await Employee.findById(employeeId);
    if (employee) {
      await employee.updateScore();
    }

    return res.status(201).json({ success: true, data: review });

  } catch (error) {
    console.error("Review Controller Error:", error.message);
    
    // Yahan hum next(error) nahi bhejenge, seedha JSON response denge
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get reviews for an employee
// @route   GET /api/reviews/employee/:employeeId
// @access  Public (if employee has consent)
export const getEmployeeReviews = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if employee exists and has consent
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!employee.profileVisible || !employee.consentGiven) {
      return res.status(403).json({
        success: false,
        message: 'Employee profile is not public'
      });
    }

    // Get reviews
    const reviews = await Review.find({
      employeeId,
      isActive: true
    })
      .populate('companyId', 'companyName industry logo verified')
      .sort({ createdAt: -1 });

    // Log profile view
    if (req.user) {
      await AuditLog.createLog({
        userId: req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        eventType: 'review_viewed',
        eventData: {
          employeeId,
          reviewCount: reviews.length
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success'
      });
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error('Get employee reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get company's reviews
// @route   GET /api/reviews/company
// @access  Private (Company only)
export const getCompanyReviews = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    const reviews = await Review.find({
      companyId: company._id,
      isActive: true
    })
      .populate('employeeId', 'firstName lastName email currentDesignation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error('Get company reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Company only - own reviews)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratings, comment, wouldRehire } = req.body;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    const company = await Company.findOne({ userId: req.user._id });
    if (!company || review.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update review
    if (ratings) {
      review.ratings = ratings;
      const ratingsArray = Object.values(ratings);
      review.averageRating = ratingsArray.reduce((a, b) => a + b, 0) / ratingsArray.length;
    }
    if (comment) review.comment = comment;
    if (wouldRehire !== undefined) review.wouldRehire = wouldRehire;

    review.editHistory.push({
      editedAt: Date.now(),
      editedBy: req.user._id,
      changes: { ratings, comment, wouldRehire }
    });

    await review.save();

    // Update employee score
    const employee = await Employee.findById(review.employeeId);
    await employee.updateScore();

    // Create audit log
    await AuditLog.createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: 'company',
      eventType: 'review_updated',
      eventData: {
        reviewId: review._id,
        employeeId: review.employeeId
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Company only - own reviews)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    const company = await Company.findOne({ userId: req.user._id });
    if (!company || review.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Soft delete
    review.isActive = false;
    review.deletedAt = Date.now();
    await review.save();

    // Update employee score
    const employee = await Employee.findById(review.employeeId);
    await employee.updateScore();

    // Update company statistics
    await company.updateStatistics();

    // Create audit log
    await AuditLog.createLog({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: 'company',
      eventType: 'review_deleted',
      eventData: {
        reviewId: review._id,
        employeeId: review.employeeId
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Get review statistics for employee
// @route   GET /api/reviews/stats/:employeeId
// @access  Public
export const getReviewStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const stats = await Review.aggregate([
      {
        $match: {
          employeeId: mongoose.Types.ObjectId(employeeId),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgWorkQuality: { $avg: '$ratings.workQuality' },
          avgPunctuality: { $avg: '$ratings.punctuality' },
          avgBehavior: { $avg: '$ratings.behavior' },
          avgTeamwork: { $avg: '$ratings.teamwork' },
          avgCommunication: { $avg: '$ratings.communication' },
          avgTechnicalSkills: { $avg: '$ratings.technicalSkills' },
          avgProblemSolving: { $avg: '$ratings.problemSolving' },
          avgReliability: { $avg: '$ratings.reliability' },
          avgOverall: { $avg: '$averageRating' },
          wouldRehireCount: {
            $sum: { $cond: ['$wouldRehire', 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {}
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review statistics',
      error: error.message
    });
  }
};

