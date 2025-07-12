import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Lead from '@/models/Lead';

export async function GET() {
  try {
    await dbConnect();

    // Fetch real data from database
    const customers = await Customer.find({ isActive: true });
    const leads = await Lead.find({});

    // Calculate customer metrics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const newCustomers = customers.filter(c => {
      const lastPurchase = new Date(c.lastPurchase);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastPurchase > thirtyDaysAgo;
    }).length;

    // Calculate lead metrics
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    // Calculate revenue (using customer totalSpent data)
    const totalRevenue = customers.reduce((sum, customer) => {
      return sum + (customer.totalSpent || 0);
    }, 0);

    // Calculate previous period revenue (mock for now, but could be based on historical data)
    const previousRevenue = totalRevenue * 0.9; // 10% less for demo
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Generate monthly data from real customer data
    const monthlyMap = new Map();
    customers.forEach(c => {
      if (c.lastPurchase && c.totalSpent) {
        const date = new Date(c.lastPurchase);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { month: key, revenue: 0, customers: 0, leads: 0 });
        }
        const entry = monthlyMap.get(key);
        entry.revenue += c.totalSpent;
        entry.customers += 1;
      }
    });
    // Optionally, add leads per month if you have lead dates
    leads.forEach(l => {
      if (l.createdAt) {
        const date = new Date(l.createdAt);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { month: key, revenue: 0, customers: 0, leads: 0 });
        }
        monthlyMap.get(key).leads += 1;
      }
    });
    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
      // Sort by year then month
      const [ma, ya] = a.month.split(' ');
      const [mb, yb] = b.month.split(' ');
      return ya !== yb ? ya - yb : new Date(`${ma} 1, 2000`).getMonth() - new Date(`${mb} 1, 2000`).getMonth();
    });

    // Calculate customer segments based on totalSpent
    const customerSegments = [
      {
        segment: 'High Value',
        count: customers.filter(c => (c.totalSpent || 0) >= 10000).length,
        revenue: customers.filter(c => (c.totalSpent || 0) >= 10000).reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        percentage: totalCustomers > 0 ? (customers.filter(c => (c.totalSpent || 0) >= 10000).length / totalCustomers) * 100 : 0
      },
      {
        segment: 'Medium Value',
        count: customers.filter(c => (c.totalSpent || 0) >= 5000 && (c.totalSpent || 0) < 10000).length,
        revenue: customers.filter(c => (c.totalSpent || 0) >= 5000 && (c.totalSpent || 0) < 10000).reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        percentage: totalCustomers > 0 ? (customers.filter(c => (c.totalSpent || 0) >= 5000 && (c.totalSpent || 0) < 10000).length / totalCustomers) * 100 : 0
      },
      {
        segment: 'Low Value',
        count: customers.filter(c => (c.totalSpent || 0) < 5000).length,
        revenue: customers.filter(c => (c.totalSpent || 0) < 5000).reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        percentage: totalCustomers > 0 ? (customers.filter(c => (c.totalSpent || 0) < 5000).length / totalCustomers) * 100 : 0
      }
    ];

    // Generate top products from real customer data
    const productMap = new Map();
    customers.forEach(c => {
      if (c.itemPurchased && c.totalSpent) {
        if (!productMap.has(c.itemPurchased)) {
          productMap.set(c.itemPurchased, { name: c.itemPurchased, revenue: 0, units: 0 });
        }
        const entry = productMap.get(c.itemPurchased);
        entry.revenue += c.totalSpent;
        entry.units += 1;
      }
    });
    const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const analyticsData = {
      revenue: {
        current: totalRevenue,
        previous: previousRevenue,
        growth: revenueGrowth,
        trend: revenueGrowth >= 0 ? 'up' as const : 'down' as const
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        active: activeCustomers,
        churned: Math.floor(totalCustomers * 0.05) // Mock churn rate
      },
      leads: {
        total: totalLeads,
        qualified: qualifiedLeads,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgValue: totalLeads > 0 ? Math.floor(totalRevenue / totalLeads) : 0
      },
      sales: {
        pipeline: Math.floor(totalRevenue * 1.5), // Mock pipeline
        won: Math.floor(totalRevenue * 0.8), // Mock won deals
        lost: Math.floor(totalRevenue * 0.2), // Mock lost deals
        winRate: 80 // Mock win rate
      },
      monthlyData,
      topProducts,
      customerSegments
    };

    return NextResponse.json(analyticsData);
  } catch (error: unknown) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 