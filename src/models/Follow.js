import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["user"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Follow = mongoose.model("Follow", followSchema);
export default Follow;
