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
const FILESIZE = 5 * 1024 * 1024; // 5MB
const FILE_LIMIT = 4;

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
    fileSize: FILESIZE,
    files: FILE_LIMIT,
  }
}).array("images", FILE_LIMIT);

//"Only .png, .jpg, .jpeg, .gif format allowed!"

router.post("/create", uploadMw, authMiddleware, createPost);
router.get("/feed", getPosts); 
router.post("/followingPosts", authMiddleware, getFollowingPosts);
router.get("/id/:postId", getPostById);
router.get("/wallet/:wallet", getPostsByWalletAddress);
router.get("/username/:username", getPostsByUserName);
router.post("/delete", authMiddleware, deletePost);
export default router;
