import { User } from "../models/index.js";

const getAuthUser = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    await User.findOne({ walletAddress })
      .select("-nonce -__v -blockedUsers")
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default getAuthUser;
