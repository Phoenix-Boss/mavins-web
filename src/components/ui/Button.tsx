// src/components/ui/Button.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:opacity-90 active:scale-[0.98] shadow-lg',
  secondary: 'bg-neutral-800 text-white hover:bg-neutral-700',
  ghost: 'hover:bg-white/10 text-current',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-neutral-700 hover:bg-white/10',
  success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    fullWidth = false, 
    icon, 
    iconPosition = 'left', 
    className, 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button 
        ref={ref} 
        disabled={disabled || loading} 
        className={cn(
          'font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )} 
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {!loading && icon && iconPosition === 'left' && icon}
          {!loading && children}
          {!loading && icon && iconPosition === 'right' && icon}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';