// src/components/notifications/NotificationItem.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useTheme } from '@/components/providers/ThemeProvider';

export interface Notification {
  id: string;
  type: 'user_joined' | 'task_completed' | 'badge_earned' | 'song_played' | 'milestone' | 'tier_upgrade' | 'chat_message';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const iconMap: Record<string, string> = {
  user_joined: 'ðŸŽ‰',
  task_completed: 'âœ…',
  badge_earned: 'ðŸ†',
  song_played: 'ðŸ”¥',
  milestone: 'ðŸŒŸ',
  tier_upgrade: 'â¬†ï¸',
  chat_message: 'ðŸ’¬',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const { theme } = useTheme();
  const icon = iconMap[notification.type] ?? 'ðŸ“¢';

  return (
    <div
      onClick={() => onRead?.(notification.id)}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200',
        !notification.isRead ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'hover:bg-white/5'
      )}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', theme.text)}>{notification.message}</p>
        <p className={cn('text-xs mt-1', theme.textSecondary)}>{timeAgo(notification.timestamp)}</p>
      </div>
      {!notification.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />}
    </div>
  );
};
