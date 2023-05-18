import express from "express";
import {
  createProfile,
  followUser,
  getUserByWalletAddress,
  signup,
  updateProfile,
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

router.post("/signup", signup);
router.post("/createProfile", uploadMw, authMiddleware, createProfile);
router.post("/updateProfile", uploadMw, authMiddleware, updateProfile);
router.get("/wallet/:wallet", getUserByWalletAddress);
router.post("/follow/:targetWallet", authMiddleware, followUser);
router.get("/", (req, res) => {
  res.send("Hello World");
});

export default router;
