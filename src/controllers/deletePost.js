import { Post, User } from "../models/index.js";

const deletePost = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { postId } = req.body;

    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const _post = Post.findById(postId).select("user");
    const postOwner = User.findOne({ _id: _post.user }).select("_id");
    if (!postOwner) {
      return res.status(404).json({ message: "Post owner not found" });
    }

    if (!_post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (postOwner._id !== user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default deletePost;
