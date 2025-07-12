import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function fixCustomerData() {
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

    // Sample items to assign to customers
    const sampleItems = [
      { item: 'Laptop', quantity: 2 },
      { item: 'Monitor', quantity: 1 },
      { item: 'Keyboard', quantity: 3 },
      { item: 'Mouse', quantity: 5 },
      { item: 'Printer', quantity: 1 },
      { item: 'Headphones', quantity: 2 }
    ];

    // Get all customers that need fixing
    const customersToFix = await Customer.find({
      $or: [
        { itemPurchased: { $exists: false } },
        { itemPurchased: null },
        { quantity: { $exists: false } },
        { quantity: null }
      ]
    });

    console.log(`🔧 Found ${customersToFix.length} customers that need data fixing`);

    if (customersToFix.length === 0) {
      console.log('✅ All customer data is complete!');
      await mongoose.connection.close();
      return;
    }

    // Fix each customer
    for (let i = 0; i < customersToFix.length; i++) {
      const customer = customersToFix[i];
      const sampleItem = sampleItems[i % sampleItems.length];
      
      console.log(`\n🔧 Fixing customer: ${customer.name}`);
      console.log(`   Current data: Item=${customer.itemPurchased || 'NOT SET'}, Quantity=${customer.quantity || 'NOT SET'}`);
      
      // Update the customer with missing data
      await Customer.findByIdAndUpdate(customer._id, {
        itemPurchased: sampleItem.item,
        quantity: sampleItem.quantity
      });
      
      console.log(`   ✅ Updated to: Item=${sampleItem.item}, Quantity=${sampleItem.quantity}`);
    }

    console.log('\n🎉 Customer data fixing completed!');
    
    // Show the updated data
    console.log('\n📋 Updated customer data:');
    const updatedCustomers = await Customer.find({})
      .sort({ lastPurchase: -1 })
      .select('name itemPurchased quantity totalSpent lastPurchase isActive');
    
    updatedCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.itemPurchased} (Qty: ${customer.quantity}) - ₹${customer.totalSpent} - ${customer.lastPurchase.toLocaleDateString()} ${customer.isActive ? '✅' : '❌'}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing customer data:', error);
    process.exit(1);
  }
}

fixCustomerData(); 