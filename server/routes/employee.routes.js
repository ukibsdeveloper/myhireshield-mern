import express from 'express';
import {
  searchEmployees,
  getEmployeeById,
  getMyProfile,
  updateProfile,
  updateVisibility,
  giveConsent,
  exportData,
  deleteAccount,
  getEmployeeStats
} from '../controllers/employee.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/search', searchLimiter, searchEmployees);
router.get('/:id', getEmployeeById);
router.get('/:id/stats', getEmployeeStats);

// Protected routes (Employee only)
router.get('/profile/me', protect, authorize('employee'), getMyProfile);
router.put('/profile', protect, authorize('employee'), updateProfile);
router.put('/visibility', protect, authorize('employee'), updateVisibility);
router.post('/consent', protect, authorize('employee'), giveConsent);
router.get('/export/data', protect, authorize('employee'), exportData);
router.delete('/account', protect, authorize('employee'), deleteAccount);

export default router;