import dotenv from 'dotenv';
dotenv.config({ override: true });

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is missing in environment variables');
    }

    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);

    // Don't kill server immediately on Render
    setTimeout(() => {
      console.log("Retrying DB connection...");
      connectDB();
    }, 5000);
  }
};

export default connectDB;