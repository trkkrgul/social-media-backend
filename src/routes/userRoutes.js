import express from "express";
import {
  createProfile,
  followUser,
  getUserByWalletAddress,
  signup,
  updateProfile,
} from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";
import uploadMw from "../middleware/multerImageValidator.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/createProfile", uploadMw, authMiddleware, createProfile);
router.post("/updateProfile", uploadMw, authMiddleware, updateProfile);
router.get("/wallet/:wallet", getUserByWalletAddress);
router.post("/follow/:targetWallet", authMiddleware, followUser);
router.get("/", (req, res) => {
  res.send("Hello World");
});

export default router;
