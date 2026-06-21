// src/components/chat/ChatList.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createTime: Date;
  username?: string;
}

interface ChatListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  isLoading?: boolean;
}

export const ChatList = ({ messages, currentUserId, isLoading = false }: ChatListProps) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-neutral-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-24" />
              <div className="h-3 bg-neutral-700 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">💬</div>
        <p className={cn('text-sm', theme.textSecondary)}>No messages yet</p>
        <p className={cn('text-xs mt-1', theme.textMuted)}>Be the first to send a message!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;
        
        return (
          <div
            key={message.id}
            className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
              isOwn 
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white'
                : 'bg-neutral-700 text-white'
            )}>
              {message.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('text-xs font-medium', theme.textSecondary)}>
                  {isOwn ? 'You' : message.username || 'Anonymous'}
                </span>
                <span className={cn('text-xs', theme.textMuted)}>
                  {formatTime(message.createTime)}
                </span>
              </div>
              <div className={cn(
                'px-3 py-2 rounded-2xl break-words',
                isOwn
                  ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-br-none'
                  : cn(theme.bgTertiary, theme.text, 'rounded-bl-none')
              )}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};