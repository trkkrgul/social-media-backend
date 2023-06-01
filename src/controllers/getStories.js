import { Story } from "../models/index.js";
import { s3Client } from "./createPost.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
async function addPresignedUrls(image) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: image.key,
    });
    image.url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return image;
  } catch (err) {
    console.log(err);
    return image;
  }
}

async function handlePostsWithUrl(posts) {
  await Promise.all(
    posts.map(async (post) => {
      await addPresignedUrls(post.media);
    })
  );
}

const getStories = async (req, res) => {
  try {
    const { limit } = req.params;

    const result = await Story.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date() - 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    const stories = await Story.populate(result, [
      {
        path: "user",
        select:
          "_id _id username profilePicturePath coverPicturePath isVerified isKYCED walletAddress followers followings",
      },
    ]);
    await handlePostsWithUrl(stories);
    const splitArrays = stories.reduce((result, element) => {
      const userId = element.user._id;

      // Check if the user ID is already a key in the splitArrays object
      if (!(userId in result)) {
        result[userId] = [];
      }

      // Push the element to the corresponding split array
      result[userId].push(element);

      return result;
    }, {});

    const resultArrays = Object.values(splitArrays);

    res.status(200).json(resultArrays.reverse());
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Stories not found" });
  }
};

export default getStories;
