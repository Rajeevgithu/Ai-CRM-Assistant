import fs from 'fs';
import path from 'path';

async function setupLocalDatabase() {
  try {
    console.log('🔧 SETTING UP LOCAL DATABASE CONNECTION...');
    console.log('=' .repeat(60));

    const envContent = `# OpenAI API Configuration
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Configuration - Local Database (where your original data is)
MONGODB_URI=mongodb://localhost:27017/ai-crm-assistant
MONGO_URI=mongodb://localhost:27017/ai-crm-assistant

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

    const envPath = path.join(process.cwd(), '.env.local');
    
    console.log('📋 Creating .env.local file with local database connection...');
    console.log(`📁 File path: ${envPath}`);
    
    // Check if file already exists
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env.local file already exists!');
      console.log('💡 Please manually update it with these settings:');
      console.log('\n' + envContent);
    } else {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local file created successfully!');
    }

    console.log('\n🎯 YOUR ORIGINAL CUSTOMER DATA:');
    console.log('=' .repeat(60));
    console.log('1. Rajeev - ₹10,000');
    console.log('2. Raj - ₹30,000');
    console.log('3. sumit - ₹18,000');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Your original customers should now appear in the app');
    console.log('3. The app will now use your local MongoDB database');
    
    console.log('\n💡 If you want to keep both databases:');
    console.log('- You can copy data between them using the scripts');
    console.log('- Or maintain separate environments for different purposes');

  } catch (error) {
    console.error('❌ Error setting up local database:', error);
  }
}

setupLocalDatabase(); 