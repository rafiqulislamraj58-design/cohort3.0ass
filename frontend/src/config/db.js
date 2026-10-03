import mongoose from 'mongoose';
import { config } from './config.js'; 

export async function connectDb() {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('Cannot connect to MongoDB:', error.message);
    process.exit(1);
  }
}