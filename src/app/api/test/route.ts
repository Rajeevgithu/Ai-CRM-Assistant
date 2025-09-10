import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      return NextResponse.json(
        {
          error: 'Database not configured',
          hint: 'Set MONGODB_URI in Render → Environment',
        },
        { status: 500 }
      );
    }

    await dbConnect();
    return NextResponse.json({ message: 'Connected to MongoDB successfully 🚀' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'MongoDB connection failed', details: message },
      { status: 500 }
    );
  }
}