import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function copyToAtlas() {
  try {
    console.log('🔄 COPYING DATA TO MONGODB ATLAS...');
    console.log('=' .repeat(60));

    // Local database connection (source)
    const localUri = 'mongodb://localhost:27017/ai-crm-assistant';
    
    // Atlas database connection (destination)
    const atlasUri = process.env.MONGO_URI;
    
    if (!atlasUri) {
      console.error('❌ MONGO_URI not found in .env.local');
      process.exit(1);
    }

    console.log('📋 Source: Local MongoDB (localhost:27017/ai-crm-assistant)');
    console.log('📋 Destination: MongoDB Atlas');
    console.log('');

    // Step 1: Connect to local database and get original data
    console.log('🔌 Connecting to local database...');
    await mongoose.connect(localUri);
    console.log('✅ Connected to local database');

    const originalCustomers = await Customer.find({}).select('name itemPurchased quantity totalSpent lastPurchase isActive');
    console.log(`📊 Found ${originalCustomers.length} customers in local database`);

    if (originalCustomers.length === 0) {
      console.log('⚠️  No customers found in local database');
      await mongoose.connection.close();
      return;
    }

    // Display original data
    console.log('\n📋 ORIGINAL CUSTOMERS (Local):');
    console.log('=' .repeat(50));
    originalCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ₹${customer.totalSpent.toLocaleString('en-IN')}`);
    });

    // Step 2: Connect to Atlas database
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connection.close();
    await mongoose.connect(atlasUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Step 3: Check current Atlas data
    const atlasCustomers = await Customer.find({});
    console.log(`📊 Current customers in Atlas: ${atlasCustomers.length}`);

    if (atlasCustomers.length > 0) {
      console.log('\n📋 CURRENT ATLAS CUSTOMERS:');
      atlasCustomers.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} - ₹${customer.totalSpent.toLocaleString('en-IN')}`);
      });
    }

    // Step 4: Add original customers to Atlas
    console.log('\n🔄 ADDING ORIGINAL CUSTOMERS TO ATLAS...');
    console.log('=' .repeat(50));

    let addedCount = 0;
    let skippedCount = 0;

    for (const customer of originalCustomers) {
      // Check if customer already exists in Atlas
      const existingCustomer = await Customer.findOne({ name: customer.name });
      
      if (existingCustomer) {
        console.log(`⏭️  Skipped: ${customer.name} (already exists in Atlas)`);
        skippedCount++;
      } else {
        // Create new customer in Atlas
        const newCustomer = new Customer({
          name: customer.name,
          itemPurchased: customer.itemPurchased || 'Unknown Item',
          quantity: customer.quantity || 1,
          totalSpent: customer.totalSpent,
          lastPurchase: customer.lastPurchase || new Date(),
          isActive: customer.isActive !== false
        });
        
        await newCustomer.save();
        console.log(`✅ Added: ${customer.name} - ₹${customer.totalSpent.toLocaleString('en-IN')}`);
        addedCount++;
      }
    }

    // Step 5: Show final results
    console.log('\n🎉 COPY OPERATION COMPLETED!');
    console.log('=' .repeat(50));
    console.log(`✅ Added: ${addedCount} customers`);
    console.log(`⏭️  Skipped: ${skippedCount} customers (already existed)`);

    // Step 6: Show final Atlas data
    const finalAtlasCustomers = await Customer.find({}).sort({ totalSpent: -1 });
    console.log(`\n📊 FINAL ATLAS DATABASE: ${finalAtlasCustomers.length} total customers`);
    console.log('=' .repeat(50));
    finalAtlasCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ₹${customer.totalSpent.toLocaleString('en-IN')}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error copying data to Atlas:', error);
    process.exit(1);
  }
}

copyToAtlas(); 