import express from 'express';
import {
  uploadDocument,
  getEmployeeDocuments,
  verifyDocument,
  deleteDocument
} from '../controllers/document.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Protected routes
router.post('/upload', protect, authorize('employee'), uploadLimiter, upload.single('document'), uploadDocument);
router.get('/employee/:employeeId', protect, getEmployeeDocuments);
router.put('/:id/verify', protect, authorize('company'), verifyDocument);
router.delete('/:id', protect, authorize('employee'), deleteDocument);

export default router;