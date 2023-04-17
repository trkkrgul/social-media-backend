import { User } from "../models/index.js";

async function signup(req, res) {
  try {
    const { walletAddress, username } = req.body;
    const userExists = await User.findOne({ walletAddress });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({
      walletAddress,
      username,
      isProfileCreated: false,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default signup;
