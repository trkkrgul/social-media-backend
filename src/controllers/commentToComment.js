import { Comment, Post, User } from "../models/index.js";
import mongoose from "mongoose";
export const commentToComment = async (req, res) => {
  try {
    const { parentComment, content, postId } = req.body;
    const { walletAddress } = req.user;
    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;
    const comment = new Comment({
      post: postId,
      parentComment: parentComment,
      content,
      user: userId,
    });
    await comment.save();
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const result = await Post.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },

      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },

      {
        $lookup: {
          from: "comments",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$post", "$$post_id"] }],
                },
              },
            },
            {
              $match: {
                $or: [
                  { parentComment: { $exists: false } },
                  { parentComment: null },
                ],
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
            {
              $lookup: {
                from: "comments",
                let: { parent_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$parentComment", "$$parent_id"] }],
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
                as: "replies",
              },
            },
          ],
          as: "comments",
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
        path: "comments.childComments.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "comments.user",
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

export default commentToComment;
