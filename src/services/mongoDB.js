import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    // admin command to set timeout to 10 minutes
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
