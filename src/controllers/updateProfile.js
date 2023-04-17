import { User } from "../models/index.js";

async function updateProfile(req, res) {
  try {
    const {
      walletAddress,
      profilePicturePath,
      biography,
      gender,
      telegramId,
      twitterId,
      coverPicturePath,
      discordId,
    } = req.body;

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isProfileCreated) {
      return res.status(400).json({ message: "Profile not created yet" });
    }
    if (coverPicturePath) user.coverPicturePath = coverPicturePath;
    if (profilePicturePath) user.profilePicturePath = profilePicturePath;
    if (biography) user.biography = biography;
    if (gender) user.gender = gender;
    if (telegramId) user.telegramId = telegramId;
    if (twitterId) user.twitterId = twitterId;
    if (discordId) user.discordId = discordId;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default updateProfile;
