"use client";

import Header from "@/components/Header";
import ChatBox from "@/components/ChatBox";
import WidgetPanel from "@/components/WidgetPanel";
import { BarChart3, Users, TrendingUp, Target } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const analytics = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? <span className="animate-pulse">Loading...</span> : isError ? <span className="text-red-500">Error</span> : (analytics && analytics.totalRevenue !== undefined) ? `₹${analytics.totalRevenue.toLocaleString('en-IN')}` : '--'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-green-600 mt-2 truncate">
              {isLoading ? '' : isError ? '' : analytics?.totalRevenue && analytics?.avgOrderValue ? `+${Math.round((analytics.totalRevenue - analytics.avgOrderValue) / analytics.avgOrderValue * 100)}% from last month` : ''}
            </p>
          </div>
          
          {/* Active Customers */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Active Customers</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? <span className="animate-pulse">Loading...</span> : isError ? <span className="text-red-500">Error</span> : (analytics && analytics.totalCustomers !== undefined) ? analytics.totalCustomers : '--'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-blue-600 mt-2 truncate">
              {isLoading ? '' : isError ? '' : analytics?.totalCustomers && analytics?.avgOrderValue ? `+${Math.round((analytics.totalCustomers - analytics.avgOrderValue) / analytics.avgOrderValue * 100)}% from last month` : ''}
            </p>
          </div>
          
          {/* Open Leads */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Open Leads</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? <span className="animate-pulse">Loading...</span> : isError ? <span className="text-red-500">Error</span> : (analytics && analytics.totalLeads !== undefined) ? analytics.totalLeads : '--'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-purple-600 mt-2 truncate">
              {isLoading ? '' : isError ? '' : analytics?.recentActivity ? `${analytics.recentActivity.filter((a: any) => a.status !== 'closed-won' && a.status !== 'closed-lost').length || 0} need follow-up` : ''}
            </p>
          </div>
          
          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Conversion Rate</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {isLoading ? <span className="animate-pulse">Loading...</span> : isError ? <span className="text-red-500">Error</span> : (analytics && analytics.conversionRate !== undefined) ? `${analytics.conversionRate}%` : '--'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-orange-600 mt-2 truncate">
              {isLoading ? '' : isError ? '' : analytics?.conversionRate ? `+${analytics.conversionRate}% from last month` : ''}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-6 sm:gap-8">
          <section className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
              <ChatBox />
            </div>
          </section>
          <section className="flex-1 min-w-0">
            <WidgetPanel />
          </section>
        </div>
      </main>
    </div>
  );
}
