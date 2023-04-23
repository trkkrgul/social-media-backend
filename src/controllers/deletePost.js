import { Post } from "../models/index.js";

async function deletePost(req, res) {
  try {
    // Retrieve the user's wallet address from the middleware
    const userWalletAddress = req.user.walletAddress;

    // Retrieve the post ID from the request parameters
    const { postId } = req.body;

    // Find the post by its ID and the user's wallet address
    const post = await Post.findOne({
      _id: postId,
      user: userWalletAddress,
    });

    // If the post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({
        message: "Post not found or not owned by the user",
      });
    }

    // Remove the post
    await Post.deleteOne({ _id: postId });

    // Return a success message
    res.status(200).json({
      message: "Post removed successfully",
    });
  } catch (error) {
    // Handle any errors and return a 500 error
    console.error(error);
    res.status(500).json({
      message: "An error occurred while removing the post",
    });
  }
}

export default deletePost;
