const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { validateProperty } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', propertyController.getProperties);
router.get('/my-listings', authenticateToken, propertyController.getMyProperties);
router.get('/:id/similar', propertyController.getSimilarProperties);
router.get('/:id', propertyController.getPropertyById);

// Protected routes (Authentication required)
router.post('/', authenticateToken, validateProperty, propertyController.createProperty);
router.put('/:id', authenticateToken, validateProperty, propertyController.updateProperty);
router.delete('/:id', authenticateToken, propertyController.deleteProperty);

module.exports = router;
