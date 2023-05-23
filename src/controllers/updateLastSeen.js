import { User } from "../models/index.js";

const updateLastSeen = (req, res) => {
  const { walletAddress } = req.user;
  User.findOneAndUpdate(
    { walletAddress },
    { lastSeen: new Date() },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          message: "Error while updating last seen",
          err: err.message,
        });
      }
      return res
        .status(200)
        .json({ message: "Last seen updated successfully", user });
    }
  );
};

export default updateLastSeen;
