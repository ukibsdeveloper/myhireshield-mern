import express from 'express';
import {
  registerCompany,
  registerEmployee,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateCompanyRegistration,
  validateEmployeeRegistration,
  validateLogin,
  validate
} from '../middleware/validation.middleware.js';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register/company', registerLimiter, validateCompanyRegistration, validate, registerCompany);
router.post('/register/employee', registerLimiter, validateEmployeeRegistration, validate, registerEmployee);
router.post('/login', authLimiter, validateLogin, validate, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

export default router;