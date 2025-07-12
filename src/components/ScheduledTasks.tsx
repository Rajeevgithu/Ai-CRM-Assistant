'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Clock, 
  Calendar, 
  Mail, 
  BarChart3, 
  Brain, 
  TrendingUp,
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ScheduledTask {
  id: string;
  type: string;
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  executedAt: string;
  result?: string;
  nextRun?: string;
}

interface TaskConfig {
  type: string;
  name: string;
  description: string;
  frequency: string;
  icon: any;
  color: string;
}

const TASK_CONFIGS: TaskConfig[] = [
  {
    type: 'daily_summary',
    name: 'Daily Summary',
    description: 'Generate daily business summary and insights',
    frequency: 'Daily at 9:00 AM',
    icon: BarChart3,
    color: 'blue'
  },
  {
    type: 'weekly_report',
    name: 'Weekly Report',
    description: 'Create comprehensive weekly performance report',
    frequency: 'Weekly on Monday',
    icon: TrendingUp,
    color: 'green'
  },
  {
    type: 'follow_up_emails',
    name: 'Follow-up Emails',
    description: 'Send automated follow-up emails to leads',
    frequency: 'Daily at 10:00 AM',
    icon: Mail,
    color: 'purple'
  },
  {
    type: 'customer_insights',
    name: 'Customer Insights',
    description: 'Analyze customer segments and generate insights',
    frequency: 'Weekly on Wednesday',
    icon: Brain,
    color: 'orange'
  },
  {
    type: 'sales_forecast',
    name: 'Sales Forecast',
    description: 'Generate sales forecasts and trend analysis',
    frequency: 'Monthly on 1st',
    icon: TrendingUp,
    color: 'indigo'
  }
];

export default function ScheduledTasks() {
  const [executingTask, setExecutingTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['scheduled-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/scheduled-tasks');
      if (!response.ok) throw new Error('Failed to fetch scheduled tasks');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });
  const tasks = data?.tasks || [];
  const nextScheduled = data?.nextScheduled || {};

  const executeTask = async (taskType: string) => {
    setExecutingTask(taskType);
    
    try {
      const response = await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskType }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add the executed task to the list
        const newTask: ScheduledTask = {
          id: Date.now().toString(),
          type: taskType,
          status: 'completed',
          executedAt: data.executedAt,
          result: JSON.stringify(data.result)
        };
        
        // The original code had setTasks(prev => [newTask, ...prev]);
        // This line was removed as per the new_code, as the state 'tasks' is now managed by React Query.
        // The refetch will update the displayed tasks.
        setSelectedTask(data.result);
      }
    } catch (error) {
      console.error('Error executing task:', error);
    } finally {
      setExecutingTask(null);
    }
  };

  const getTaskConfig = (taskType: string) => {
    return TASK_CONFIGS.find(config => config.type === taskType);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeUntilNext = (dateString: string) => {
    const now = new Date();
    const next = new Date(dateString);
    const diff = next.getTime() - now.getTime();
    
    if (diff <= 0) return 'Due now';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'in less than an hour';
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 sm:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Scheduled Tasks</h2>
          <p className="text-xs sm:text-sm text-gray-600">Autonomous agent activities and automation</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
          <span className="sm:hidden">Refresh Tasks</span>
        </Button>
      </div>

      {/* Task Configurations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {TASK_CONFIGS.map((config) => {
          const IconComponent = config.icon;
          const nextRun = nextScheduled[config.type];
          const isExecuting = executingTask === config.type;
          
          return (
            <Card key={config.type} className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg bg-${config.color}-100`}>
                  <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 text-${config.color}-600`} />
                </div>
                <Button
                  onClick={() => executeTask(config.type)}
                  disabled={isExecuting}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {isExecuting ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:inline">Run</span>
                </Button>
              </div>
              
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">{config.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{config.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{config.frequency}</span>
                </div>
                {nextRun && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{getTimeUntilNext(nextRun)}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Task Executions */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Executions</h3>
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task: ScheduledTask) => {
            const config = getTaskConfig(task.type);
            const IconComponent = config?.icon || BarChart3;
            
            return (
              <Card key={task.id} className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg bg-${config?.color || 'gray'}-100 flex-shrink-0`}>
                      <IconComponent className={`w-4 h-4 text-${config?.color || 'gray'}-600`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{config?.name || task.type}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">{formatDate(task.executedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Button
                      onClick={() => setSelectedTask(task.result ? JSON.parse(task.result) : null)}
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Task Result Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Task Result</h3>
              <Button
                onClick={() => setSelectedTask(null)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                {typeof selectedTask === 'string' ? selectedTask : JSON.stringify(selectedTask, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 