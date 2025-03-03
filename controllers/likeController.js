const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Toggle like on a post
exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: Number(postId),
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          postId_userId: {
            postId: Number(postId),
            userId: userId,
          },
        },
      });
      res.json({ message: "Post unliked successfully", liked: false });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          post: { connect: { id: Number(postId) } },
          user: { connect: { id: userId } },
        },
      });
      res.json({ message: "Post liked successfully", liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res
      .status(500)
      .json({ message: "Error toggling like", error: error.message });
  }
};

// Get like count for a post
exports.getLikeCount = async (req, res) => {
  const { postId } = req.params;

  try {
    const likeCount = await prisma.like.count({
      where: { postId: Number(postId) },
    });

    res.json({ likeCount });
  } catch (error) {
    console.error("Error getting like count:", error);
    res
      .status(500)
      .json({ message: "Error getting like count", error: error.message });
  }
};

// Check if user has liked a post
exports.hasUserLiked = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: Number(postId),
          userId: userId,
        },
      },
    });

    res.json({ hasLiked: !!like });
  } catch (error) {
    console.error("Error checking like status:", error);
    res
      .status(500)
      .json({ message: "Error checking like status", error: error.message });
  }
};
