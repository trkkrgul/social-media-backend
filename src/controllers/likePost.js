import mongoose from "mongoose";
import { Like, Post, User } from "../models/index.js";
export const likePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const { walletAddress } = req.user;

    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;

    const existingLike = await Like.findOne({
      targetId: postId,
      targetType: "post",
      user: userId,
    });
    if (existingLike) {
      if (existingLike.isDislike) {
        existingLike.isDislike = false;
        await existingLike.save();
      } else {
        await Like.deleteOne({ _id: existingLike._id });
      }
    } else {
      const like = new Like({
        targetId: postId,
        targetType: "post",
        user: userId,
      });
      await like.save();
    }
    const post = await Post.findById(postId);
    if (!post) {
    }
    const result = await Post.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "likes",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetType", "post"] },
                    { $eq: ["$targetId", "$$post_id"] },
                    { $eq: ["$isDislike", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
              },
            },
          ],
          as: "likers",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetType", "post"] },
                    { $eq: ["$targetId", "$$post_id"] },
                    { $eq: ["$isDislike", true] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
              },
            },
          ],
          as: "dislikers",
        },
      },
      // ... rest of the pipeline
    ]);

    const posts = await Post.populate(result, [
      {
        path: "user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "likers.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "dislikers.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
    ]);
    
    res.status(200).json(posts[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export default likePost;
