import express from 'express';
import {
  createReview,
  getEmployeeReviews,
  getCompanyReviews,
  updateReview,
  deleteReview,
  getReviewStats,
  getReviewById
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';
import { validateReview } from '../middleware/validation.middleware.js';

import { upload, handleMulterError } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * --- PUBLIC ROUTES ---
 * Ye routes employee ki ratings aur reviews dekhne ke liye hain
 */

// Get all reviews for a specific employee
router.get('/employee/:employeeId', getEmployeeReviews);

// Get aggregated statistics (Average ratings) for an employee
router.get('/stats/:employeeId', getReviewStats);

/**
 * --- PROTECTED ROUTES (Company Only) ---
 * In routes ke liye 'company' role aur Valid Token hona zaroori hai
 */

// Middleware to parse stringified JSON from FormData
const parseReviewData = (req, res, next) => {
  if (req.body.ratings && typeof req.body.ratings === 'string') {
    try { req.body.ratings = JSON.parse(req.body.ratings); } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid ratings format' });
    }
  }
  if (req.body.employmentDetails && typeof req.body.employmentDetails === 'string') {
    try { req.body.employmentDetails = JSON.parse(req.body.employmentDetails); } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid employment details format' });
    }
  }
  next();
};

// Create a new review (Includes Rate Limiting, File Uploads & Validation)
router.post(
  '/',
  protect,
  authorize('company'),
  upload.fields([
    { name: 'govId', maxCount: 1 },
    { name: 'expCert', maxCount: 1 }
  ]),
  handleMulterError,
  parseReviewData,
  reviewLimiter,
  validateReview,
  createReview
);

// Get all reviews posted by the logged-in company
router.get(
  '/company',
  protect,
  authorize('company'),
  getCompanyReviews
);

// Get a single review by ID
router.get(
  '/:id',
  protect,
  authorize('company'),
  getReviewById
);

// Update an existing review (Edit History track hogi controller mein)
router.put(
  '/:id',
  protect,
  authorize('company'),
  validateReview,
  updateReview
);

// Delete a review (Soft delete logic controller mein handle hai)
router.delete(
  '/:id',
  protect,
  authorize('company'),
  deleteReview
);

export default router;