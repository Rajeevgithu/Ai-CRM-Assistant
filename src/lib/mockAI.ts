import dbConnect from './mongodb';
import Customer from '../models/Customer';
import Lead from '../models/Lead';

interface MockResponse {
  reply: string;
  isMock: boolean;
  suggestion?: string;
}

// Mock AI responses for common business queries
const mockResponses: { [key: string]: string } = {
  // Customer analysis
  'top customers': 'Based on your data, your top customers are generating significant revenue. I recommend focusing on retention strategies and upselling opportunities for these high-value accounts.',
  'customer insights': 'Your customer base shows diverse spending patterns. Consider implementing targeted marketing campaigns based on customer segments to maximize engagement.',
  'revenue analysis': 'Your revenue trends indicate steady growth. Focus on expanding your customer base while maintaining relationships with existing high-value customers.',
  
  // Sales pipeline
  'sales pipeline': 'Your pipeline shows good activity across all stages. I recommend prioritizing leads in the proposal and negotiation phases to accelerate conversions.',
  'lead analysis': 'Your leads demonstrate strong potential. Focus on qualifying leads early and maintaining consistent follow-up to improve conversion rates.',
  'conversion rates': 'Your conversion rates are within industry standards. Consider implementing lead scoring and automated follow-up sequences to improve performance.',
  
  // Business strategy
  'business strategy': 'Based on your current performance, I recommend focusing on customer retention, lead qualification, and process optimization to drive sustainable growth.',
  'growth opportunities': 'Identify opportunities in your existing customer base through upselling and cross-selling, while expanding your lead generation efforts.',
  'performance improvement': 'Focus on data-driven decision making, customer feedback, and process optimization to improve overall business performance.',
  
  // General queries
  'hello': 'Hello! I\'m your AI business assistant. I can help you analyze customer data, review your sales pipeline, and provide strategic insights. What would you like to know?',
  'help': 'I can help you with customer analysis, sales pipeline review, revenue forecasting, lead management, and business strategy. Just ask me about any aspect of your business!',
  'status': 'Your business is performing well with steady growth. I can provide detailed analysis on any specific area you\'d like to explore.',
  
  // Default response
  'default': 'I understand your question about business performance. While I\'m currently in demo mode, I can provide general insights based on typical business patterns. For detailed analysis, please ensure your OpenAI API is properly configured with sufficient credits.'
};

// Keywords to match user queries
const keywordMappings: { [key: string]: string } = {
  'customer': 'customer insights',
  'top': 'top customers',
  'revenue': 'revenue analysis',
  'sales': 'sales pipeline',
  'pipeline': 'sales pipeline',
  'lead': 'lead analysis',
  'conversion': 'conversion rates',
  'strategy': 'business strategy',
  'growth': 'growth opportunities',
  'performance': 'performance improvement',
  'hello': 'hello',
  'hi': 'hello',
  'help': 'help',
  'status': 'status'
};

export async function getMockResponse(userMessage: string): Promise<MockResponse> {
  const message = userMessage.toLowerCase();
  
  // Try to match keywords
  for (const [keyword, responseKey] of Object.entries(keywordMappings)) {
    if (message.includes(keyword)) {
      return {
        reply: mockResponses[responseKey],
        isMock: true,
        suggestion: 'This is a mock response. Add credits to your OpenAI account for real AI analysis.'
      };
    }
  }
  
  // If no specific match, provide a contextual response
  if (message.includes('?')) {
    return {
      reply: mockResponses['default'],
      isMock: true,
      suggestion: 'For detailed AI analysis, please add credits to your OpenAI account at https://platform.openai.com/account/billing'
    };
  }
  
  // Default greeting
  return {
    reply: mockResponses['hello'],
    isMock: true,
    suggestion: 'I\'m currently in demo mode. Add OpenAI credits for full AI capabilities.'
  };
}

// Enhanced mock response with real data when possible
export async function getEnhancedMockResponse(userMessage: string): Promise<MockResponse> {
  try {
    await dbConnect();
    
    const message = userMessage.toLowerCase();
    
    // Try to provide responses with real data
    if (message.includes('customer') || message.includes('top')) {
      const topCustomers = await Customer.find({})
        .sort({ totalSpent: -1 })
        .limit(3)
        .select('name totalSpent -_id');
      
      if (topCustomers.length > 0) {
        const customerList = topCustomers.map(c => `${c.name} ($${c.totalSpent})`).join(', ');
        return {
          reply: `Your top customers are: ${customerList}. These customers represent significant revenue opportunities. Focus on retention and upselling strategies.`,
          isMock: true,
          suggestion: 'Add OpenAI credits for advanced customer analysis and personalized recommendations.'
        };
      }
    }
    
    if (message.includes('lead') || message.includes('pipeline')) {
      const totalLeads = await Lead.countDocuments();
      const recentLeads = await Lead.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name status value -_id');
      
      if (totalLeads > 0) {
        const leadSummary = recentLeads.map(l => `${l.name} (${l.status})`).join(', ');
        return {
          reply: `You have ${totalLeads} total leads. Recent additions include: ${leadSummary}. Your pipeline shows good activity across different stages.`,
          isMock: true,
          suggestion: 'Add OpenAI credits for detailed lead scoring and conversion analysis.'
        };
      }
    }
    
    if (message.includes('revenue') || message.includes('sales')) {
      const totalRevenue = await Customer.aggregate([
        { $group: { _id: null, total: { $sum: '$totalSpent' } } }
      ]);
      
      if (totalRevenue.length > 0) {
        const revenue = totalRevenue[0].total;
        return {
          reply: `Your total revenue from customers is ₹${revenue.toLocaleString('en-IN')}. This represents strong business performance. Consider strategies to increase average order value and customer lifetime value.`,
          isMock: true,
          suggestion: 'Add OpenAI credits for revenue forecasting and trend analysis.'
        };
      }
    }
    
  } catch (error: unknown) {
    console.error('Error getting enhanced mock response:', error);
  }
  
  // Fallback to basic mock response
  return getMockResponse(userMessage);
} 