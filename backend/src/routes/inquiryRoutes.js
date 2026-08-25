const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { validateInquiry } = require('../middleware/validate');
const { optionalAuth, authenticateToken } = require('../middleware/authMiddleware');
const { inquiryLimiter } = require('../middleware/rateLimiter');

// Submit lead inquiry (rate limited, optional auth to record user id)
router.post('/', inquiryLimiter, optionalAuth, validateInquiry, inquiryController.createInquiry);

// Get inquiries received by property owner (Protected)
router.get('/received', authenticateToken, inquiryController.getMyReceivedInquiries);

module.exports = router;
