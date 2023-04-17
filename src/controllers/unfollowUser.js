import { User } from "../models/index.js";

async function unfollowUser(req, res) {
  try {
    const { userWalletAddress, userToUnfollow } = req.body;

    const currentUser = await User.findOne({
      walletAddress: userWalletAddress,
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToUnfollowId = await User.findOne({
      walletAddress: userToUnfollow,
    }).select("_id");
    if (!userToUnfollowId) {
      return res.status(404).json({ message: "User to unfollow not found" });
    }

    const followedUsers = currentUser.followings.filter(
      (userId) => userId.toString() !== userToUnfollowId.toString()
    );
    currentUser.followings = followedUsers;
    await currentUser.save();

    const updatedUser = await User.findById(currentUser._id).populate(
      "followings"
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default unfollowUser;
