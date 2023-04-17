import express from "express";
import { createProfile, signup, updateProfile } from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/createProfile", authMiddleware, createProfile);
router.post("/updateProfile", authMiddleware, updateProfile);
router.get("/", (req, res) => {
  res.send("Hello World");
});

export default router;
