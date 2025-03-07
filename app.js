const express = require("express");
const app = express();
const cors = require("cors"); // Import cors
require("dotenv").config(); // Import dotenv
app.use(express.json()); // Use express.json

app.use(cors());

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoute"); // Import authRoutes
const profileRoutes = require("./routes/profileRoute"); // Import userRoutes
const postRoutes = require("./routes/postRoutes"); // Import postRoutes
const commentRoutes = require("./routes/commentRoute"); // Import commentRoutes

// Routes
app.use("/api/auth", authRoutes); // Use authRoutes
app.use("/api/posts", postRoutes); // Use postRoutes
app.use("/api/profile", profileRoutes); // Use userRoutes
app.use("/api/comments", commentRoutes); // Use commentRoutes

app.get("/", (req, res) => {
  res.send("hello sjb");
});

const PORT = process.env.PORT || 8080;
const server = app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
      server.listen(PORT + 1);
    } else {
      console.error("Server error:", err);
    }
  });
