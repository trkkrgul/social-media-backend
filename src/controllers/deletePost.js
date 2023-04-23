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

    const result = post.populate("user", "walletAddress");
    console.log("owner", result.user.walletAddress);
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default deletePost;
