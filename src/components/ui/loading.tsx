import { memo } from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loading = memo(({ size = 'md', className = '' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)] ${sizeClasses[size]} ${className}`} />
  );
});

Loading.displayName = 'Loading';

export default Loading; 