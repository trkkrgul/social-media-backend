import { User } from "../models/index.js";

const getOnlineUsers = async (req, res) => {
  try {
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setDate(tenMinutesAgo.getMinutes() - 10);

    const users = await User.find({ lastSeen: { $gte: tenMinutesAgo } }).select(
      "-nonce -__v"
    );
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default getOnlineUsers;
