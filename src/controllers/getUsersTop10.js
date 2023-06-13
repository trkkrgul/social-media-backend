import { User } from "../models/index.js";

const getUsersTop10 = async (req, res) => {
  const now = new Date();
  await User.find()
    .select("-nonce")
    .limit(10)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("An error occurred");
    });
};

export default getUsersTop10;
