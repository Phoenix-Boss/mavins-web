'use client';

import { cn } from '@/lib/utils/cn';

export type TabType = 'profile' | 'notifications' | 'privacy' | 'appearance';

export interface SettingsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: '??' },
  { id: 'notifications', label: 'Notifications', icon: '??' },
  { id: 'privacy', label: 'Privacy', icon: '??' },
  { id: 'appearance', label: 'Appearance', icon: '??' }
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
      {tabs.map((tab: any) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === tab.id
              ? 'bg-amber-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          )}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

