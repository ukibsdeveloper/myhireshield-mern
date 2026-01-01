import express from 'express';
import {
  createReview,
  getEmployeeReviews,
  getCompanyReviews,
  updateReview,
  deleteReview,
  getReviewStats
} from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/employee/:employeeId', getEmployeeReviews);
router.get('/stats/:employeeId', getReviewStats);

// Protected routes (Company only)
router.post('/', protect, authorize('company'), createReview);
router.get('/company', protect, authorize('company'), getCompanyReviews);
router.put('/:id', protect, authorize('company'), updateReview);
router.delete('/:id', protect, authorize('company'), deleteReview);

export default router;