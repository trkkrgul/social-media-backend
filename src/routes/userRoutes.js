import express from "express";
import {
  createProfile,
  followUser,
  getUserByWalletAddress,
  signup,
  updateLastSeen,
  updateProfile,
  getOnlineUsers,
} from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";
import uploadProfileMw from "../middleware/multerProfileImagesValidator.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/createProfile", uploadProfileMw, authMiddleware, createProfile);
router.post("/updateProfile", uploadProfileMw, authMiddleware, updateProfile);
router.get("/wallet/:wallet", getUserByWalletAddress);
router.post("/follow/:targetWallet", authMiddleware, followUser);
router.post("/updateLastSeen", authMiddleware, updateLastSeen);
router.get("/getOnlineUsers", getOnlineUsers);

router.get("/", (req, res) => {
  res.send("Hello World");
});

export default router;
