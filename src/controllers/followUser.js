import { User, Follow } from "../models/index.js";
import mongoose from "mongoose";
async function followUser(req, res) {
  try {
    const { targetWallet } = req.params;
    const { walletAddress } = req.user;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetUser = await User.findOne({ walletAddress: targetWallet });
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const followerId = user._id;
    const followingId = targetUser._id;
    if (targetUser.followers.includes(followerId)) {
      targetUser.followers.pull(followerId);
      user.followings.pull(followingId);
      await targetUser.save();
      await user.save();
      return res.status(200).json({ user, targetUser });
    }

    targetUser.followers.push(followerId);
    user.followings.push(followingId);
    await targetUser.save();
    await user.save();
    res.status(200).json({ user, targetUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export default followUser;
