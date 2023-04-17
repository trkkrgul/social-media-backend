import express from "express";
import { likePost, dislikePost } from "../controllers/index.js";

const router = express.Router();

router.post("/like", likePost);
router.post("/dislike", dislikePost);

export default router;
