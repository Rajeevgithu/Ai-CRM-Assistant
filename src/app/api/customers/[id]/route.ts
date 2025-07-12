import { NextRequest, NextResponse } from 'next/server';
import Customer from '@/models/Customer';
import dbConnect from '@/lib/mongodb';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  try {
    const customer = await Customer.findByIdAndUpdate(id, { isActive: false });
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer soft deleted' });
  } catch (error: unknown) {
    return NextResponse.json({ message: 'Error deleting customer', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;
  const data = await req.json();
  try {
    const customer = await Customer.findByIdAndUpdate(id, data, { new: true });
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer updated', customer });
  } catch (error: unknown) {
    return NextResponse.json({ message: 'Error updating customer', error }, { status: 500 });
  }
} 