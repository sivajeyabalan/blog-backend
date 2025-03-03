const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { authenticateToken } = require("../middleware/authenication");

// Route to create a new comment (protected)
router.post("/", authenticateToken, commentController.createComment);

// Route to update a comment by ID (protected)
router.put("/:id", authenticateToken, commentController.updateComment);

// Route to delete a comment by ID (protected)
router.delete("/:id", authenticateToken, commentController.deleteComment);

// Route to get all comments for a specific post (public or protected as desired)
router.get("/post/:postId", commentController.getCommentsByPostId);

module.exports = router;
