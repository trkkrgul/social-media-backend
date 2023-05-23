import { User } from "../models/index.js";

const getOnlineUsers = async (req, res) => {
  const tenMinutesAgo = new Date();
  tenMinutesAgo.setDate(tenMinutesAgo.getMinutes() - 10);

  const users = await User.find({ lastSeen: { $gte: tenMinutesAgo } })
    .select(
      "-nonce"
    )
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("An error occurred");
    });

  res.json(users);
};

export default getOnlineUsers;
