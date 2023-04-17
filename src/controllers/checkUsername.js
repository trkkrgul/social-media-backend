import { User } from "../models/index.js";

const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.find({ username: username });
    if (user.length > 0) {
      return res.status(200).json({ message: false });
    }
    res.status(200).json({ message: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: false });
  }
};

export default checkUsername;
