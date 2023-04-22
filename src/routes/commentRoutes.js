import express from "express";
import { commentToPost, commentToComment } from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";

const router = express.Router();

router.post("/post", authMiddleware, commentToPost);
router.post("/comment", authMiddleware, commentToComment);

export default router;
