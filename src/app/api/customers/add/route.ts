import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, itemPurchased, quantity, totalSpent, lastPurchase } = body;
    const customer = await Customer.create({
      name,
      itemPurchased,
      quantity: Number(quantity),
      totalSpent: Number(totalSpent),
      lastPurchase: lastPurchase ? new Date(lastPurchase) : null,
      isActive: true,
    });
    return NextResponse.json({ message: 'Customer added successfully!', id: customer._id });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error adding customer' }, { status: 500 });
  }
} 