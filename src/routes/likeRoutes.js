import express from "express";
import { likePost, dislikePost } from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";

const router = express.Router();

router.post("/like", authMiddleware, likePost);
router.post("/dislike", authMiddleware, dislikePost);

export default router;
