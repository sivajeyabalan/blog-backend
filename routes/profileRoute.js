const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { authenticateToken } = require("../middleware/authenication");

// Get profile
router.get("/", authenticateToken, profileController.getProfile);

// Update profile
router.put("/", authenticateToken, profileController.updateProfile);

module.exports = router;
