// src/components/ui/Badge.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
  count?: number;
  className?: string;
}

const variantClasses = {
  default: 'bg-neutral-700 text-neutral-200',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  destructive: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  accent: 'bg-gradient-to-r from-amber-500/20 to-purple-600/20 text-amber-400 border-amber-500/30',
};

const sizeClasses = { 
  sm: 'px-1.5 py-0.5 text-xs rounded-md', 
  md: 'px-2 py-1 text-xs rounded-lg' 
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  dot = false, 
  count, 
  className 
}: BadgeProps) => {
  if (count !== undefined) {
    return (
      <span className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full',
        variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white',
        className
      )}>
        {count > 99 ? '99+' : count}
      </span>
    );
  }
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium border backdrop-blur-sm',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};