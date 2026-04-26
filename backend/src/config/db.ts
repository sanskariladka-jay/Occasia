import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.log("MONGO_URI is missing");
      return;
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Connected Successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);

    /*
    DO NOT use:
    process.exit(1)

    This kills Render deploy
    */
  }
};

export default connectDB;