import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    return NextResponse.json({ message: 'Connected to MongoDB successfully 🚀' });
  } catch (error) {
    return NextResponse.json(
      { error: 'MongoDB connection failed' },
      { status: 500 }
    );
  }
} 