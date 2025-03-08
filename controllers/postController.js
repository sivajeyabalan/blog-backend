const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
  try {
    const { title, content, published } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published == "true",
        imageUrl,
        authorId: userId,
      },
    });

    res.json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ error: "Failed to create post", details: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to include readable dates
    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    }));

    res.status(200).json(formattedPosts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving posts", error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const postId = parseInt(id, 10); // Convert id to an integer

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    console.log("Fetching post with ID:", postId);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
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
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (post) {
      // Format the response to include readable dates
      const formattedPost = {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        comments: post.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        })),
      };
      res.status(200).json(formattedPost);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving post", error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;
  const userId = req.user.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        authorId: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId && req.user.role !== "ADMIN") {
      console.log(post.authorId, userId, req.user.role);
      return res
        .status(401)
        .json({ message: "You are not authorized to update this post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: { title, content, published },
    });
    res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating post", error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    // Extract the ID from the request parameters
    const { id } = req.params;

    // Verify we have an ID
    if (!id) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    // Convert ID to integer
    const postId = parseInt(id, 10);

    // Check if the conversion resulted in a valid number
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const userId = req.user.id;

    // Now use the properly converted ID in your Prisma query
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId && req.user.role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this post" });
    }

    // Delete related records first (if necessary)
    await prisma.like.deleteMany({
      where: { postId: postId },
    });

    await prisma.comment.deleteMany({
      where: { postId: postId },
    });

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({
      message: "Error deleting post",
      error: err.message,
    });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to include readable dates
    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    }));

    // Separate posts into published and unpublished
    const response = {
      published: formattedPosts.filter((post) => post.published),
      unpublished: formattedPosts.filter((post) => !post.published),
    };

    res.status(200).json(response);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving user posts", error: err.message });
  }
};

exports.publishPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not authorized to publish this post" });
    }

    // Update post to published
    const updatedPost = await prisma.post.update({
      where: { id: Number(postId) },
      data: { published: true },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Format the response
    const formattedPost = {
      ...updatedPost,
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
      comments: updatedPost.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };

    res.status(200).json({
      message: "Post published successfully",
      post: formattedPost,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error publishing post", error: err.message });
  }
};

exports.getFullPostDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
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
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (post) {
      // Format the response to include readable dates
      const formattedPost = {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        comments: post.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        })),
      };
      res.status(200).json(formattedPost);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving post details", error: err.message });
  }
};

exports.getPostsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const skip = (page - 1) * limit;

    // Count total number of posts
    const totalPosts = await prisma.post.count();

    // Calculate total pages
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await prisma.post.findMany({
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response to include readable dates
    const formattedPosts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: post.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    }));

    // Send response with posts and total pages
    res.status(200).json({
      posts: formattedPosts,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving paginated posts",
      error: err.message,
    });
  }
};
