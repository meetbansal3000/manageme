import React from 'react';

interface AppleSkeletonProps {
  className?: string;
  count?: number;
}

export const AppleSkeleton: React.FC<AppleSkeletonProps> = ({ className = 'h-12 w-full', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-neutral-800/60 border border-white/5 rounded-2xl ${className}`}
        />
      ))}
    </>
  );
};

export const AppleCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-neutral-900/50 border border-white/10 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-neutral-800 rounded-lg w-1/3" />
        <div className="h-3 bg-neutral-800 rounded-full w-16" />
      </div>
      <div className="h-3 bg-neutral-800/80 rounded-lg w-3/4" />
      <div className="h-3 bg-neutral-800/60 rounded-lg w-1/2" />
      <div className="pt-2 flex gap-2">
        <div className="h-6 bg-neutral-800/80 rounded-full w-20" />
        <div className="h-6 bg-neutral-800/80 rounded-full w-16" />
      </div>
    </div>
  );
};
