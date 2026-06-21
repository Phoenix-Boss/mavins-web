// src/components/chat/ChatHeader.tsx
'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface ChatHeaderProps {
  poolName: string;
  moodState: string;
  moodScore: number;
  activeUsers: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const ChatHeader = ({ 
  poolName, 
  moodState, 
  moodScore, 
  activeUsers, 
  isCollapsed, 
  onToggle 
}: ChatHeaderProps) => {
  const { theme } = useTheme();

  const getMoodColor = () => {
    switch (moodState?.toLowerCase()) {
      case 'hype':
        return 'text-orange-500';
      case 'chill':
        return 'text-blue-400';
      case 'vibe':
        return 'text-purple-400';
      default:
        return 'text-green-400';
    }
  };

  const getMoodEmoji = () => {
    switch (moodState?.toLowerCase()) {
      case 'hype':
        return '🔥';
      case 'chill':
        return '😎';
      case 'vibe':
        return '🎵';
      default:
        return '💬';
    }
  };

  return (
    <div 
      onClick={onToggle}
      className={cn(
        'flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200',
        theme.bgCard,
        'border',
        theme.border,
        'hover:scale-[1.01]'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center text-white">
          💬
        </div>
        <div>
          <h3 className={cn('font-semibold', theme.text)}>{poolName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-xs', getMoodColor())}>
              {getMoodEmoji()} {moodState || 'active'}
            </span>
            <span className={cn('text-xs', theme.textMuted)}>•</span>
            <span className={cn('text-xs', theme.textMuted)}>
              {activeUsers} online
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {moodScore > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-sm">🎯</span>
            <span className={cn('text-sm font-medium', theme.text)}>{moodScore}%</span>
          </div>
        )}
        <button className={cn(
          'p-2 rounded-full transition-transform duration-200',
          isCollapsed ? 'rotate-180' : ''
        )}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
};