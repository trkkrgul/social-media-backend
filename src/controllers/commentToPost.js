import mongoose from "mongoose";
import { Comment, Post, User } from "../models/index.js";
import postLikesComments from "../aggregates/postLikesComments.js";

export const commentToPost = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const { walletAddress } = req.user;

    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;

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
      // ... rest of the pipeline
      ...postLikesComments,
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
    ]);

    res.status(200).json(posts[0]);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Post not found" });
  }
};
export default commentToPost;
