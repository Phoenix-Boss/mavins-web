// src/components/ui/Card.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/components/providers/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = ({ 
  children, 
  className, 
  hover = true, 
  glass = true, 
  padding = 'md', 
  onClick 
}: CardProps) => {
  const { theme } = useTheme();
  
  return (
    <div 
      onClick={onClick} 
      className={cn(
        'rounded-2xl transition-all duration-300',
        glass && 'backdrop-blur-xl border',
        glass && theme.border,
        glass && 'bg-black/30 dark:bg-black/30',
        !glass && theme.bgCard,
        hover && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        hover && theme.cardHover,
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};