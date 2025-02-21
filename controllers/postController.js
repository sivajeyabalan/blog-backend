const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");
const express = require("express");
const app = express();
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));
exports.createPost = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to upload image", details: err.message });
    }

    try {
      const { title, content, published } = req.body;
      const userId = req.user.id;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const post = await prisma.post.create({
        data: {
          title,
          content,
          published: published === 'true', // Convert string to boolean
          imageUrl,
          authorId: userId,
        },
      });

      res.json({ success: true, post });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: "Failed to create post", details: error.message });
    }
  });
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: true, comments: true },
    });
    res.status(200).json(posts);
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
      where: { PostId: Number(id) },
      include: { author: true },
    });
    if (post) {
      res.status(200).json(post);
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
