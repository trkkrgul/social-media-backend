import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import postLikesComments from "../aggregates/postLikesComments.js";
import { Post, User } from "../models/index.js";
import { s3Client } from "./createPost.js";

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

async function addPresignedUrls(images) {
  await Promise.all(
    images?.map(async (image) => {
      if (image.key) {
        const command = new GetObjectCommand({
          Bucket: BUCKET,
          Key: image.key,
        });
        image.url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return image;
      }
    })
  );
}

async function handlePostsWithUrl(posts) {
  await Promise.all(
    posts.map(async (post) => {
      await addPresignedUrls(post.media);
    })
  );
}

const getFollowingPosts = async (req, res) => {
  try {
    const { walletAddress } = req.user;
    const { followings } = req.body;

    const user = await User.findOne({ walletAddress: walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(followings);
    const result = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },

      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $match: {
          "user._id": {
            $in: followings.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      // ... rest of the pipeline
      ...postLikesComments,
    ]);

    const posts = await Post.populate(result, [
      {
        path: "user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "comments.childComments.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "comments.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "likers.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "dislikers.user",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
    ]);

    await handlePostsWithUrl(posts);
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default getFollowingPosts;
