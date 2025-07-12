'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
    trend: 'up' | 'down';
  };
  customers: {
    total: number;
    new: number;
    active: number;
    churned: number;
  };
  leads: {
    total: number;
    qualified: number;
    conversionRate: number;
    avgValue: number;
  };
  sales: {
    pipeline: number;
    won: number;
    lost: number;
    winRate: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    customers: number;
    leads: number;
  }>;
  topProducts: Array<{
    name: string;
    revenue: number;
    units: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 1, // 1 minute (reduced for faster updates)
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="text-center py-6 sm:py-8">
        <p className="text-sm sm:text-base text-gray-500">Unable to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
          <span className="sm:hidden">Export Data</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {formatCurrency(analytics.revenue.current)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
            {analytics.revenue.trend === 'up' ? (
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            )}
            <span className={`text-xs sm:text-sm font-medium ${
              analytics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.revenue.growth}%
            </span>
            <span className="text-xs sm:text-sm text-gray-500 truncate">vs last period</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Customers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {formatNumber(analytics.customers.active)}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-xs sm:text-sm font-medium text-green-600">
              +{analytics.customers.new}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 truncate">new this period</span>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Lead Conversion</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {analytics.leads.conversionRate}%
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <Target className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
            <span className="text-xs sm:text-sm text-gray-500 truncate">
              {analytics.leads.qualified} qualified of {analytics.leads.total}
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Win Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {analytics.sales.winRate}%
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
            <span className="text-xs sm:text-sm text-gray-500 truncate">
              {analytics.sales.won} won, {analytics.sales.lost} lost
            </span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Revenue Trend</h3>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Details</span>
            </Button>
          </div>
          <div className="h-64 sm:h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Revenue chart will be displayed here</p>
            </div>
          </div>
        </Card>

        {/* Top Performing Products */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Top Products</h3>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View All</span>
            </Button>
          </div>
          <div className="space-y-3">
            {analytics.topProducts.slice(0, 5).map((product: AnalyticsData['topProducts'][0], index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.units} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Customer Segments</h3>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Details</span>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {analytics.customerSegments.map((segment: AnalyticsData['customerSegments'][0], index: number) => (
            <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">{segment.segment}</h4>
                <span className="text-xs text-gray-500">{segment.percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900">{formatNumber(segment.count)}</p>
                <p className="text-sm text-gray-600">{formatCurrency(segment.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 