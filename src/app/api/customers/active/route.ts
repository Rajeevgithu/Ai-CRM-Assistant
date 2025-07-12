import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find({ isActive: true })
      .select('_id name itemPurchased totalSpent lastPurchase isActive');
    return NextResponse.json({ customers });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch active customers.' }, { status: 500 });
  }
} 