import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
    res.status(200).json({ message: 'Connected to MongoDB successfully 🚀' });
  } catch (error) {
    res.status(500).json({ error: 'MongoDB connection failed' });
  }
}
