import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ["image", "video", "audio"] },
});

const tokenSchema = new mongoose.Schema({
  chainId: { type: String, required: true },
  contractAddress: { type: String, required: true },
});

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  media: {
    type: [mediaSchema],
    validate: [
      {
        validator: function (mediaArr) {
          if (mediaArr.length === 0) {
            return true;
          }

          const firstMediaType = mediaArr[0].type;
          if (firstMediaType === "image" && mediaArr.length <= 4) {
            return mediaArr.every((media) => media.type === "image");
          } else {
            return mediaArr.length === 1;
          }
        },
        message: "Invalid media combination",
      },
    ],
  },
  token: tokenSchema,

  tags: [{ type: String }],
  categories: [{ type: String }],
  isRestricted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
export default Post;
