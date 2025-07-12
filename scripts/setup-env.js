#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AI CRM Assistant Environment Setup\n');

const envPath = path.join(process.cwd(), '.env.local');
const examplePath = path.join(process.cwd(), 'env.example');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}

function setupEnvironment() {
  console.log('\n📝 Let\'s configure your environment variables:\n');
  
  const envVars = {};
  
  rl.question('Enter your OpenAI API Key: ', (openaiKey) => {
    envVars.OPENAI_API_KEY = openaiKey.trim();
    
    console.log('\n🗄️  MongoDB Configuration:');
    console.log('1. Local MongoDB (mongodb://localhost:27017/ai-crm-assistant)');
    console.log('2. MongoDB Atlas (cloud database)');
    
    rl.question('Choose MongoDB option (1 or 2): ', (option) => {
      if (option === '1') {
        envVars.MONGODB_URI = 'mongodb://localhost:27017/ai-crm-assistant';
        envVars.MONGO_URI = 'mongodb://localhost:27017/ai-crm-assistant';
        saveEnvironmentFile(envVars);
      } else if (option === '2') {
        rl.question('Enter your MongoDB Atlas connection string: ', (mongoUri) => {
          envVars.MONGODB_URI = mongoUri.trim();
          envVars.MONGO_URI = mongoUri.trim();
          saveEnvironmentFile(envVars);
        });
      } else {
        console.log('Invalid option. Using local MongoDB.');
        envVars.MONGODB_URI = 'mongodb://localhost:27017/ai-crm-assistant';
        envVars.MONGO_URI = 'mongodb://localhost:27017/ai-crm-assistant';
        saveEnvironmentFile(envVars);
      }
    });
  });
}

function saveEnvironmentFile(envVars) {
  const envContent = `# OpenAI API Configuration
OPENAI_API_KEY=${envVars.OPENAI_API_KEY}

# MongoDB Configuration
MONGODB_URI=${envVars.MONGODB_URI}
MONGO_URI=${envVars.MONGO_URI}

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Environment file created successfully!');
    console.log('📁 File location: .env.local');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Use the diagnostic tool to verify your setup');
    console.log('\n⚠️  Important: Make sure to add credits to your OpenAI account!');
  } catch (error) {
    console.error('❌ Error creating environment file:', error.message);
  }
  
  rl.close();
} 