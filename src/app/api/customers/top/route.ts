import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Customer from '../../../../models/Customer';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const customers = await Customer.find({ isActive: true })
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('_id name itemPurchased totalSpent lastPurchase isActive');
    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers.' }, { status: 500 });
  }
} 