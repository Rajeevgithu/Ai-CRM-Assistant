import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ ok: true, message: 'Database connected successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    });
  }
} 