import { Post, User } from "../models/index.js";

const deletePost = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { postId } = req.body;

    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (String(post.user) !== user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default deletePost;
