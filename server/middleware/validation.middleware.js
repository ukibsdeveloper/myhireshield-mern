import { body, query, validationResult } from 'express-validator';

/**
 * Global Validation Error Handler
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * 1. Company Registration Rules
 */
export const validateCompanyRegistration = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('industry').notEmpty().withMessage('Industry type is required'),
  body('companySize').notEmpty().withMessage('Company size is required'),
  body('contactPerson.name').trim().notEmpty().withMessage('Contact person name is required'),
  body('contactPerson.phone').notEmpty().withMessage('Contact phone is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
  validate
];

/**
 * 2. Employee Registration Rules
 */
export const validateEmployeeRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Minimum 6 characters required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  // ISO8601 ensure karta hai ki date YYYY-MM-DD format mein hi ho
  body('dateOfBirth').isISO8601().withMessage('DOB must be a valid date (YYYY-MM-DD)'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender selection'),
  validate
];

/**
 * 3. Login Rules
 */
export const validateLogin = [
  body('role').isIn(['company', 'employee', 'admin']).withMessage('Role is required'),
  body('password').notEmpty().withMessage('Password is required'),
  
  // Company ke liye email zaroori hai
  body('email').if(body('role').equals('company')).isEmail().withMessage('Email required for company login'),
  
  // Employee ke liye Name aur DOB zaroori hai
  body('firstName').if(body('role').equals('employee')).notEmpty().withMessage('First name required for employee login'),
  body('dateOfBirth').if(body('role').equals('employee')).isISO8601().withMessage('Valid DOB (YYYY-MM-DD) required'),
  
  validate
];

/**
 * 4. Review Submission Rules
 */
export const validateReview = [
  body('employeeId').isMongoId().withMessage('Invalid Employee ID format'),
  body('ratings.*').isInt({ min: 1, max: 10 }).withMessage('Ratings must be 1-10'),
  body('comment').trim().isLength({ min: 20 }).withMessage('Comment min 20 characters'),
  body('wouldRehire').isBoolean().withMessage('Rehire status must be boolean'),
  body('employmentDetails.startDate').isISO8601().withMessage('Valid start date required'),
  body('employmentDetails.endDate').isISO8601().withMessage('Valid end date required'),
  validate
];

/**
 * 5. Document Upload Rules
 */
export const validateDocumentUpload = [
  body('documentType').isIn(['aadhaar', 'pan', 'passport', 'driving_license', 'other']).withMessage('Invalid type'),
  validate
];

/**
 * 6. Search Rules (The Fix)
 */
export const validateEmployeeSearch = [
  // Query (Name) aur DOB ko validate karna zaroori hai taaki empty na jaye
  query('query').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
  query('dob').optional().isISO8601().withMessage('DOB must be YYYY-MM-DD'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validate
];