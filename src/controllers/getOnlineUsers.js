import { User } from "../models/index.js";

const getOnlineUsers = async (req, res) => {
  const now = new Date();
  await User.find({
    lastSeen: { $gte: new Date(now.getTime() - 1000 * 60000) },
  })
    .select("-nonce")
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("An error occurred");
    });
};

export default getOnlineUsers;
