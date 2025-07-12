import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        ok: false, 
        error: 'OPENAI_API_KEY environment variable is not set' 
      });
    }

    const model = new ChatOpenAI({ 
      temperature: 0,
      model: 'gpt-3.5-turbo',
      maxTokens: 10
    });

    await model.invoke('Hello');
    
    return NextResponse.json({ 
      ok: true, 
      message: 'OpenAI API connected successfully',
      model: 'gpt-3.5-turbo'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown OpenAI API error';
    
    // Provide specific guidance for common errors
    let suggestion = '';
    if (errorMessage.includes('429')) {
      suggestion = 'You have exceeded your OpenAI API quota. Please check your billing and add credits to your account.';
    } else if (errorMessage.includes('401')) {
      suggestion = 'Invalid API key. Please check your OPENAI_API_KEY in .env.local';
    } else if (errorMessage.includes('rate limit')) {
      suggestion = 'Rate limit exceeded. Please wait a moment and try again.';
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: errorMessage,
      suggestion
    });
  }
} 