import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Lead from '../../../models/Lead';
import { getCachedData, setCachedData } from '../../../lib/utils';

// GET → Fetch leads with filtering and analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assignedTo');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Create cache key based on parameters
    const cacheKey = `leads-${JSON.stringify({ status, source, assignedTo, priority, limit, page })}`;
    
    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    await dbConnect();
    
    // Build filter object
    const filter: any = {};
    if (status && status !== 'all') filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    
    // Get leads with pagination
    const skip = (page - 1) * limit;
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Lead.countDocuments(filter);
    
    // Get analytics data
    const analytics = await getLeadAnalytics();
    
    const result = { 
      leads, 
      total, 
      page, 
      limit, 
      totalPages: Math.ceil(total / limit),
      analytics 
    };
    
    // Cache the result
    setCachedData(cacheKey, result);
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST → Create new lead or handle AI message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if this is an AI message request
    if (body.message) {
      try {
        // Try to use the real AI agent first
        const { runAgent } = await import('../../../lib/langchain');
        const reply = await runAgent(body.message);
        return NextResponse.json({ reply });
      } catch (error: unknown) {
        console.log('OpenAI API unavailable, using mock response:', error);
        
        // Fallback to mock AI service
        const { getEnhancedMockResponse } = await import('../../../lib/mockAI');
        const mockResponse = await getEnhancedMockResponse(body.message);
        
        return NextResponse.json({ 
          reply: mockResponse.reply,
          isMock: mockResponse.isMock,
          suggestion: mockResponse.suggestion,
          error: 'OpenAI API unavailable - using demo mode'
        });
      }
    }
    
    // Create new lead
    await dbConnect();
    
    const lead = new Lead(body);
    await lead.save();
    
    return NextResponse.json({ 
      success: true, 
      lead,
      message: 'Lead created successfully' 
    });
  } catch (error: unknown) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

// PUT → Update lead
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    const lead = await Lead.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      lead,
      message: 'Lead updated successfully' 
    });
  } catch (error: unknown) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE → Delete lead
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    const lead = await Lead.findByIdAndDelete(id);
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Lead deleted successfully' 
    });
  } catch (error: unknown) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}

// Helper function to get lead analytics
async function getLeadAnalytics() {
  const totalLeads = await Lead.countDocuments();
  const totalValue = await Lead.aggregate([
    { $group: { _id: null, total: { $sum: '$value' } } }
  ]);
  
  const statusCounts = await Lead.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const sourceCounts = await Lead.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } }
  ]);
  
  const priorityCounts = await Lead.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
  
  // Calculate conversion rate
  const wonLeads = await Lead.countDocuments({ status: 'closed-won' });
  const lostLeads = await Lead.countDocuments({ status: 'closed-lost' });
  const conversionRate = (wonLeads + lostLeads) > 0 ? 
    (wonLeads / (wonLeads + lostLeads) * 100).toFixed(1) : 0;
  
  // Get recent activity
  const recentLeads = await Lead.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name status value createdAt');
  
  // Get leads needing follow-up
  const today = new Date();
  const followUpLeads = await Lead.countDocuments({
    nextFollowUp: { $lte: today },
    status: { $nin: ['closed-won', 'closed-lost'] }
  });
  
  return {
    totalLeads,
    totalValue: totalValue[0]?.total || 0,
    statusCounts: statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    sourceCounts: sourceCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    priorityCounts: priorityCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    conversionRate: parseFloat(conversionRate.toString()),
    recentLeads,
    followUpLeads
  };
}
