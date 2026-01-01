// Document Verification Utilities

// Validate Aadhaar number using Verhoeff algorithm
export const validateAadhaar = (aadhaarNumber) => {
  // Remove spaces and validate format
  const cleaned = aadhaarNumber.replace(/\s/g, '');
  
  // Must be 12 digits
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: 'Aadhaar must be 12 digits' };
  }
  
  // Verhoeff algorithm
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  let c = 0;
  const reversedArray = cleaned.split('').map(Number).reverse();
  
  reversedArray.forEach((val, i) => {
    c = d[c][p[i % 8][val]];
  });
  
  if (c !== 0) {
    return { valid: false, error: 'Invalid Aadhaar number' };
  }
  
  return { valid: true, message: 'Valid Aadhaar number' };
};

// Validate PAN number
export const validatePAN = (panNumber) => {
  // Remove spaces and convert to uppercase
  const cleaned = panNumber.replace(/\s/g, '').toUpperCase();
  
  // PAN format: AAAAA9999A
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid PAN format. Format should be: AAAAA9999A' };
  }
  
  // Fourth character should be 'P' for individual, 'C' for company, etc.
  const fourthChar = cleaned[3];
  const validFourthChars = ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'];
  
  if (!validFourthChars.includes(fourthChar)) {
    return { valid: false, error: 'Invalid PAN type' };
  }
  
  return { valid: true, message: 'Valid PAN number' };
};

// Validate Passport number
export const validatePassport = (passportNumber) => {
  // Remove spaces and convert to uppercase
  const cleaned = passportNumber.replace(/\s/g, '').toUpperCase();
  
  // Indian passport format: A-Z followed by 7 digits
  const passportRegex = /^[A-Z]{1}[0-9]{7}$/;
  
  if (!passportRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid passport format. Format should be: A1234567' };
  }
  
  return { valid: true, message: 'Valid passport number' };
};

// Validate Driving License
export const validateDrivingLicense = (dlNumber) => {
  // Remove spaces and convert to uppercase
  const cleaned = dlNumber.replace(/\s/g, '').toUpperCase();
  
  // Indian DL format varies by state, but generally: AA00 00000000000
  const dlRegex = /^[A-Z]{2}[0-9]{2}\s?[0-9]{11}$/;
  
  if (!dlRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid driving license format' };
  }
  
  return { valid: true, message: 'Valid driving license number' };
};

// Validate GSTIN
export const validateGSTIN = (gstin) => {
  // Remove spaces and convert to uppercase
  const cleaned = gstin.replace(/\s/g, '').toUpperCase();
  
  // GSTIN format: 15 characters
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid GSTIN format' };
  }
  
  return { valid: true, message: 'Valid GSTIN' };
};

// Extract text from image using OCR (placeholder - requires actual OCR library)
export const extractTextFromImage = async (imagePath) => {
  try {
    // TODO: Implement actual OCR using Tesseract.js or Google Vision API
    // For now, return placeholder
    return {
      success: true,
      text: 'OCR text extraction would go here',
      confidence: 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Automated document verification
export const autoVerifyDocument = async (document) => {
  const results = {
    attempted: true,
    passed: false,
    checks: {},
    confidence: 0
  };

  try {
    // Validate document number based on type
    switch (document.documentType) {
      case 'aadhaar':
        if (document.documentNumber) {
          const aadhaarResult = validateAadhaar(document.documentNumber);
          results.checks.numberValidation = aadhaarResult.valid;
          results.confidence += aadhaarResult.valid ? 30 : 0;
        }
        break;
        
      case 'pan':
        if (document.documentNumber) {
          const panResult = validatePAN(document.documentNumber);
          results.checks.numberValidation = panResult.valid;
          results.confidence += panResult.valid ? 30 : 0;
        }
        break;
        
      case 'passport':
        if (document.documentNumber) {
          const passportResult = validatePassport(document.documentNumber);
          results.checks.numberValidation = passportResult.valid;
          results.confidence += passportResult.valid ? 30 : 0;
        }
        break;
        
      case 'driving_license':
        if (document.documentNumber) {
          const dlResult = validateDrivingLicense(document.documentNumber);
          results.checks.numberValidation = dlResult.valid;
          results.confidence += dlResult.valid ? 30 : 0;
        }
        break;
    }

    // Check file integrity
    results.checks.fileIntegrity = document.fileSize > 0 && document.fileSize < 10485760;
    results.confidence += results.checks.fileIntegrity ? 20 : 0;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    results.checks.fileType = validTypes.includes(document.mimeType);
    results.confidence += results.checks.fileType ? 20 : 0;

    // Overall pass/fail
    results.passed = results.confidence >= 50;

  } catch (error) {
    console.error('Auto verification error:', error);
    results.error = error.message;
  }

  return results;
};