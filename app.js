const express = require("express");
const app = express();
const cors = require("cors"); // Import cors
require("dotenv").config(); // Import dotenv
app.use(express.json()); // Use express.json
app.use(cors({ origin: "http://localhost:5173" })); // Replace with frontend URL
app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoute"); // Import authRoutes
const profileRoutes = require("./routes/profileRoute"); // Import userRoutes
const postRoutes = require("./routes/postRoute"); // Import postRoutes
const commentRoutes = require("./routes/commentRoute"); // Import commentRoutes
const middleware = require("./middleware/authenication"); // Import middleware
app.use("/api/auth", authRoutes); // Use authRoutes
app.use("/api/posts", middleware, postRoutes); // Use postRoutes

//tested

app.use("/api/profile", middleware, profileRoutes); // Use userRoutes

app.use("/api/comments", middleware, commentRoutes); // Use commentRoutes
app.get('/' , (req , res) => {
    res.send("hello sjb");
})
app.listen(8080, () => {
  console.log(`Server is running on port 8080`);
});
