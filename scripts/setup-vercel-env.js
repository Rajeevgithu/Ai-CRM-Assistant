#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Vercel Environment Setup Guide\n');

console.log('📋 To fix the dashboard errors on Vercel, you need to set up environment variables:\n');

console.log('1️⃣  MONGODB_URI (Required)');
console.log('   - You need a cloud MongoDB database (MongoDB Atlas recommended)');
console.log('   - Go to: https://www.mongodb.com/atlas');
console.log('   - Create a free cluster');
console.log('   - Get your connection string');
console.log('   - Format: mongodb+srv://username:password@cluster.mongodb.net/database\n');

console.log('2️⃣  OPENAI_API_KEY (Required for AI features)');
console.log('   - Go to: https://platform.openai.com/api-keys');
console.log('   - Create a new API key');
console.log('   - Add credits to your account\n');

console.log('3️⃣  Setting up on Vercel:');
console.log('   - Go to your Vercel dashboard');
console.log('   - Select your project');
console.log('   - Go to Settings > Environment Variables');
console.log('   - Add these variables:\n');

console.log('   MONGODB_URI = your_mongodb_atlas_connection_string');
console.log('   MONGO_URI = your_mongodb_atlas_connection_string');
console.log('   OPENAI_API_KEY = your_openai_api_key\n');

console.log('4️⃣  After adding environment variables:');
console.log('   - Redeploy your application');
console.log('   - The dashboard should work properly\n');

console.log('🔧 Quick MongoDB Atlas Setup:');
console.log('   1. Visit https://www.mongodb.com/atlas');
console.log('   2. Sign up for free account');
console.log('   3. Create a new cluster (free tier)');
console.log('   4. Click "Connect" on your cluster');
console.log('   5. Choose "Connect your application"');
console.log('   6. Copy the connection string');
console.log('   7. Replace <password> with your database user password');
console.log('   8. Replace <dbname> with "ai-crm-assistant"\n');

rl.question('Would you like me to help you test your current environment variables? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    testEnvironmentVariables();
  } else {
    console.log('\n✅ Setup guide completed! Follow the steps above to configure Vercel.');
    rl.close();
  }
});

function testEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('\n❌ No .env.local file found!');
    console.log('Run: npm run setup');
    rl.close();
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n📋 Current Environment Variables:');
  
  const mongoUri = lines.find(line => line.startsWith('MONGODB_URI='));
  const openaiKey = lines.find(line => line.startsWith('OPENAI_API_KEY='));
  
  if (mongoUri) {
    const uri = mongoUri.split('=')[1];
    if (uri.includes('mongodb+srv://')) {
      console.log('✅ MONGODB_URI: MongoDB Atlas (cloud)');
    } else if (uri.includes('localhost')) {
      console.log('⚠️  MONGODB_URI: Local MongoDB (will not work on Vercel)');
    } else {
      console.log('❓ MONGODB_URI: Unknown format');
    }
  } else {
    console.log('❌ MONGODB_URI: Not found');
  }
  
  if (openaiKey) {
    const key = openaiKey.split('=')[1];
    if (key && key.length > 20) {
      console.log('✅ OPENAI_API_KEY: Found');
    } else {
      console.log('❌ OPENAI_API_KEY: Invalid or missing');
    }
  } else {
    console.log('❌ OPENAI_API_KEY: Not found');
  }
  
  console.log('\n💡 For Vercel deployment, you need MongoDB Atlas (cloud database)');
  console.log('   Local MongoDB will not work on Vercel!');
  
  rl.close();
} 