import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkCustomers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or MONGO_URI environment variable is not set');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Count total customers
    const totalCustomers = await Customer.countDocuments();
    console.log(`📊 Total customers in database: ${totalCustomers}`);

    // Count active customers
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    console.log(`✅ Active customers: ${activeCustomers}`);

    // Count inactive customers
    const inactiveCustomers = await Customer.countDocuments({ isActive: false });
    console.log(`❌ Inactive customers: ${inactiveCustomers}`);

    if (totalCustomers > 0) {
      console.log('\n📋 All customers with full details:');
      const allCustomers = await Customer.find({})
        .sort({ lastPurchase: -1 })
        .select('_id name itemPurchased quantity totalSpent lastPurchase isActive');
      
      allCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name}`);
        console.log(`   ID: ${customer._id}`);
        console.log(`   Item: ${customer.itemPurchased || 'NOT SET'}`);
        console.log(`   Quantity: ${customer.quantity}`);
        console.log(`   Total Spent: ₹${customer.totalSpent}`);
        console.log(`   Last Purchase: ${customer.lastPurchase.toLocaleDateString()}`);
        console.log(`   Active: ${customer.isActive ? '✅' : '❌'}`);
        console.log('');
      });

      // Show top spenders
      console.log('\n💰 Top spenders:');
      const topSpenders = await Customer.find({})
        .sort({ totalSpent: -1 })
        .limit(3)
        .select('name totalSpent itemPurchased');
      
      topSpenders.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} - ₹${customer.totalSpent} (${customer.itemPurchased || 'No item'})`);
      });

      // Check for missing itemPurchased
      const missingItems = await Customer.find({ itemPurchased: { $exists: false } });
      if (missingItems.length > 0) {
        console.log(`\n⚠️  Found ${missingItems.length} customers with missing itemPurchased field:`);
        missingItems.forEach(c => console.log(`   - ${c.name}`));
      }

      const nullItems = await Customer.find({ itemPurchased: null });
      if (nullItems.length > 0) {
        console.log(`\n⚠️  Found ${nullItems.length} customers with null itemPurchased field:`);
        nullItems.forEach(c => console.log(`   - ${c.name}`));
      }
    } else {
      console.log('\n⚠️  No customers found in database!');
      console.log('💡 You can run the seed script to add sample data:');
      console.log('   npm run seed');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error checking customers:', error);
    process.exit(1);
  }
}

checkCustomers(); 