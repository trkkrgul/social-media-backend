import express from "express";
import { getStories, createStory } from "../controllers/index.js";
import authMiddleware from "../middleware/authValidator.js";
import uploadMw from "../middleware/multerImageValidator.js";
import uploadStoryValidator from "../middleware/multerStoryValidator.js";

const router = express.Router();
//"Only .png, .jpg, .jpeg, .gif format allowed!"

router.post("/create", uploadStoryValidator, authMiddleware, createStory);
router.get("/get", getStories);

export default router;
