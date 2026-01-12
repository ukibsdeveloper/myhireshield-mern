import express from 'express';
import fs from 'fs';
import path from 'path';
import {
  uploadDocument,
  getEmployeeDocuments,
  verifyDocument,
  deleteDocument
} from '../controllers/document.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';
import { upload, handleMulterError } from '../middleware/upload.middleware.js';
import { validateDocumentUpload } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * --- PROTECTED ROUTES ---
 * Note: Sabhi document routes protected hain security reasons se.
 */

// 1. Upload Document (Employee Only)
// Sequence: Auth -> Role Check -> Rate Limit -> File Upload -> Data Validation -> Error Handler -> Controller
router.post(
  '/upload',
  protect,
  authorize('employee'),
  uploadLimiter,
  upload.single('document'),
  validateDocumentUpload,
  handleMulterError, // Catching file size/type errors specifically
  uploadDocument
);

// 2. Get Employee Documents (Employee owner or Company)
router.get(
  '/employee/:employeeId',
  protect,
  getEmployeeDocuments
);

// 3. Verify/Reject Document (Company/Admin Only)
router.put(
  '/:id/verify',
  protect,
  authorize('company', 'admin'),
  verifyDocument
);

// 4. Delete Document (Employee Owner Only)
router.delete(
  '/:id',
  protect,
  authorize('employee'),
  deleteDocument
);

// 5. Get My Documents (Employee Only)
router.get(
  '/my',
  protect,
  authorize('employee'),
  async (req, res) => {
    try {
      const documents = await Document.find({ employeeId: req.user.profileId })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: documents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching documents',
        error: error.message
      });
    }
  }
);

// 6. Download Document
router.get(
  '/:id/download',
  protect,
  async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check if user owns the document or is a company
      if (req.user.role === 'employee' && document.employeeId.toString() !== req.user.profileId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const filePath = path.join(__dirname, '..', 'uploads', 'documents', document.fileName);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      res.download(filePath, document.originalName);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error downloading document',
        error: error.message
      });
    }
  }
);

export default router;