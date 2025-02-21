const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new comment on a post
exports.createComment = async (req, res) => {
  const { postId, content } = req.body;
  // Assume req.user is set by authentication middleware
  const userId = req.user.id;
  
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        // Connect the comment to an existing post
        post: { connect: { id: postId } },
        // Connect the comment to the authenticated user as its author
        author: { connect: { id: userId } },
      },
    });
    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error: error.message });
  }
};

// Update an existing comment (only the comment author or an admin can update)
exports.updateComment = async (req, res) => {
  const { id } = req.params; // Comment ID to update
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Find the comment first
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Only allow update if the current user is the author or an admin
    if (comment.authorId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }
    
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });
    res.status(200).json({ message: "Comment updated successfully", comment: updatedComment });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error: error.message });
  }
};

// Delete a comment (only the comment author or an admin can delete)
exports.deleteComment = async (req, res) => {
  const { id } = req.params; // Comment ID to delete
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Only allow deletion if the user is the author or an admin
    if (comment.authorId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    
    await prisma.comment.delete({ where: { id } });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

// Get all comments for a given post
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        // Optionally, include author details
        author: {
          select: { id: true, email: true },
        },
      },
    });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving comments", error: error.message });
  }
};
