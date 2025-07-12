import { NextResponse } from 'next/server';

export async function GET() {
  const requiredVars = ['OPENAI_API_KEY', 'MONGODB_URI', 'MONGO_URI'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  // Check if at least one MongoDB URI is available
  const hasMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const adjustedMissing = missing.filter(varName => varName !== 'MONGO_URI' && varName !== 'MONGODB_URI');
  if (!hasMongoUri) {
    adjustedMissing.push('MONGODB_URI');
  }
  
  return NextResponse.json({
    ok: adjustedMissing.length === 0,
    missing: adjustedMissing,
    available: Object.keys(process.env).filter(key => 
      key.includes('OPENAI') || key.includes('MONGO') || key.includes('MONGODB')
    )
  });
} 