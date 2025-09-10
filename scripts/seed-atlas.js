#!/usr/bin/env node

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('🌱 Seeding MongoDB Atlas with sample data...\n');

if (!MONGODB_URI) {
  console.log('❌ No MongoDB URI found!');
  process.exit(1);
}

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Create Customer model
    const CustomerSchema = new mongoose.Schema({
      name: { type: String, required: true },
      itemPurchased: { type: String, required: true },
      quantity: { type: Number, required: true },
      totalSpent: { type: Number, required: true },
      lastPurchase: { type: Date, required: true },
      isActive: { type: Boolean, default: true },
    });
    
    const Customer = mongoose.model('Customer', CustomerSchema);
    
    // Create Lead model
    const LeadSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true },
      status: { 
        type: String, 
        enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
        default: 'new'
      },
      value: { type: Number, default: 0 },
      source: { 
        type: String, 
        enum: ['website', 'referral', 'cold-call', 'social-media', 'email-campaign', 'other'],
        default: 'other'
      },
      priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      probability: { 
        type: Number, 
        min: 0, 
        max: 100, 
        default: 10 
      }
    }, {
      timestamps: true
    });
    
    const Lead = mongoose.model('Lead', LeadSchema);
    
    console.log('🧹 Clearing existing data...');
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    
    console.log('👥 Adding sample customers...');
    
    const customers = [
      {
        name: 'Adarsh',
        itemPurchased: 'iPhone 15 Pro',
        quantity: 1,
        totalSpent: 80000,
        lastPurchase: new Date('2024-01-15'),
        isActive: true
      },
      {
        name: 'Sumit Kumar',
        itemPurchased: 'Samsung Galaxy S24',
        quantity: 1,
        totalSpent: 18000,
        lastPurchase: new Date('2024-01-10'),
        isActive: true
      },
      {
        name: 'Priya Sharma',
        itemPurchased: 'MacBook Air M2',
        quantity: 1,
        totalSpent: 95000,
        lastPurchase: new Date('2024-01-20'),
        isActive: true
      },
      {
        name: 'Rahul Verma',
        itemPurchased: 'iPad Pro',
        quantity: 1,
        totalSpent: 65000,
        lastPurchase: new Date('2024-01-05'),
        isActive: false
      },
      {
        name: 'Anjali Patel',
        itemPurchased: 'AirPods Pro',
        quantity: 2,
        totalSpent: 45000,
        lastPurchase: new Date('2024-01-18'),
        isActive: true
      }
    ];
    
    const customerResults = await Customer.insertMany(customers);
    console.log(`✅ Added ${customerResults.length} customers`);
    
    console.log('🎯 Adding sample leads...');
    
    const leads = [
      {
        name: 'Rajesh Singh',
        email: 'rajesh.singh@company.com',
        status: 'qualified',
        value: 50000,
        source: 'website',
        priority: 'high',
        probability: 75
      },
      {
        name: 'Meera Kapoor',
        email: 'meera.kapoor@startup.com',
        status: 'contacted',
        value: 35000,
        source: 'referral',
        priority: 'medium',
        probability: 60
      },
      {
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@enterprise.com',
        status: 'new',
        value: 120000,
        source: 'cold-call',
        priority: 'high',
        probability: 40
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@tech.com',
        status: 'proposal',
        value: 75000,
        source: 'social-media',
        priority: 'medium',
        probability: 85
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@consulting.com',
        status: 'negotiation',
        value: 90000,
        source: 'email-campaign',
        priority: 'high',
        probability: 90
      }
    ];
    
    const leadResults = await Lead.insertMany(leads);
    console.log(`✅ Added ${leadResults.length} leads`);
    
    console.log('\n🎉 Sample data seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Customers: ${customerResults.length}`);
    console.log(`   🎯 Leads: ${leadResults.length}`);
    console.log('✅ Your MongoDB Atlas database is now ready for Vercel deployment!');
    
  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Connection closed.');
  }
}

seedData(); 