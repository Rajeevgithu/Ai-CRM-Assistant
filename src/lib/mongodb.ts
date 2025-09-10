import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables for local/dev; in Render these come from the environment
dotenv.config({ path: '.env.local' });

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const mongoUri = process.env.MONGODB_URI || (process.env.MONGO_URI as string);
  if (!mongoUri) {
    // Defer error until runtime call, not at import time
    throw new Error('Missing MONGODB_URI or MONGO_URI environment variable');
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
