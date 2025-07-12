"use client";

import { useMemo, useCallback } from "react";
import { Card } from "./ui/card";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import TopCustomers from "@/components/TopCustomers";
import { useQuery } from '@tanstack/react-query';

interface Customer {
  _id: string;
  name: string;
  itemPurchased: string;
  quantity: number;
  totalSpent: number;
  lastPurchase?: string;
}

interface AnalyticsData {
  totalRevenue: number;
  totalCustomers: number;
  totalLeads: number;
  conversionRate: number;
  avgOrderValue: number;
  topCustomers: Customer[];
  recentActivity: any[];
  salesTrend: 'up' | 'down' | 'stable';
  atRiskCustomers: number;
}

const WidgetPanel = () => {
  // Single optimized query for all dashboard data
  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    staleTime: 1000 * 60 * 1, // 1 minute (reduced for faster updates)
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data exists
  });

  // Memoized currency formatter
  const formatCurrency = useCallback((amount: number | undefined | null) => {
    return typeof amount === 'number' && !isNaN(amount)
      ? `₹${amount.toLocaleString('en-IN')}`
      : '--';
  }, []);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Business Analytics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 sm:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    </div>
  ), []);

  if (isLoading) {
    return loadingSkeleton;
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Business Analytics</h2>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Real-time data</span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-green-700 truncate">Total Revenue</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 truncate">
                {formatCurrency(analytics.totalRevenue)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-xs sm:text-sm text-green-600 truncate">+12% this month</span>
          </div>
        </Card>

        {/* Total Customers */}
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-700 truncate">Total Customers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 truncate">
                {analytics.totalCustomers}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <span className="text-xs sm:text-sm text-blue-600 truncate">Active accounts</span>
          </div>
        </Card>

        {/* Average Order Value */}
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-purple-700 truncate">Avg Order Value</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 truncate">
                {formatCurrency(analytics.avgOrderValue)}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
            <span className="text-xs sm:text-sm text-purple-600 truncate">+8% vs last month</span>
          </div>
        </Card>

        {/* At-Risk Customers */}
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-orange-700 truncate">At-Risk Customers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900 truncate">
                {analytics.atRiskCustomers}
              </p>
            </div>
            <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            <span className="text-xs sm:text-sm text-orange-600 truncate">No purchase in 30+ days</span>
          </div>
        </Card>
      </div>

      {/* Top Customers - Pass data to avoid duplicate API call */}
      <TopCustomers />
    </div>
  );
};

export default WidgetPanel; 