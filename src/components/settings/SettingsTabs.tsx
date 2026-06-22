// src/components/settings/SettingsTabs.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SettingsTabsProps {
  activeTab: 'profile' | 'notifications' | 'privacy' | 'appearance';
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'appearance', label: 'Appearance' }
];

export const SettingsTabs = ({ activeTab, onTabChange }: SettingsTabsProps) => {
  return (
    <div className="flex gap-1 p-1 bg-neutral-900/50 rounded-xl w-full overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};




