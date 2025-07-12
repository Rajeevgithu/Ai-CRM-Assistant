'use client';

import { useEffect } from 'react';
import { initPerformanceOptimizations, measurePerformance } from '@/lib/performance';

export default function PerformanceInitializer() {
  useEffect(() => {
    // Initialize performance optimizations
    initPerformanceOptimizations();
    measurePerformance();
  }, []);

  return null; // This component doesn't render anything
} 