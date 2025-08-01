// Performance optimization utilities

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Only preload resources that are actually used
  // Removed favicon preload to avoid console warnings
}

// Optimize navigation performance
export function optimizeNavigation() {
  if (typeof window === 'undefined') return;

  // Prefetch all navigation links
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.includes('#')) {
      link.setAttribute('data-prefetch', 'true');
    }
  });

  // Add intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          if (href && link.getAttribute('data-prefetch') === 'true') {
            // Prefetch the page
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
            observer.unobserve(link);
          }
        }
      });
    });

    links.forEach(link => {
      if (link.getAttribute('data-prefetch') === 'true') {
        observer.observe(link);
      }
    });
  }
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Optimize images
export function optimizeImages() {
  if (typeof window === 'undefined') return;

  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Add loading="lazy" for images below the fold
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }

    // Add decoding="async" for better performance
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
}

// Initialize performance optimizations
export function initPerformanceOptimizations() {
  preloadCriticalResources();
  optimizeNavigation();
  optimizeImages();
}

// Measure and log performance metrics
export function measurePerformance() {
  if (typeof window === 'undefined') return;

  // Measure page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);

    // Log Core Web Vitals if available
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`LCP: ${entry.startTime.toFixed(2)}ms`);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any;
            console.log(`FID: ${fidEntry.processingStart - entry.startTime}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  });
} 