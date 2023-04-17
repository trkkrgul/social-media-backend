import express from "express";
import {
  checkSignature,
  checkUsername,
  generateNonce,
  getAuthUser,
} from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";

const router = express.Router();

router.post("/nonce", generateNonce);
router.post("/checkSignature", checkSignature);
router.get("/profile", authMiddleware, getAuthUser);
router.post("/checkUsername", checkUsername);

export default router;
