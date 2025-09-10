import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Lead from '@/models/Lead';

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MongoDB URI not configured');
      return NextResponse.json(
        { 
          error: 'Database not configured. Please set MONGODB_URI environment variable.',
          details: 'This usually happens when deploying to Vercel without proper environment variables.'
        },
        { status: 500 }
      );
    }

    await dbConnect();

    // Fetch all data in parallel with optimized field selection
    const [customers, leads] = await Promise.all([
      Customer.find({ isActive: true })
        .select('_id name itemPurchased totalSpent lastPurchase isActive')
        .sort({ totalSpent: -1 })
        .limit(10),
      Lead.find({})
        .select('_id name status value createdAt')
        .sort({ createdAt: -1 })
        .limit(50)
    ]);

    // Calculate analytics
    const totalRevenue = customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0);
    const avgOrderValue = customers.length > 0 ? totalRevenue / customers.length : 0;
    
    // Calculate at-risk customers (no purchase in 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const atRiskCustomers = customers.filter(customer => 
      customer.lastPurchase && new Date(customer.lastPurchase) < thirtyDaysAgo
    ).length;

    // Calculate lead metrics
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    const dashboardData = {
      customers: customers, // Return all customers, don't filter by isActive
      leads: leads,
      analytics: {
        totalRevenue,
        totalCustomers: customers.length,
        totalLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgOrderValue: Math.round(avgOrderValue),
        atRiskCustomers,
        topCustomers: customers.slice(0, 5), // Don't filter by isActive here either
        recentActivity: leads.slice(0, 5).map(lead => ({
          type: 'lead',
          id: lead._id,
          name: lead.name,
          status: lead.status,
          value: lead.value,
          createdAt: lead.createdAt
        }))
      }
    };

    return NextResponse.json(dashboardData.analytics);
  } catch (error: unknown) {
    console.error('Error fetching dashboard data:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch dashboard data';
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Database connection failed. Please check your MongoDB connection string.';
      } else if (error.message.includes('Authentication failed')) {
        errorMessage = 'Database authentication failed. Please check your MongoDB credentials.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'This usually indicates a database connection issue. Check your environment variables on Vercel.'
      },
      { status: 500 }
    );
  }
} 