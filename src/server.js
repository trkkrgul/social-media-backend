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
import multer from "multer";
// Initialize dotenv to load environment variables
dotenv.config();

// Create Express app
const app = express();

//Connect to database

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/auth", authRoutes);



// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack, err.code);
  if(err instanceof multer.MulterError){
    if(err.code === 'LIMIT_FILE_SIZE'){
      return res.status(400).json({
        message: 'File is too large!'
      })
    }
    if(err.code === 'LIMIT_FILE_COUNT'){
      return res.status(400).json({
        message: 'File limit reached!'
      })
    }
    if(err.code === "LIMIT_UNEXPECTED_FILE"){
      next(err);
      return res.status(400).json({
        message: 'Only .png, .jpg, .jpeg, .gif format allowed!'
      })
    }
  }

  res.status(500).send("Internal server error");
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
