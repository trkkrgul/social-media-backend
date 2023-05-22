import express from "express";
import {
  createPost,
  getPostById,
  getPostsByWalletAddress,
  getPosts,
  getPostsByUserName,
  deletePost,
  getFollowingPosts,
} from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";
import uploadMw from "../middleware/multerImageValidator.js";

const router = express.Router();
//"Only .png, .jpg, .jpeg, .gif format allowed!"

router.post("/create", uploadMw, authMiddleware, createPost);
router.get("/feed", getPosts);
router.post("/followingPosts", authMiddleware, getFollowingPosts);
router.get("/id/:postId", getPostById);
router.get("/wallet/:wallet", getPostsByWalletAddress);
router.get("/username/:username", getPostsByUserName);
router.post("/delete", authMiddleware, deletePost);
export default router;
