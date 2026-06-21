// src/components/ui/Container.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  noPadding?: boolean;
}

const maxWidthClasses = { 
  sm: 'max-w-screen-sm', 
  md: 'max-w-screen-md', 
  lg: 'max-w-screen-lg', 
  xl: 'max-w-screen-xl', 
  '2xl': 'max-w-screen-2xl', 
  full: 'max-w-full' 
};

export const Container = ({ 
  children, 
  className, 
  maxWidth = 'xl', 
  noPadding = false 
}: ContainerProps) => {
  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      !noPadding && 'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
};