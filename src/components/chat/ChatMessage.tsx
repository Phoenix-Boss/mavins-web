// src/components/chat/ChatMessage.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/components/providers/ThemeProvider';

export interface ChatMessageProps {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  isSeed?: boolean;
}

export const ChatMessage = ({ username, content, timestamp, isOwn, isSeed }: ChatMessageProps) => {
  const { theme } = useTheme();
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('flex gap-3 p-3', isOwn && 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
        isSeed ? 'bg-gradient-to-br from-amber-500 to-purple-600' : 'bg-neutral-700'
      )}>
        {username.charAt(0).toUpperCase()}
      </div>
      <div className={cn('flex-1 max-w-[80%]', isOwn && 'items-end')}>
        <div className={cn('flex items-center gap-2 mb-1', isOwn && 'justify-end')}>
          <span className={cn('text-sm font-medium', theme.text)}>{username}</span>
          {isSeed && <span className="text-xs text-amber-400">âš¡</span>}
          <span className={cn('text-xs', theme.textSecondary)}>{formatTime(timestamp)}</span>
        </div>
        <div className={cn(
          'inline-block px-3 py-2 rounded-2xl break-words',
          isOwn ? 'bg-amber-500 text-white rounded-tr-sm' : cn('bg-neutral-800', theme.text, 'rounded-tl-sm')
        )}>
          <p className="text-sm">{content}</p>
        </div>
      </div>
    </div>
  );
};
