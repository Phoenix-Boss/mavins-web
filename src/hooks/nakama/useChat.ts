// src/hooks/nakama/useChat.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNakama } from './useNakama';
import type { NakamaMessage } from '@/lib/nakama/types';

export interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  isSeed: boolean;
  mentions?: string[];
}

export const useChat = (poolId: string) => {
  const { isConnected, sendMessage, onMessage, onTyping } = useNakama();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const currentUserId = useRef<string>('');

  useEffect(() => {
    const unsubscribe = onMessage((nakamaMsg: NakamaMessage) => {
      const newMessage: ChatMessage = {
        id: nakamaMsg.messageId,
        username: nakamaMsg.username,
        content: typeof nakamaMsg.content === 'object' ? nakamaMsg.content.text || '' : String(nakamaMsg.content),
        timestamp: new Date(nakamaMsg.createTime),
        isOwn: nakamaMsg.senderId === currentUserId.current,
        isSeed: nakamaMsg.username.includes('Seed') || false,
      };
      setMessages(prev => [...prev, newMessage]);
    });
    return unsubscribe;
  }, [onMessage]);

  const sendChatMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    await sendMessage(content);
  }, [sendMessage]);

  const sendTypingIndicator = useCallback(async (typing: boolean) => {
    if (!isConnected) return;
    await fetch('/api/nakama/typing', {
      method: 'POST',
      body: JSON.stringify({ poolId, isTyping: typing }),
    });
  }, [isConnected, poolId]);

  return {
    messages,
    isTyping,
    typingUsers,
    sendChatMessage,
    sendTypingIndicator,
  };
};
