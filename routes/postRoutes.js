const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenication");
const upload = require("../middleware/upload");
const postController = require("../controllers/postController");
const likeController = require("../controllers/likeController");
const commentController = require("../controllers/commentController");

// Post routes
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  postController.createPost
);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPostById);
router.put("/:id", authenticateToken, postController.updatePost);
router.delete("/:id", authenticateToken, postController.deletePost);

// New routes for user posts and publishing
router.get("/user/posts", authenticateToken, postController.getUserPosts);
router.patch("/:postId/publish", authenticateToken, postController.publishPost);

// Like routes
router.post("/:postId/like", authenticateToken, likeController.toggleLike);
router.get("/:postId/likes/count", likeController.getLikeCount);
router.get(
  "/:postId/likes/status",
  authenticateToken,
  likeController.hasUserLiked
);

// Comment routes
router.post(
  "/:postId/comment",
  authenticateToken,
  commentController.createComment
);
router.get("/:postId/comments", commentController.getCommentsByPostId);
router.put("/comments/:id", authenticateToken, commentController.updateComment);
router.delete(
  "/comments/:id",
  authenticateToken,
  commentController.deleteComment
);

// New route for getting full post details
router.get("/:id/full", postController.getFullPostDetails);

module.exports = router;
