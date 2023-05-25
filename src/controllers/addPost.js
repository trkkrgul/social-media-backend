import postLikesComments from "../aggregates/postLikesComments.js";
import { Post, User } from "../models/index.js";
async function addPost(req, res) {
  try {
    const { content, media, token, tags, categories, userWalletAddress } =
      req.body;

    const user = await User.findOne({ walletAddress: userWalletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      content,
      media,
      token,
      tags,
      categories,
      user: user._id,
    });

    const savedPost = await newPost.save();
    const post = await Post.findById(savedPost._id);
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
}

export default addPost;
