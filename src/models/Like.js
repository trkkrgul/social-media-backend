import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["post", "comment"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isDislike: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Like = mongoose.model("Like", likeSchema);
export default Like;
