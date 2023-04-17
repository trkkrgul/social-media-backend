import mongoose from "mongoose";
import { Comment, Post } from "../models/index.js";

export const commentToPost = async (req, res) => {
  try {
    const { postId, content, userId } = req.body;

    const comment = new Comment({ post: postId, content, user: userId });
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
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "comments.childComments.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "comments.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "likers.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "dislikers.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
    ]);

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Post not found" });
  }
};
export default commentToPost;
