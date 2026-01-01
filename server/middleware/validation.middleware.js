import { body, validationResult } from 'express-validator';

// Handle validation errors
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

// Validation rules for company registration
export const validateCompanyRegistration = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
    // Removed company email restriction for development ease
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // Removed strict regex for development ease
  
  body('website')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Please provide a valid website URL'),
  
  body('industry')
    .notEmpty().withMessage('Industry is required'),
  
  body('companySize')
    .notEmpty().withMessage('Company size is required')
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  
  body('contactPerson.name')
    .trim()
    .notEmpty().withMessage('Contact person name is required'),
  
  body('contactPerson.phone')
    .trim()
    .notEmpty().withMessage('Contact person phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  
  body('contactPerson.designation')
    .trim()
    .notEmpty().withMessage('Contact person designation is required'),

  body('contactPerson.email')
    .trim()
    .notEmpty().withMessage('Contact person email is required')
    .isEmail().withMessage('Please provide a valid contact email'),
  
  validate
];

// Validation rules for employee registration
export const validateEmployeeRegistration = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // Removed strict regex for development ease
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid Indian phone number'),
  
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Please provide a valid date')
    .custom((value) => {
      const age = (new Date() - new Date(value)) / (1000 * 60 * 60 * 24 * 365);
      if (age < 18) {
        throw new Error('You must be at least 18 years old');
      }
      return true;
    }),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  
  validate
];

// Validation rules for login
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['company', 'employee', 'admin']).withMessage('Invalid role'),
  
  validate
];

// Validation rules for review submission
export const validateReview = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required')
    .isMongoId().withMessage('Invalid employee ID'),
  
  body('ratings.workQuality')
    .isInt({ min: 1, max: 10 }).withMessage('Work quality rating must be 1-10'),
  
  body('ratings.punctuality')
    .isInt({ min: 1, max: 10 }).withMessage('Punctuality rating must be 1-10'),
  
  body('ratings.behavior')
    .isInt({ min: 1, max: 10 }).withMessage('Behavior rating must be 1-10'),
  
  body('ratings.teamwork')
    .isInt({ min: 1, max: 10 }).withMessage('Teamwork rating must be 1-10'),
  
  body('ratings.communication')
    .isInt({ min: 1, max: 10 }).withMessage('Communication rating must be 1-10'),
  
  body('ratings.technicalSkills')
    .isInt({ min: 1, max: 10 }).withMessage('Technical skills rating must be 1-10'),
  
  body('ratings.problemSolving')
    .isInt({ min: 1, max: 10 }).withMessage('Problem solving rating must be 1-10'),
  
  body('ratings.reliability')
    .isInt({ min: 1, max: 10 }).withMessage('Reliability rating must be 1-10'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 50, max: 2000 }).withMessage('Comment must be 50-2000 characters'),
  
  body('wouldRehire')
    .isBoolean().withMessage('Would rehire must be true or false'),
  
  body('employmentDetails.designation')
    .trim()
    .notEmpty().withMessage('Designation is required'),
  
  body('employmentDetails.startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date'),
  
  body('employmentDetails.endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.employmentDetails.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  validate
];

// Validation rules for document upload
export const validateDocumentUpload = [
  body('documentType')
    .notEmpty().withMessage('Document type is required')
    .isIn([
      'aadhaar', 'pan', 'passport', 'driving_license',
      'educational_certificate', 'experience_letter',
      'police_verification', 'address_proof', 'bank_statement', 'other'
    ]).withMessage('Invalid document type'),
  
  body('documentNumber')
    .optional()
    .trim(),
  
  validate
];

// Validation rules for employee search
export const validateEmployeeSearch = [
  body('query')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),
  
  body('scoreMin')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Score min must be 0-100'),
  
  body('scoreMax')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Score max must be 0-100'),
  
  validate
];