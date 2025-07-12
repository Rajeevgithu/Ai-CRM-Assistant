'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, AlertTriangle } from 'lucide-react';

interface AIStatus {
  isOperational: boolean;
  isMock: boolean;
  lastChecked: Date;
}

export default function AIStatusIndicator() {
  const [status, setStatus] = useState<AIStatus>({
    isOperational: false,
    isMock: false,
    lastChecked: new Date()
  });

  const checkAIStatus = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test' })
      });
      
      const data = await response.json();
      
      setStatus({
        isOperational: !!data.reply && !data.isMock,
        isMock: !!data.isMock,
        lastChecked: new Date()
      });
    } catch {
      setStatus({
        isOperational: false,
        isMock: false,
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    checkAIStatus();
  }, []);

  const getStatusColor = () => {
    if (status.isOperational) return 'text-green-600 bg-green-100';
    if (status.isMock) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = () => {
    if (status.isOperational) return 'AI Operational';
    if (status.isMock) return 'Demo Mode';
    return 'AI Unavailable';
  };

  const getStatusIcon = () => {
    if (status.isOperational) return <Sparkles className="w-3 h-3" />;
    if (status.isMock) return <Bot className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        {getStatusText()}
      </div>
      {status.isMock && (
        <button
          onClick={checkAIStatus}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Check Status
        </button>
      )}
    </div>
  );
} 