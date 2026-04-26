import dotenv from 'dotenv';
dotenv.config({ override: true });

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    // Check if MongoDB URI exists
    if (!mongoURI) {
      throw new Error('MONGO_URI is missing in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected Successfully');
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);

    // Exit process if DB connection fails
    process.exit(1);
  }
};

export default connectDB;