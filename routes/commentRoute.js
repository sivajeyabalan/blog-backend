const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authenication'); // Protect routes

// Route to create a new comment (protected)
router.post('/', authMiddleware, commentController.createComment);

// Route to update a comment by ID (protected)
router.put('/:id', authMiddleware, commentController.updateComment);

// Route to delete a comment by ID (protected)
router.delete('/:id', authMiddleware, commentController.deleteComment);

// Route to get all comments for a specific post (public or protected as desired)
router.get('/post/:postId', commentController.getCommentsByPostId);

module.exports = router;
