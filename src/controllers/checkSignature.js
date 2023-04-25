import { User } from "../models/index.js";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const checkSignature = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const nonce = user.nonce;
    if (!nonce) {
      return res.status(404).json({ message: "Nonce not found" });
    }

    const recoveredAddress = ethers.utils.verifyMessage(
      String(nonce),
      signature
    );
    if (recoveredAddress === walletAddress) {
      const token = jwt.sign(
        { walletAddress: walletAddress },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      res.status(200).json({ message: "Signature verified", token });
    } else {
      res.status(401).json({ message: "Invalid signature" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default checkSignature;
