import { User } from "../models/index.js";
async function followUsers(req, res) {
  try {
    const { userWalletAddress, usersToFollow } = req.body;

    const currentUser = await User.findOne({
      walletAddress: userWalletAddress,
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const usersToFollowIds = await User.find({
      walletAddress: { $in: usersToFollow },
    }).distinct("_id");
    if (!usersToFollowIds || usersToFollowIds.length === 0) {
      return res
        .status(404)
        .json({ message: "One or more users to follow not found" });
    }

    const followedUsers = currentUser.followings.concat(usersToFollowIds);
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

export default followUsers;
