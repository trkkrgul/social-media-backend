import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Post, User, Comment, Like } from "../models/index.js";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import postLikesComments from "../aggregates/postLikesComments.js";

dotenv.config();

const credentials = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
  },
};

export const s3Client = new S3Client(credentials);

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

const getPostsByWalletAddress = async (req, res) => {
  try {
    const { wallet } = req.params;

    const user = await User.findOne({ walletAddress: wallet });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      { $match: { "user.walletAddress": wallet } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },

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

export default getPostsByWalletAddress;
