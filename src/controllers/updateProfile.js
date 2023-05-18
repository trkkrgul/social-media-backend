import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";
import { User } from "../models/index.js";


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

async function uploadToS3 (file) {
  const key = `${process.env.AWS_PROFILE_PATH}/${uuid()}-${file.originalname.replaceAll(' ', '-')}`
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

async function handleUpload(files,res) {
  const images = Promise.all(
    files.map(async (file) => {
      const key = await uploadToS3(file);
      return { key, type: file.mimetype.split("/")?.[0] };
    })
  ).catch(err => res.status(400).json({ message: "Error while image uploading", err: err.message }));
  return images;
}

async function updateProfile(req, res) {
  try {
    const {
      profilePicturePath,
      biography,
      gender,
      telegramId,
      twitterId,
      coverPicturePath,
      discordId,
      username,
      controller
    } = req.body;
    const {cover, profile} = JSON.parse(controller);

    const { walletAddress } = req.user

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isProfileCreated) {
      return res.status(400).json({ message: "Profile not created yet" });
    }

    if (biography) user.biography = biography;
    if (gender) user.gender = gender;
    if (telegramId) user.telegramId = telegramId;
    if (twitterId) user.twitterId = twitterId;
    if (discordId) user.discordId = discordId;
    if (username) user.username = username;
    
    const images = await handleUpload(req.files, res); // 0-cover 1-profile
    console.log(images, images.length);
    console.log('1,deger',images?.[0]?.key, '2.deger', cover)
    if(images?.length === 1) {
      console.log('1blok');
     
      if(images?.[0]?.key && cover) user.coverPicturePath = images[0].key;
      if(images?.[0]?.key && profile) user.profilePicturePath = images[0].key;
    } else if (images?.length === 2) {
      console.log('blok2');
      if(images?.[0]?.key) user.coverPicturePath = images[0].key;
      if(images?.[1]?.key) user.profilePicturePath = images[1].key;
    }
    const updatedUser = await user.save();
   
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default updateProfile;
