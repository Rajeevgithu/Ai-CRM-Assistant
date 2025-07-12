import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  await Customer.deleteMany({}); // Clear existing

  await Customer.insertMany([
    { name: 'Alice Johnson', itemPurchased: 'Laptop', quantity: 2, totalSpent: 4100, lastPurchase: new Date('2024-06-01'), isActive: true },
    { name: 'Bob Smith', itemPurchased: 'Monitor', quantity: 1, totalSpent: 1800, lastPurchase: new Date('2024-05-20'), isActive: true },
    { name: 'Carol Lee', itemPurchased: 'Keyboard', quantity: 3, totalSpent: 3200, lastPurchase: new Date('2024-05-15'), isActive: true },
    { name: 'Eva Green', itemPurchased: 'Mouse', quantity: 5, totalSpent: 4100, lastPurchase: new Date('2024-06-02'), isActive: true },
    { name: 'Frank Moore', itemPurchased: 'Printer', quantity: 1, totalSpent: 1200, lastPurchase: new Date('2024-04-30'), isActive: false },
  ]);

  console.log('✅ Seed complete');
  process.exit();
}

seed(); 