import mongoose from 'mongoose';
import Customer from '../src/models/Customer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkMultipleDatabases() {
  try {
    console.log('🔍 CHECKING MULTIPLE DATABASE CONNECTIONS...');
    console.log('=' .repeat(60));

    // Possible database connections to check
    const possibleConnections = [
      'mongodb://localhost:27017/ai-crm-assistant',
      'mongodb://localhost:27017/crm-assistant',
      'mongodb://localhost:27017/crm',
      'mongodb://localhost:27017/test',
      'mongodb://127.0.0.1:27017/ai-crm-assistant',
      'mongodb://127.0.0.1:27017/crm-assistant'
    ];

    // Add environment variables if they exist
    const envMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (envMongoUri) {
      possibleConnections.unshift(envMongoUri);
    }

    console.log('📋 Checking these database connections:');
    possibleConnections.forEach((uri, index) => {
      console.log(`${index + 1}. ${uri.replace(/\/\/.*@/, '//***:***@')}`);
    });

    console.log('\n🔍 SCANNING DATABASES...');
    console.log('=' .repeat(60));

    for (let i = 0; i < possibleConnections.length; i++) {
      const uri = possibleConnections[i];
      console.log(`\n${i + 1}. Checking: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
      
      try {
        // Connect to this database
        await mongoose.connect(uri);
        const dbName = mongoose.connection.db?.databaseName || 'Unknown';
        console.log(`   📋 Database: ${dbName}`);

        // Check for customers
        const customers = await Customer.find({});
        console.log(`   👥 Customers found: ${customers.length}`);

        if (customers.length > 0) {
          console.log('   📋 Customer names:');
          customers.forEach((c, index) => {
            const isSeedData = ['Alice Johnson', 'Bob Smith', 'Carol Lee', 'Eva Green', 'Frank Moore', 'David Kim'].includes(c.name);
            console.log(`      ${index + 1}. ${c.name} - ₹${c.totalSpent} ${isSeedData ? '(🌱 SEED)' : '(👤 USER)'}`);
          });

          // Check if this has user data
          const userData = customers.filter(c => 
            !['Alice Johnson', 'Bob Smith', 'Carol Lee', 'Eva Green', 'Frank Moore', 'David Kim'].includes(c.name)
          );

          if (userData.length > 0) {
            console.log(`   🎯 FOUND USER DATA! ${userData.length} user-added customers`);
            console.log('   💡 This might be your original data!');
          }
        }

        // Close this connection
        await mongoose.connection.close();
        
      } catch (error) {
        console.log(`   ❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    console.log('1. If you found your data in a different database, update your .env.local file');
    console.log('2. If no user data found, your original data was likely cleared');
    console.log('3. You can recreate your data using the app interface');

  } catch (error) {
    console.error('❌ Error checking databases:', error);
  }
}

checkMultipleDatabases(); 