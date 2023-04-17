import { User } from "../models/index.js";

async function unblockUser(req, res) {
  try {
    const { userWalletAddress, userToUnblock } = req.body;

    const currentUser = await User.findOne({
      walletAddress: userWalletAddress,
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToUnblockId = await User.findOne({
      walletAddress: userToUnblock,
    }).select("_id");
    if (!userToUnblockId) {
      return res.status(404).json({ message: "User to unblock not found" });
    }

    const blockedUsers = currentUser.blockedUsers.filter(
      (userId) => userId.toString() !== userToUnblockId.toString()
    );
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

export default unblockUser;
