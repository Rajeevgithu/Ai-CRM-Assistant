#!/usr/bin/env node

const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Checking Environment Variables for Vercel Deployment...\n');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const openaiKey = process.env.OPENAI_API_KEY;

console.log('📋 Environment Variables Status:');

if (mongoUri) {
  if (mongoUri.includes('mongodb+srv://')) {
    console.log('✅ MONGODB_URI: MongoDB Atlas (cloud) - Ready for Vercel');
    console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  } else if (mongoUri.includes('localhost')) {
    console.log('❌ MONGODB_URI: Local MongoDB - Will NOT work on Vercel');
    console.log('   You need to use MongoDB Atlas for Vercel deployment');
  } else {
    console.log('❓ MONGODB_URI: Unknown format');
  }
} else {
  console.log('❌ MONGODB_URI: Not found');
}

if (openaiKey) {
  if (openaiKey.length > 20) {
    console.log('✅ OPENAI_API_KEY: Found and valid');
  } else {
    console.log('❌ OPENAI_API_KEY: Invalid or too short');
  }
} else {
  console.log('❌ OPENAI_API_KEY: Not found');
}

console.log('\n🚀 Next Steps for Vercel:');
console.log('1. Copy these exact values to Vercel Environment Variables');
console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('3. Add MONGODB_URI, MONGO_URI, and OPENAI_API_KEY');
console.log('4. Redeploy your application');

if (mongoUri && mongoUri.includes('mongodb+srv://') && openaiKey && openaiKey.length > 20) {
  console.log('\n🎉 All environment variables are ready for Vercel deployment!');
} else {
  console.log('\n⚠️  Please fix the missing or invalid environment variables before deploying to Vercel.');
} 