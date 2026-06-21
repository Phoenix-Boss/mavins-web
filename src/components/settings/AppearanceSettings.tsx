// src/components/settings/AppearanceSettings.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';

export const AppearanceSettings = () => {
  const { theme, mode } = useTheme();
  const { toggleTheme } = useAppStore();

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Appearance</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-neutral-400">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              'w-12 h-6 rounded-full transition-colors relative',
              mode === 'dark' ? 'bg-amber-500' : 'bg-neutral-700'
            )}
          >
            <span className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
              mode === 'dark' ? 'translate-x-7' : 'translate-x-1'
            )} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Animations</p>
            <p className="text-sm text-neutral-400">Enable UI animations and effects</p>
          </div>
          <button className="w-12 h-6 rounded-full bg-amber-500 relative">
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Compact Mode</p>
            <p className="text-sm text-neutral-400">Reduce spacing between elements</p>
          </div>
          <button className="w-12 h-6 rounded-full bg-neutral-700 relative">
            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </Card>
  );
};
