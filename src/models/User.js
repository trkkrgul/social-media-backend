import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  isProfileCreated: { type: Boolean, default: false },
  profilePicturePath: { type: String },
  coverPicturePath: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followings: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  username: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  isKYCED: { type: Boolean, default: false },
  telegramId: { type: String },
  twitterId: { type: String },
  discordId: { type: String },
  biography: { type: String },
  gender: { type: String },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isBlocked: { type: Boolean, default: false },
  nonce: { type: Number, default: 0 },
  lastSeen: { type: Date, default: new Date() },
});

const User = mongoose.model("User", userSchema);
export default User;
