import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  itemPurchased: string;
  quantity: number;
  totalSpent: number;
  lastPurchase: Date;
  isActive: boolean;
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  itemPurchased: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalSpent: { type: Number, required: true },
  lastPurchase: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});

CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ lastPurchase: -1 });
CustomerSchema.index({ isActive: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema); 