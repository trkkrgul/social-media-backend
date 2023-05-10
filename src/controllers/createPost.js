import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { Post, User } from "../models/index.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


dotenv.config();

const credentials = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS
  }
};

export const s3Client = new S3Client(credentials);

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

async function addPresignedUrls (images){
  await Promise.all(
    images?.map( async (image) => {
      if(image.key){
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: image.key });
        image.url = await getSignedUrl(s3Client, command, {expiresIn: 3600})
        return image;
      }
    })
  )
}

async function uploadToS3 (file) {
  const key = `${process.env.AWS_IMAGE_PATH}/${uuid()}-${file.originalname.replaceAll(' ', '-')}`
  const bucketParams = {
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    if(data.$metadata.httpStatusCode == 200){
      return key;
    } else {
      console.log("Error while uploading to S3.");
    }
  } catch (err) {
    console.log("Error", err);
  }
}




async function handleUpload(files) {
  const images = Promise.all(
    files.map(async (file) => {
      const key = await uploadToS3(file);
      return { key, type: file.mimetype.split("/")?.[0] };
    })
  );
  return images;
}

// file.mimetype.split('/')?.[0]

async function createPost(req, res) {
  const { files } = req;

  // handle if there is no files
  if(!files) return res.status(400).json({message: 'Bad Request'})

  const images = await handleUpload(files);

  try {
    const { content, tags, token, categories, userWalletAddress } =
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
      media: images,
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
    
    await addPresignedUrls(result[0].media);
    res.status(200).json(result);
  } catch (error) { 
    console.error(error);
    res.status(404).json({ message: "Post not found" });
  }
}

export default createPost;
