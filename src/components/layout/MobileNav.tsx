// src/components/layout/MobileNav.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/components/providers/ThemeProvider';

interface MobileNavProps {
  activeTab: string;
  taskCount: number;
  notificationCount: number;
  points: number;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', icon: '??', label: 'Home' },
  { id: 'search', icon: '??', label: 'Search' },
  { id: 'tasks', icon: '??', label: 'Tasks', hasBadge: 'task' },
  { id: 'notifications', icon: '??', label: 'Alerts', hasBadge: 'notification' },
  { id: 'profile', icon: '??', label: 'Profile' },
];

export const MobileNav = ({ 
  activeTab, 
  taskCount, 
  notificationCount, 
  points,
  onTabChange 
}: MobileNavProps) => {
  const { theme } = useTheme();

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-40 block md:hidden',
      theme.bgSecondary, 
      'border-t', 
      theme.border, 
      'backdrop-blur-xl bg-opacity-95'
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {/* Points display on mobile - changed to currency icon */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">??</span>
            <span className={cn('font-semibold text-xs', theme.text)}>
              {points.toLocaleString()}
            </span>
          </div>
        </div>

        {tabs.map((tab: any) => {
          let badgeCount = 0;
          if (tab.hasBadge === 'task') badgeCount = taskCount;
          if (tab.hasBadge === 'notification') badgeCount = notificationCount;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative',
                activeTab === tab.id ? 'text-amber-400' : theme.textSecondary
              )}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] text-[10px] flex items-center justify-center bg-red-500 text-white rounded-full px-1">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
