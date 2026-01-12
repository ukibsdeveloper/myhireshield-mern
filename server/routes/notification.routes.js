import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Mock notification data - in a real app, this would be a database model
let notifications = [
  {
    id: 1,
    userId: 'user1',
    title: 'Document Verified',
    message: 'Your identity document has been verified successfully.',
    type: 'success',
    read: false,
    createdAt: new Date()
  },
  {
    id: 2,
    userId: 'user1',
    title: 'Review Received',
    message: 'A new review has been posted about your performance.',
    type: 'info',
    read: false,
    createdAt: new Date()
  }
];

/**
 * @desc    Get all notifications for user
 * @route   GET /api/notifications
 * @access  Private
 */
router.get('/', protect, apiLimiter, (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user._id.toString());

    res.status(200).json({
      success: true,
      data: userNotifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
router.put('/:id/read', protect, apiLimiter, (req, res) => {
  try {
    const notification = notifications.find(n => n.id === parseInt(req.params.id));

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    notification.read = true;

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
router.put('/read-all', protect, apiLimiter, (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user._id.toString());
    userNotifications.forEach(n => n.read = true);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
router.delete('/:id', protect, apiLimiter, (req, res) => {
  try {
    const index = notifications.findIndex(n => n.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notifications[index].userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    notifications.splice(index, 1);

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

export default router;