'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    // Measure initial load time
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      
      // Measure render time
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;
        
        setMetrics({
          loadTime: Math.round(loadTime),
          renderTime: Math.round(renderTime),
          memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
        });
      });
    };

    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, []);

  if (!metrics || typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-green-400">⚡</span>
        <span>Performance</span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-400 hover:text-white"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-1">
          <div>Load: {metrics.loadTime}ms</div>
          <div>Render: {metrics.renderTime}ms</div>
          {metrics.memoryUsage && (
            <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
          )}
        </div>
      )}
    </div>
  );
} 