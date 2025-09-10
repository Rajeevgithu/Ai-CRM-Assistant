#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MongoDB URI Update Helper\n');

console.log('📋 Your current MongoDB URI:');
console.log('mongodb+srv://crm_user:GPD2n7ojffNJQGhx@cluster1.lr1sq1b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1\n');

console.log('⚠️  Issues detected:');
console.log('1. Missing database name');
console.log('2. appName parameter might cause issues\n');

console.log('✅ Corrected MongoDB URI should be:');
console.log('mongodb+srv://crm_user:GPD2n7ojffNJQGhx@cluster1.lr1sq1b.mongodb.net/ai-crm-assistant?retryWrites=true&w=majority\n');

rl.question('Would you like me to update your .env.local file with the corrected URI? (y/N): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    updateEnvironmentFile();
  } else {
    console.log('\n📝 Manual update instructions:');
    console.log('1. Open your .env.local file');
    console.log('2. Update MONGODB_URI to:');
    console.log('   mongodb+srv://crm_user:GPD2n7ojffNJQGhx@cluster1.lr1sq1b.mongodb.net/ai-crm-assistant?retryWrites=true&w=majority');
    console.log('3. Update MONGO_URI to the same value');
    console.log('4. Save the file');
    rl.close();
  }
});

function updateEnvironmentFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('\n❌ .env.local file not found!');
    console.log('Please run: npm run setup');
    rl.close();
    return;
  }

  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update MONGODB_URI
    const correctedUri = 'mongodb+srv://crm_user:GPD2n7ojffNJQGhx@cluster1.lr1sq1b.mongodb.net/ai-crm-assistant?retryWrites=true&w=majority';
    
    // Replace existing MONGODB_URI
    envContent = envContent.replace(
      /MONGODB_URI=.*/g,
      `MONGODB_URI=${correctedUri}`
    );
    
    // Replace existing MONGO_URI
    envContent = envContent.replace(
      /MONGO_URI=.*/g,
      `MONGO_URI=${correctedUri}`
    );
    
    // Write back to file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env.local file updated successfully!');
    console.log('📝 Updated MONGODB_URI and MONGO_URI with corrected connection string');
    
    console.log('\n🧪 Testing the updated connection...');
    console.log('Run: npm run test-mongodb');
    
  } catch (error) {
    console.error('\n❌ Error updating .env.local file:', error.message);
  }
  
  rl.close();
} 