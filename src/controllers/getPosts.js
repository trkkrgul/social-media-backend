import mongoose from "mongoose";
import { Post, User, Comment } from "../models/index.js";
import { s3Client } from "./createPost.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import postLikesComments from "../aggregates/postLikesComments.js";

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

async function getBucketFiles(res) {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: "images/",
    Delimiter: "/",
  });

  try {
    const response = await s3Client.send(command);
    const urls = await getPresignedUrls(response.Contents);
    res.send(urls);
  } catch (err) {
    console.log("Error", err);
    res.send(err);
  }
}

async function handlePostsWithUrl(posts) {
  await Promise.all(
    posts.map(async (post) => {
      await addPresignedUrls(post.media);
    })
  );
}

export const getPosts = async (req, res) => {
  try {
    const { limit } = req.params;

    const result = await Post.aggregate([
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
      { $sort: { createdAt: -1 } },
      ...postLikesComments,
    ]);

    const posts = await Post.populate(result, [
      {
        path: "user",
        select:
          "_id _id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
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
      {
        path: "dislikers.user.followings dislikers.user.followers",
        select:
          "_id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
      {
        path: "followers",
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

export default getPosts;
