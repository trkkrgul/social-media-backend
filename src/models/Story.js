import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: false },
  type: { type: String, required: true, enum: ["image", "video", "audio"] },
  key: { type: String, required: false },
});

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  media: {
    type: mediaSchema,
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Story", storySchema);
export default Post;
