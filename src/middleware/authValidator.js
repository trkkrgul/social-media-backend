import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
const authMiddleware = (req, res, next) => {
  // Get the token from the request header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    const updatedUser = await User.updateOne(
      { walletAddress: user.walletAddress },
      { lastSeen: new Date() },
      { new: true }
    );
    req.user = user;
    next();
  });
};

export default authMiddleware;
