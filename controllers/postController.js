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
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorid !== userId || req.user.role !== "ADMIN") {
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
  const { id } = req.params;
  const { title, content, published } = req.body;
  const userId = req.user.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorid !== userId || req.user.role !== "ADMIN") {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this post" });
    }
    const deletedPost = await prisma.post.delete({
      where: { id: Number(id) },
    });
    res
      .status(200)
      .json({ message: "Post deleted successfully", post: deletedPost });
  } catch (err) {
    res.status(500).json({ message: "Error deleted post", error: err.message });
  }
};
