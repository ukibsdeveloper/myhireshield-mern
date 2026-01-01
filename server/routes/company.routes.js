import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get company profile
router.get('/profile', protect, authorize('company'), async (req, res) => {
  try {
    const Company = (await import('../models/Company.model.js')).default;
    const company = await Company.findOne({ userId: req.user._id });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update company profile
router.put('/profile', protect, authorize('company'), async (req, res) => {
  try {
    const Company = (await import('../models/Company.model.js')).default;
    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;