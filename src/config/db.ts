import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/AuthService';

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGO_URI) {
      console.log('MONGO_URI is not defined in environment variables');
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
};
