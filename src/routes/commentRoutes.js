import express from "express";
import { commentToPost, commentToComment } from "../controllers/index.js";

const router = express.Router();

router.post("/post", commentToPost);
router.post("/comment", commentToComment);

export default router;
