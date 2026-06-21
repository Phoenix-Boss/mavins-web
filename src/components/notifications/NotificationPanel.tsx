// src/components/notifications/NotificationPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createTime: Date;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPanel = ({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationPanelProps) => {
  const { theme } = useTheme();
  const supabase = createClient();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Subscribe to new notifications in real-time
  useEffect(() => {
    if (!user?.id || !isOpen) return;

    const channel = supabase
      .channel('notification-panel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as any;
          // This will trigger a refresh via the parent component
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id, isOpen]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('task')) return '📋';
    if (title.toLowerCase().includes('reward') || title.toLowerCase().includes('point')) return '💰';
    if (title.toLowerCase().includes('streak')) return '🔥';
    if (title.toLowerCase().includes('welcome')) return '🎉';
    return '🔔';
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={onClose} />
      <div className={cn(
        'fixed right-0 top-0 bottom-0 w-full max-w-md z-50 shadow-2xl transition-transform duration-300 ease-out',
        theme.bgSecondary,
        'border-l',
        theme.border
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className={cn('text-sm', theme.textSecondary)}>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={onMarkAllAsRead}>
                  Mark all read
                </Button>
              )}
              <button 
                onClick={onClose} 
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {isRefreshing ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
              </div>
            ) : notifications.length === 0 ? (
              <div className={cn('text-center py-12', theme.textSecondary)}>
                <div className="text-4xl mb-3">🔔</div>
                <p>No notifications yet</p>
                <p className="text-sm mt-1">When you receive notifications, they will appear here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                  className={cn(
                    'p-4 rounded-xl transition-all duration-200 cursor-pointer',
                    notification.isRead 
                      ? theme.bgTertiary 
                      : 'bg-amber-500/10 border border-amber-500/20',
                    'hover:scale-[1.01]'
                  )}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl">{getNotificationIcon(notification.title)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={cn('font-medium', notification.isRead ? theme.textSecondary : theme.text)}>
                          {notification.title}
                        </h4>
                        <span className={cn('text-xs', theme.textMuted)}>
                          {formatTime(notification.createTime)}
                        </span>
                      </div>
                      <p className={cn('text-sm', theme.textSecondary)}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-neutral-800">
            <p className={cn('text-xs text-center', theme.textMuted)}>
              Stay updated with your activity and rewards
            </p>
          </div>
        </div>
      </div>
    </>
  );
};