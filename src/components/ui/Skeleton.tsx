// src/components/ui/Skeleton.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  animated?: boolean;
}

export const Skeleton = ({ 
  variant = 'text', 
  width, 
  height, 
  className,
  animated = true 
}: SkeletonProps) => {
  const baseClasses = cn(
    'bg-neutral-800/50',
    animated && 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
    variant === 'circular' && 'rounded-full',
    variant === 'rectangular' && 'rounded-lg',
    variant === 'card' && 'rounded-2xl',
    variant === 'text' && 'rounded',
    className
  );

  const styles: React.CSSProperties = {};
  if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) styles.height = typeof height === 'number' ? `${height}px` : height;
  if (variant === 'text' && !height) styles.height = '1em';

  return <div className={baseClasses} style={styles} />;
};

export const SongCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton variant="rectangular" width="100%" height="160px" />
    <Skeleton variant="text" width="80%" height="16px" />
    <Skeleton variant="text" width="60%" height="12px" />
  </div>
);

export const ArtistCardSkeleton = () => (
  <div className="flex flex-col items-center space-y-2">
    <Skeleton variant="circular" width="80px" height="80px" />
    <Skeleton variant="text" width="100px" height="14px" />
    <Skeleton variant="text" width="60px" height="12px" />
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="flex items-center justify-between p-4">
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="70%" height="16px" />
      <Skeleton variant="text" width="50%" height="12px" />
    </div>
    <Skeleton variant="rectangular" width="80px" height="32px" />
  </div>
);

export const ChatMessageSkeleton = () => (
  <div className="flex gap-3 p-3">
    <Skeleton variant="circular" width="40px" height="40px" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="30%" height="14px" />
      <Skeleton variant="text" width="80%" height="14px" />
    </div>
  </div>
);