const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a new comment on a post
exports.createComment = async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // First check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: Number(postId) } },
        author: { connect: { id: userId } },
        username: req.user.email.split("@")[0], // Using the part before @ as username
        email: req.user.email,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Format the dates
    const formattedComment = {
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };

    res.status(201).json({
      message: "Comment created successfully",
      comment: formattedComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(500)
      .json({ message: "Error creating comment", error: error.message });
  }
};

// Update an existing comment (only the comment author or an admin can update)
exports.updateComment = async (req, res) => {
  const { id } = req.params; // Comment ID to update
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Find the comment first
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) }, // Added Number() conversion
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow update if the current user is the author or an admin
    if (comment.authorId !== userId && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this comment" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: Number(id) }, // Added Number() conversion
      data: { content },
    });
    res.status(200).json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating comment", error: error.message });
  }
};

// Delete a comment (only the comment author or an admin can delete)
exports.deleteComment = async (req, res) => {
  const { id } = req.params; // Comment ID to delete
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: Number(id) }, // Added Number() conversion
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only allow deletion if the user is the author or an admin
    if (comment.authorId !== userId && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: Number(id) } }); // Added Number() conversion
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

// Get all comments for a given post
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the dates for each comment
    const formattedComments = comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    }));

    res.status(200).json({ comments: formattedComments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving comments", error: error.message });
  }
};
