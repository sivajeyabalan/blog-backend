const express = require('express');
const router = express.Router();
const { login , register , logout  , getUser} = require('../controllers/authController');  // Import login and register from authController , 
// Example route
router.post('/login', login);
router.post('/register', register);
router.get('/logout', logout);
router.get("/me", getUser);
module.exports = router;  // Ensure this is exporting the router
