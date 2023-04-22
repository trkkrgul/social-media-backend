import { User } from "../models/index.js";

const getUserByWalletAddress = async (req, res) => {
  try {
    const { wallet } = req.params;

    const user = await User.findOne({ walletAddress: wallet }).select(
      "_id walletAddress username followers followings isVerified isKYCED biography coverPicturePath discordId profilePicturePath telegramId twitterId"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default getUserByWalletAddress;
