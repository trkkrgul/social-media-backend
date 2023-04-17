import { Post, User } from "../models/index.js";
async function addPost(req, res) {
  try {
    const { content, media, tags, token, categories, userWalletAddress } =
      req.body;
    const loggedUser = req.user;
    if (loggedUser.walletAddress !== userWalletAddress) {
      console.log(loggedUser);
      return res.status(403).json({ message: "Unauthorized" });
    }
    const user = await User.findOne({ walletAddress: userWalletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      content,
      media,
      token,
      tags,
      categories,
      user: user._id,
    });

    const savedPost = await newPost.save();
    const post = await Post.findById(savedPost._id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const result = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $match: { _id: savedPost._id } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },

      {
        $lookup: {
          from: "comments",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$post", "$$post_id"] }],
                },
              },
            },
            {
              $match: {
                $or: [
                  { parentComment: { $exists: false } },
                  { parentComment: null },
                ],
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
              },
            },
            {
              $lookup: {
                from: "comments",
                let: { parent_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$parentComment", "$$parent_id"] }],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "user",
                      foreignField: "_id",
                      as: "user",
                    },
                  },
                  {
                    $addFields: {
                      user: { $arrayElemAt: ["$user", 0] },
                    },
                  },
                ],
                as: "replies",
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetType", "post"] },
                    { $eq: ["$targetId", "$$post_id"] },
                    { $eq: ["$isDislike", false] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
              },
            },
          ],
          as: "likers",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$targetType", "post"] },
                    { $eq: ["$targetId", "$$post_id"] },
                    { $eq: ["$isDislike", true] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$user", 0] },
              },
            },
          ],
          as: "dislikers",
        },
      },
      // ... rest of the pipeline
    ]);

    const posts = await Post.populate(result, [
      {
        path: "user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "comments.childComments.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "comments.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "likers.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
      {
        path: "dislikers.user",
        select:
          "username profilePicturePath coverPicturePath isVerified isKYCED walletAddress",
      },
    ]);

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Post not found" });
  }
}

export default addPost;
