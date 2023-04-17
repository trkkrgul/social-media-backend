import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  postRoutes,
  userRoutes,
  commentRoutes,
  likeRoutes,
  authRoutes,
} from "./routes/index.js";
import connectDB from "./services/mongoDB.js";
// Initialize dotenv to load environment variables
dotenv.config();

// Create Express app
const app = express();

//Connect to database

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/auth", authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal server error");
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
