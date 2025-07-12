import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

const Skeleton = memo(({ className = '', count = 1 }: SkeletonProps) => {
  if (count === 1) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton; 