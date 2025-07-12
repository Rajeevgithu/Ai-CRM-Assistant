import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function recoverCustomerData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or MONGO_URI environment variable is not set');
      console.log('💡 Using default local MongoDB connection...');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/ai-crm-assistant');
    console.log('✅ Connected to MongoDB successfully');

    const dbName = mongoose.connection.db?.databaseName || 'Unknown';
    console.log(`📋 Current database: ${dbName}`);

    // Check current data
    const currentCustomers = await Customer.find({});
    console.log(`\n📊 Current customers in database: ${currentCustomers.length}`);

    if (currentCustomers.length > 0) {
      console.log('\n📋 Current customers:');
      currentCustomers.forEach((c, i) => {
        console.log(`${i + 1}. ${c.name} - ₹${c.totalSpent}`);
      });
    }

    console.log('\n🔍 DATA RECOVERY OPTIONS:');
    console.log('=' .repeat(50));
    console.log('1. Your original data might have been cleared when seed script was run');
    console.log('2. You might be connected to a different database');
    console.log('3. The data might be in a backup or different environment');
    
    console.log('\n💡 TO RECOVER YOUR ORIGINAL DATA:');
    console.log('=' .repeat(50));
    console.log('1. Check if you have a .env.local file with different database settings');
    console.log('2. Check if you\'re using MongoDB Atlas vs local MongoDB');
    console.log('3. Look for any database backups');
    console.log('4. Check your browser\'s local storage for any cached data');
    
    console.log('\n🛠️  TO RECREATE YOUR DATA:');
    console.log('=' .repeat(50));
    console.log('You can add your customers back through the app interface:');
    console.log('1. Go to your app at http://localhost:3000');
    console.log('2. Use the "Add Customer" form');
    console.log('3. Or use the API directly');
    
    console.log('\n📝 SAMPLE CUSTOMER DATA FORMAT:');
    console.log('=' .repeat(50));
    console.log('Name: Your Customer Name');
    console.log('Item Purchased: Product Name');
    console.log('Quantity: Number of items');
    console.log('Total Spent: Amount in rupees');
    console.log('Last Purchase: Date (YYYY-MM-DD)');

    // Offer to help recreate some sample data
    console.log('\n🤔 Would you like me to:');
    console.log('1. Clear current seed data and start fresh');
    console.log('2. Keep current data and add your customers on top');
    console.log('3. Help you connect to a different database');
    console.log('4. Create a backup of current data first');

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error during recovery check:', error);
    process.exit(1);
  }
}

recoverCustomerData(); 