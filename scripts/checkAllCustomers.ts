import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkAllCustomers() {
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

    // Get ALL customers without any filtering
    const allCustomers = await Customer.find({}).sort({ createdAt: -1 });
    console.log(`📊 Total customers found: ${allCustomers.length}`);

    if (allCustomers.length === 0) {
      console.log('⚠️  No customers found in database at all!');
      console.log('💡 This means either:');
      console.log('   1. The database is empty');
      console.log('   2. You\'re connected to a different database');
      console.log('   3. The data was cleared');
      
      // Check database info
      const dbName = mongoose.connection.db?.databaseName || 'Unknown';
      console.log(`\n📋 Current database: ${dbName}`);
      console.log(`📋 Connection string: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
      
      await mongoose.connection.close();
      return;
    }

    console.log('\n📋 ALL CUSTOMERS IN DATABASE:');
    console.log('=' .repeat(80));
    
    allCustomers.forEach((customer, index) => {
      console.log(`\n${index + 1}. Customer Details:`);
      console.log(`   ID: ${customer._id}`);
      console.log(`   Name: ${customer.name}`);
      console.log(`   Item: ${customer.itemPurchased || 'NOT SET'}`);
      console.log(`   Quantity: ${customer.quantity || 'NOT SET'}`);
      console.log(`   Total Spent: ₹${customer.totalSpent}`);
      console.log(`   Last Purchase: ${customer.lastPurchase ? customer.lastPurchase.toLocaleDateString() : 'NOT SET'}`);
      console.log(`   Active: ${customer.isActive ? '✅' : '❌'}`);
      console.log(`   Created: ${customer.createdAt ? customer.createdAt.toLocaleString() : 'NOT SET'}`);
      console.log(`   Updated: ${customer.updatedAt ? customer.updatedAt.toLocaleString() : 'NOT SET'}`);
      
      // Check if this looks like seed data or user-added data
      const isSeedData = ['Alice Johnson', 'Bob Smith', 'Carol Lee', 'Eva Green', 'Frank Moore', 'David Kim'].includes(customer.name);
      console.log(`   Source: ${isSeedData ? '🌱 SEED DATA' : '👤 USER ADDED'}`);
    });

    // Analyze the data
    const seedDataCount = allCustomers.filter(c => 
      ['Alice Johnson', 'Bob Smith', 'Carol Lee', 'Eva Green', 'Frank Moore', 'David Kim'].includes(c.name)
    ).length;
    
    const userAddedCount = allCustomers.length - seedDataCount;
    
    console.log('\n📊 DATA ANALYSIS:');
    console.log('=' .repeat(50));
    console.log(`🌱 Seed data customers: ${seedDataCount}`);
    console.log(`👤 User-added customers: ${userAddedCount}`);
    console.log(`📅 Date range: ${allCustomers[allCustomers.length - 1]?.createdAt?.toLocaleDateString()} to ${allCustomers[0]?.createdAt?.toLocaleDateString()}`);

    // Check for any customers that might be your original data
    const potentialOriginalData = allCustomers.filter(c => 
      !['Alice Johnson', 'Bob Smith', 'Carol Lee', 'Eva Green', 'Frank Moore', 'David Kim'].includes(c.name)
    );

    if (potentialOriginalData.length > 0) {
      console.log('\n🎯 POTENTIAL ORIGINAL CUSTOMER DATA:');
      console.log('=' .repeat(50));
      potentialOriginalData.forEach((customer, index) => {
        console.log(`${index + 1}. ${customer.name} - ₹${customer.totalSpent} - ${customer.createdAt?.toLocaleDateString()}`);
      });
    } else {
      console.log('\n⚠️  No user-added customers found!');
      console.log('💡 This suggests your original data might have been:');
      console.log('   1. Cleared by running the clear script');
      console.log('   2. Overwritten by the seed script');
      console.log('   3. Stored in a different database');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error checking all customers:', error);
    process.exit(1);
  }
}

checkAllCustomers(); 