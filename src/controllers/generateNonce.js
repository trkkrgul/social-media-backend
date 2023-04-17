import { User } from "../models/index.js";
const generateNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      const insertedUser = new User({
        walletAddress,
        nonce: Math.floor(Math.random() * 10000),
      });
      const newUser = await insertedUser.save();
      res
        .status(200)
        .json({ message: "Nonce generated", nonce: newUser.nonce });
      return;
    }

    console.log(user.walletAddress);
    if (!user.nonce) {
      const newNonce = Math.floor(Math.random() * 10000);
      const updatedUser = await User.findOneAndUpdate(
        { walletAddress: walletAddress },
        { nonce: newNonce }
      );
      res
        .status(200)
        .json({ message: "Nonce generated", nonce: updatedUser.nonce });
    } else {
      res
        .status(200)
        .json({ message: "Nonce already exists", nonce: user.nonce });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Intersnal server error" });
  }
};

export default generateNonce;
