#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('🔌 Testing MongoDB Atlas Connection...\n');

if (!MONGODB_URI) {
  console.log('❌ No MongoDB URI found in environment variables!');
  console.log('Please set MONGODB_URI in your .env.local file or Vercel environment variables.');
  process.exit(1);
}

if (MONGODB_URI.includes('localhost')) {
  console.log('⚠️  Warning: You are using a local MongoDB URI.');
  console.log('This will not work on Vercel. You need MongoDB Atlas (cloud database).');
  console.log('Please set up MongoDB Atlas and update your connection string.');
  process.exit(1);
}

console.log('📋 Connection Details:');
console.log(`URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

async function testConnection() {
  try {
    console.log('\n🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`📁 Collections found: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('Collections:');
      collections.forEach(col => console.log(`  - ${col.name}`));
    }
    
    // Test collections directly
    const customerCollection = db.collection('customers');
    const customerCount = await customerCollection.countDocuments();
    console.log(`👥 Customers in database: ${customerCount}`);
    
    const leadCollection = db.collection('leads');
    const leadCount = await leadCollection.countDocuments();
    console.log(`🎯 Leads in database: ${leadCount}`);
    
    console.log('\n🎉 All tests passed! Your MongoDB Atlas connection is working correctly.');
    console.log('✅ You can now deploy to Vercel with confidence.');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This usually means:');
      console.log('   - Network access not configured in MongoDB Atlas');
      console.log('   - IP address not whitelisted');
      console.log('   - Check Network Access settings in MongoDB Atlas');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 This usually means:');
      console.log('   - Wrong username or password');
      console.log('   - Database user not created properly');
      console.log('   - Check Database Access settings in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 This usually means:');
      console.log('   - Invalid connection string');
      console.log('   - Wrong cluster URL');
      console.log('   - Check your connection string format');
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify your connection string format');
    console.log('2. Check Database Access settings in MongoDB Atlas');
    console.log('3. Check Network Access settings in MongoDB Atlas');
    console.log('4. Ensure your database user has proper permissions');
    
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connection closed.');
  }
}

testConnection(); 