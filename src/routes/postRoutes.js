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
import multer, { memoryStorage } from "multer";

const router = express.Router();

const storage = memoryStorage();
const uploadMw = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  }
}).array("images", 10);

//"Only .png, .jpg, .jpeg, .gif format allowed!"

router.post("/create", uploadMw, authMiddleware, createPost);
router.get("/feed", getPosts); 
router.post("/followingPosts", authMiddleware, getFollowingPosts);
router.get("/id/:postId", getPostById);
router.get("/wallet/:wallet", getPostsByWalletAddress);
router.get("/username/:username", getPostsByUserName);
router.post("/delete", authMiddleware, deletePost);
export default router;
