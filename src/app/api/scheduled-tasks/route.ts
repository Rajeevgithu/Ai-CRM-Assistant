import { NextRequest, NextResponse } from 'next/server';
import { smartAgent } from '../../../lib/langchain';
import dbConnect from '../../../lib/mongodb';
import Customer from '../../../models/Customer';
import Lead from '../../../models/Lead';

// GET → Get scheduled tasks status and history
export async function GET(req: NextRequest) {
  try {
    // Generate real-time results for each task type
    const [dailySummary, weeklyReport, followUpEmails] = await Promise.all([
      generateDailySummary(),
      generateWeeklyReport(),
      sendFollowUpEmails()
    ]);

    const realTaskHistory = [
      {
        id: '1',
        type: 'daily_summary',
        status: 'completed',
        executedAt: dailySummary.date || new Date().toISOString(),
        result: dailySummary
      },
      {
        id: '2',
        type: 'weekly_report',
        status: 'completed',
        executedAt: weeklyReport.period?.split(' to ')[1] || new Date().toISOString(),
        result: weeklyReport
      },
      {
        id: '3',
        type: 'follow_up_emails',
        status: 'completed',
        executedAt: new Date().toISOString(),
        result: followUpEmails
      }
    ];

    return NextResponse.json({ 
      tasks: realTaskHistory,
      nextScheduled: {
        daily_summary: new Date(Date.now() + 86400000).toISOString(),
        weekly_report: new Date(Date.now() + 604800000).toISOString(),
        follow_up_emails: new Date(Date.now() + 86400000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled tasks' }, { status: 500 });
  }
}

// POST → Execute scheduled tasks manually
export async function POST(req: NextRequest) {
  try {
    const { taskType, force = false } = await req.json();
    
    if (!taskType) {
      return NextResponse.json({ error: 'Task type is required' }, { status: 400 });
    }

    await dbConnect();
    
    let result;
    
    switch (taskType) {
      case 'daily_summary':
        result = await generateDailySummary();
        break;
      case 'weekly_report':
        result = await generateWeeklyReport();
        break;
      case 'follow_up_emails':
        result = await sendFollowUpEmails();
        break;
      case 'customer_insights':
        result = await generateCustomerInsights();
        break;
      case 'sales_forecast':
        result = await generateSalesForecast();
        break;
      default:
        return NextResponse.json({ error: 'Unknown task type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      taskType,
      result,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing scheduled task:', error);
    return NextResponse.json({ error: 'Failed to execute scheduled task' }, { status: 500 });
  }
}

// Helper functions for different task types
async function generateDailySummary() {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  
  // Get yesterday's data
  const newCustomers = await Customer.countDocuments({
    createdAt: { $gte: yesterday, $lt: today }
  });
  
  const newLeads = await Lead.countDocuments({
    createdAt: { $gte: yesterday, $lt: today }
  });
  
  const revenue = await Customer.aggregate([
    {
      $match: {
        lastPurchase: { $gte: yesterday, $lt: today }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalSpent' }
      }
    }
  ]);

  const summary = {
    date: yesterday.toISOString().split('T')[0],
    newCustomers,
    newLeads,
    revenue: revenue[0]?.total || 0,
    insights: [
      `Added ${newCustomers} new customers`,
      `Generated ${newLeads} new leads`,
      `Generated $${revenue[0]?.total || 0} in revenue`
    ]
  };

  // In a real implementation, this would be sent via email or stored
  console.log('📊 Daily Summary Generated:', summary);
  
  return summary;
}

async function generateWeeklyReport() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  
  // Get weekly data
  const weeklyCustomers = await Customer.countDocuments({
    createdAt: { $gte: weekAgo, $lt: today }
  });
  
  const weeklyLeads = await Lead.countDocuments({
    createdAt: { $gte: weekAgo, $lt: today }
  });
  
  const weeklyRevenue = await Customer.aggregate([
    {
      $match: {
        lastPurchase: { $gte: weekAgo, $lt: today }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalSpent' }
      }
    }
  ]);

  const topCustomers = await Customer.find({})
    .sort({ totalSpent: -1 })
    .limit(5)
    .select('name totalSpent -_id');

  const report = {
    period: `${weekAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`,
    newCustomers: weeklyCustomers,
    newLeads: weeklyLeads,
    revenue: weeklyRevenue[0]?.total || 0,
    topCustomers: topCustomers.map(c => ({ name: c.name, revenue: c.totalSpent })),
    recommendations: [
      'Focus on lead conversion optimization',
      'Implement customer retention strategies',
      'Develop upselling opportunities'
    ]
  };

  console.log('📈 Weekly Report Generated:', report);
  
  return report;
}

async function sendFollowUpEmails() {
  const today = new Date();
  const threeDaysAgo = new Date(today.getTime() - 3 * 86400000);
  
  // Find leads that need follow-up
  const leadsNeedingFollowUp = await Lead.find({
    status: { $nin: ['closed-won', 'closed-lost'] },
    lastContact: { $lt: threeDaysAgo }
  }).limit(10);

  const emailResults = [];
  
  for (const lead of leadsNeedingFollowUp) {
    try {
      // Simulate sending email
      const emailResult = await smartAgent.run(
        `Send a follow-up email to ${lead.name} (${lead.email}) about their lead status. They were last contacted on ${lead.lastContact}.`
      );
      
      emailResults.push({
        lead: lead.name,
        email: lead.email,
        status: 'sent',
        result: emailResult
      });
      
      // Update last contact date
      await Lead.findByIdAndUpdate(lead._id, {
        lastContact: today
      });
      
    } catch (error) {
      emailResults.push({
        lead: lead.name,
        email: lead.email,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  console.log('📧 Follow-up Emails Sent:', emailResults);
  
  return {
    emailsSent: emailResults.filter(r => r.status === 'sent').length,
    emailsFailed: emailResults.filter(r => r.status === 'failed').length,
    details: emailResults
  };
}

async function generateCustomerInsights() {
  const customers = await Customer.find({}).select('name totalSpent lastPurchase -_id');
  
  // Analyze customer segments
  const segments = {
    highValue: customers.filter(c => c.totalSpent >= 1000),
    mediumValue: customers.filter(c => c.totalSpent >= 500 && c.totalSpent < 1000),
    lowValue: customers.filter(c => c.totalSpent < 500)
  };

  // Identify at-risk customers
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const atRiskCustomers = customers.filter(c => c.lastPurchase < thirtyDaysAgo);

  const insights = {
    totalCustomers: customers.length,
    segments: {
      highValue: segments.highValue.length,
      mediumValue: segments.mediumValue.length,
      lowValue: segments.lowValue.length
    },
    atRiskCustomers: atRiskCustomers.length,
    recommendations: [
      `Focus retention efforts on ${atRiskCustomers.length} at-risk customers`,
      `Develop upselling strategies for ${segments.mediumValue.length} medium-value customers`,
      `Implement loyalty programs for ${segments.lowValue.length} low-value customers`
    ]
  };

  console.log('🧠 Customer Insights Generated:', insights);
  
  return insights;
}

async function generateSalesForecast() {
  // Get historical data for forecasting
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyData = await Customer.aggregate([
    { $match: { lastPurchase: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$lastPurchase' },
          month: { $month: '$lastPurchase' }
        },
        total: { $sum: '$totalSpent' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Simple trend analysis
  const recentMonths = monthlyData.slice(-3);
  const avgGrowth = recentMonths.length > 1 ? 
    (recentMonths[recentMonths.length - 1].total - recentMonths[0].total) / recentMonths.length : 0;

  const forecast = {
    historicalData: monthlyData,
    trend: avgGrowth > 0 ? 'increasing' : avgGrowth < 0 ? 'decreasing' : 'stable',
    nextMonthProjection: recentMonths[recentMonths.length - 1]?.total + avgGrowth || 0,
    confidence: 'medium',
    factors: [
      'Historical growth patterns',
      'Seasonal trends',
      'Market conditions'
    ]
  };

  console.log('🔮 Sales Forecast Generated:', forecast);
  
  return forecast;
} 