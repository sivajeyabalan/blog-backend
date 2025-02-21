const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authenication'); // Ensure user is authenticated

// Get profile
router.get('/', authMiddleware, profileController.getProfile);

// Update profile
router.put('/', authMiddleware, profileController.updateProfile);

module.exports = router;
