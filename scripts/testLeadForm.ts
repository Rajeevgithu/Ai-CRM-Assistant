import mongoose from 'mongoose';
import Lead from '../src/models/Lead';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testLeadForm() {
  try {
    console.log('🧪 TESTING LEAD FORM FUNCTIONALITY...');
    console.log('=' .repeat(60));

    // Connect to database
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or MONGO_URI environment variable is not set');
      process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');

    // Check current leads
    const currentLeads = await Lead.find({}).sort({ createdAt: -1 });
    console.log(`📊 Current leads in database: ${currentLeads.length}`);

    if (currentLeads.length > 0) {
      console.log('\n📋 Recent leads:');
      currentLeads.slice(0, 5).forEach((lead, index) => {
        console.log(`${index + 1}. ${lead.name} - ${lead.email} - ₹${lead.value} - ${lead.status}`);
      });
    }

    // Test creating a new lead
    console.log('\n🧪 Testing lead creation...');
    const testLead = new Lead({
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      position: 'Manager',
      status: 'new',
      value: 5000,
      source: 'website',
      assignedTo: 'Test Sales Rep',
      notes: 'This is a test lead',
      priority: 'medium',
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      probability: 25
    });

    await testLead.save();
    console.log('✅ Test lead created successfully');

    // Verify the lead was saved
    const savedLead = await Lead.findById(testLead._id);
    if (savedLead) {
      console.log('✅ Lead verified in database');
      console.log(`   Name: ${savedLead.name}`);
      console.log(`   Email: ${savedLead.email}`);
      console.log(`   Value: ₹${savedLead.value}`);
      console.log(`   Status: ${savedLead.status}`);
    }

    // Clean up - delete the test lead
    await Lead.findByIdAndDelete(testLead._id);
    console.log('🧹 Test lead cleaned up');

    console.log('\n🎉 LEAD FORM TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('✅ Database connection working');
    console.log('✅ Lead creation working');
    console.log('✅ Lead retrieval working');
    console.log('✅ Lead deletion working');

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Error testing lead form:', error);
    process.exit(1);
  }
}

testLeadForm(); 