import { User } from "../models/index.js";
async function blockUser(req, res) {
  try {
    const { userWalletAddress, userToBlock } = req.body;

    const currentUser = await User.findOne({
      walletAddress: userWalletAddress,
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToBlockId = await User.findOne({
      walletAddress: userToBlock,
    }).select("_id");
    if (!userToBlockId) {
      return res.status(404).json({ message: "User to block not found" });
    }

    const blockedUsers = currentUser.blockedUsers.concat(userToBlockId);
    currentUser.blockedUsers = blockedUsers;
    await currentUser.save();

    const updatedUser = await User.findById(currentUser._id).populate(
      "blockedUsers"
    );

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default blockUser;
