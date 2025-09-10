#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/ai-crm-assistant';
const ATLAS_MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('🚀 Migrating data from local MongoDB to MongoDB Atlas...\n');

if (!ATLAS_MONGODB_URI) {
  console.log('❌ No MongoDB Atlas URI found!');
  console.log('Please set MONGODB_URI in your .env.local file.');
  process.exit(1);
}

if (ATLAS_MONGODB_URI.includes('localhost')) {
  console.log('❌ You are using a local MongoDB URI for Atlas!');
  console.log('Please set up MongoDB Atlas and update your connection string.');
  process.exit(1);
}

async function migrateData() {
  let localConnection, atlasConnection;
  
  try {
    console.log('🔌 Connecting to local MongoDB...');
    localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI);
    console.log('✅ Connected to local MongoDB');
    
    console.log('🔌 Connecting to MongoDB Atlas...');
    atlasConnection = await mongoose.createConnection(ATLAS_MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Use direct collections instead of models
    const localDb = localConnection.db;
    const atlasDb = atlasConnection.db;
    
    console.log('\n📊 Starting data migration...');
    
    // Migrate Customers
    console.log('👥 Migrating customers...');
    const localCustomers = localDb.collection('customers');
    const atlasCustomers = atlasDb.collection('customers');
    
    const customers = await localCustomers.find({}).toArray();
    console.log(`Found ${customers.length} customers in local database`);
    
    if (customers.length > 0) {
      // Clear existing data in Atlas
      await atlasCustomers.deleteMany({});
      
      // Insert customers into Atlas
      const customerResults = await atlasCustomers.insertMany(customers);
      console.log(`✅ Migrated ${customerResults.insertedCount} customers to Atlas`);
    }
    
    // Migrate Leads
    console.log('🎯 Migrating leads...');
    const localLeads = localDb.collection('leads');
    const atlasLeads = atlasDb.collection('leads');
    
    const leads = await localLeads.find({}).toArray();
    console.log(`Found ${leads.length} leads in local database`);
    
    if (leads.length > 0) {
      // Clear existing data in Atlas
      await atlasLeads.deleteMany({});
      
      // Insert leads into Atlas
      const leadResults = await atlasLeads.insertMany(leads);
      console.log(`✅ Migrated ${leadResults.insertedCount} leads to Atlas`);
    }
    
    console.log('\n🎉 Data migration completed successfully!');
    console.log('✅ Your data is now available in MongoDB Atlas');
    console.log('✅ You can now deploy to Vercel with your data');
    
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your local MongoDB is running:');
      console.log('   - Start MongoDB service');
      console.log('   - Or run: npm run setup-local-db');
    }
    
  } finally {
    if (localConnection) {
      await localConnection.close();
      console.log('🔌 Local connection closed');
    }
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('🔌 Atlas connection closed');
    }
  }
}

migrateData(); 