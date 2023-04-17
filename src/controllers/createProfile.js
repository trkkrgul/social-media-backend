import { User } from "../models/index.js";

async function createProfile(req, res) {
  try {
    const {
      profilePicturePath,
      coverPicturePath,
      biography,
      gender,
      telegramId,
      twitterId,
      discordId,
      username,
    } = req.body;
    const { walletAddress } = req.user;
    if (!walletAddress) {
      console.log(walletAddress);
      return res.status(403).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({
      walletAddress: walletAddress,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isProfileCreated) {
      return res.status(400).json({ message: "Profile already created" });
    }

    const dublicatedUser = await User.findOne({ username: username });
    if (dublicatedUser) {
      console.log(dublicatedUser);
      return res.status(400).json({ message: "Username already exists" });
    }
    if (coverPicturePath) user.coverPicturePath = coverPicturePath;
    if (username) user.username = username;
    if (profilePicturePath) user.profilePicturePath = profilePicturePath;
    if (biography) user.biography = biography;
    if (gender) user.gender = gender;
    if (telegramId) user.telegramId = telegramId;
    if (twitterId) user.twitterId = twitterId;
    if (discordId) user.discordId = discordId;
    user.isProfileCreated = true;

    const savedUser = await user.save();
    res.status(200).json(savedUser.depopulate("nonce"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default createProfile;
