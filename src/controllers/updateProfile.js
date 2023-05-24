import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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

const BUCKET = process.env.AWS_S3_PUBLIC_BUCKET_NAME;

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

async function getFromS3 (key) {
  const bucketParams = {
    Bucket: BUCKET,
    Key: key,
  };

  try {
    const response = await s3Client.send(new GetObjectCommand(bucketParams));
    const url = `https://${BUCKET}.s3.amazonaws.com/${key}`;
    console.log(url);
    return url;
  } catch (err) {
    console.log("Error", err);
  }
}

async function handleUpload(files,res) {
  const images = Promise.all(
    files.map(async (file) => {
      const key = await uploadToS3(file);
      const url = await getFromS3(key);
      return { key, type: file.mimetype.split("/")?.[0], url };
    })
  ).catch(err => res.status(400).json({ message: "Error while image uploading", err: err.message }));
  return images;
}

async function handleUploadSingle(file, res) {
  try {
    const key = await uploadToS3(file);
    const url = await getFromS3(key);
    return { key, type: file.mimetype.split("/")?.[0], url };
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: "Error while image uploading", err: err.message });
  }
}


async function updateProfile(req, res) {
  try {
    const {
      biography,
      gender,
      telegramId,
      twitterId,
      discordId,
      username,
    } = req.body;

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

    const { profile, cover } = req.files

    if (profile && cover) {
      const uploadProfile = handleUploadSingle(profile[0], res);
      const uploadCover = handleUploadSingle(cover[0], res);
    
      const [profileImage, coverImage] = await Promise.all([uploadProfile, uploadCover]);
    
      user.profilePicturePath = profileImage?.url;
      user.coverPicturePath = coverImage?.url;
    } else if (profile) {
      const profileImage = await handleUploadSingle(profile[0], res);
      user.profilePicturePath = profileImage?.url;
    } else if (cover) {
      const coverImage = await handleUploadSingle(cover[0], res);
      user.coverPicturePath = coverImage?.url;
    }
   
    const updatedUser = await user.save();
    res.send(updatedUser);
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export default updateProfile;
