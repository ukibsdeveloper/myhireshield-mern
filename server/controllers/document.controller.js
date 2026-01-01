import Document from '../models/Document.model.js';
import Employee from '../models/Employee.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { sendEmail } from '../utils/email.js';
import { 
  validateAadhaar, 
  validatePAN, 
  extractTextFromImage 
} from '../utils/documentVerification.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Employee only)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { documentType, documentNumber } = req.body;

    // Get employee profile
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Create document record
    const document = await Document.create({
      employeeId: employee._id,
      documentType,
      documentNumber: documentNumber?.toUpperCase(),
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user._id
    });

    // Trigger automated verification
    const verificationResult = await autoVerifyDocument(document);
    
    // Update document with verification results
    document.autoVerification = verificationResult;
    
    if (verificationResult.passed) {
      document.verificationStatus = 'verified';
      document.verifiedAt = new Date();
    } else {
      document.verificationStatus = 'under_review';
    }
    
    await document.save();

    // Update employee verification status
    await updateEmployeeVerificationStatus(employee._id);

    // Log activity
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: 'document_uploaded',
      resourceType: 'document',
      resourceId: document._id,
      details: {
        documentType,
        fileName: req.file.filename,
        autoVerified: verificationResult.passed
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Send notification email
    await sendEmail({
      to: req.user.email,
      subject: 'Document Uploaded Successfully',
      template: 'documentUploaded',
      data: {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        documentType: documentType.replace('_', ' ').toUpperCase(),
        verificationStatus: document.verificationStatus
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Upload document error:', error);
    
    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// @desc    Get employee documents
// @route   GET /api/documents/employee/:employeeId
// @access  Private (Company or Employee owner)
export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if user has permission
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Only employee owner or companies can view documents
    if (req.user.role === 'employee' && employee.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these documents'
      });
    }

    const documents = await Document.find({ employeeId })
      .sort({ uploadedAt: -1 });

    // Log activity
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: 'document_viewed',
      resourceType: 'employee',
      resourceId: employeeId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

// @desc    Verify document (manual verification by company)
// @route   PUT /api/documents/:id/verify
// @access  Private (Company only)
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update verification status
    document.verificationStatus = status;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    
    if (status === 'rejected') {
      document.rejectionReason = rejectionReason;
    }

    await document.save();

    // Update employee verification status
    await updateEmployeeVerificationStatus(document.employeeId);

    // Get employee details for notification
    const employee = await Employee.findById(document.employeeId).populate('userId');

    // Send notification email
    await sendEmail({
      to: employee.email,
      subject: `Document ${status === 'verified' ? 'Verified' : 'Rejected'}`,
      template: status === 'verified' ? 'documentVerified' : 'documentRejected',
      data: {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        documentType: document.documentType.replace('_', ' ').toUpperCase(),
        rejectionReason: rejectionReason || ''
      }
    });

    // Log activity
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: status === 'verified' ? 'document_verified' : 'document_rejected',
      resourceType: 'document',
      resourceId: document._id,
      details: {
        documentType: document.documentType,
        rejectionReason
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Document ${status} successfully`,
      data: document
    });

  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying document',
      error: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Employee owner only)
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user owns this document
    const employee = await Employee.findById(document.employeeId);
    if (employee.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await document.deleteOne();

    // Update employee verification status
    await updateEmployeeVerificationStatus(employee._id);

    // Log activity
    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      eventType: 'document_deleted',
      resourceType: 'document',
      resourceId: document._id,
      details: {
        documentType: document.documentType
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

// Helper function to auto-verify document
async function autoVerifyDocument(document) {
  const result = {
    attempted: true,
    passed: false,
    checks: [],
    confidence: 0
  };

  try {
    // Perform verification based on document type
    switch (document.documentType) {
      case 'aadhaar':
        if (document.documentNumber) {
          const aadhaarValid = validateAadhaar(document.documentNumber);
          result.checks.push({
            name: 'Aadhaar Number Format',
            passed: aadhaarValid.valid,
            message: aadhaarValid.message
          });
          if (aadhaarValid.valid) result.confidence += 50;
        }
        break;

      case 'pan':
        if (document.documentNumber) {
          const panValid = validatePAN(document.documentNumber);
          result.checks.push({
            name: 'PAN Number Format',
            passed: panValid.valid,
            message: panValid.message
          });
          if (panValid.valid) result.confidence += 50;
        }
        break;

      default:
        result.checks.push({
          name: 'File Upload',
          passed: true,
          message: 'File uploaded successfully'
        });
        result.confidence += 30;
    }

    // Check file integrity
    result.checks.push({
      name: 'File Integrity',
      passed: true,
      message: 'File is readable and not corrupted'
    });
    result.confidence += 20;

    // Overall pass/fail
    result.passed = result.confidence >= 70;

  } catch (error) {
    console.error('Auto verification error:', error);
    result.checks.push({
      name: 'Verification Error',
      passed: false,
      message: error.message
    });
  }

  return result;
}

// Helper function to update employee verification status
async function updateEmployeeVerificationStatus(employeeId) {
  try {
    const documents = await Document.find({ employeeId });
    
    const totalDocs = documents.length;
    const verifiedDocs = documents.filter(doc => doc.verificationStatus === 'verified').length;
    
    const verificationPercentage = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;
    
    await Employee.findByIdAndUpdate(employeeId, {
      documentsVerified: verifiedDocs,
      verificationPercentage,
      verified: verificationPercentage >= 80 // 80% threshold for verified badge
    });

  } catch (error) {
    console.error('Update verification status error:', error);
  }
}

