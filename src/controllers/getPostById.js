import mongoose from "mongoose";
import { Post, User, Comment, Like } from "../models/index.js";
import postLikesComments from "../aggregates/postLikesComments.js";
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const result = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $match: {
          _id: new mongoose.Types.ObjectId(postId),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },

      ...postLikesComments,
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

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Post not found" });
  }
};

export default getPostById;
