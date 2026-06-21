// src/hooks/nakama/useNakama.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { nakamaService } from '@/services/nakama/nakama.service';
import { useAuth } from '@/hooks/auth/useAuth';
import type { NakamaMessage, PoolConfig, TypingEvent } from '@/lib/nakama/types';

export const useNakama = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentPoolId, setCurrentPoolId] = useState<string | null>(null);
  const reconnectAttempt = useRef(0);

  const connect = useCallback(async (poolConfig: PoolConfig) => {
    if (!isAuthenticated || !user) return false;
    setIsConnecting(true);
    
    try {
      const token = localStorage.getItem('soundwave-auth-token');
      if (!token) throw new Error('No auth token');
      
      const connected = await nakamaService.connect(user.id, token);
      if (connected) {
        const poolId = await nakamaService.joinPool(poolConfig);
        setCurrentPoolId(poolId);
        setIsConnected(true);
        reconnectAttempt.current = 0;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Connection failed:', error);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isAuthenticated, user]);

  const disconnect = useCallback(async () => {
    await nakamaService.disconnect();
    setIsConnected(false);
    setCurrentPoolId(null);
  }, []);

  const sendMessage = useCallback(async (content: string, mentions?: string[]) => {
    if (!isConnected || !currentPoolId) return null;
    return nakamaService.sendMessage({ channelId: currentPoolId, content, mentions });
  }, [isConnected, currentPoolId]);

  const sendTyping = useCallback(async (isTyping: boolean) => {
    if (!isConnected) return;
    nakamaService.sendTypingIndicator(isTyping);
  }, [isConnected]);

  return {
    isConnected,
    isConnecting,
    currentPoolId,
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    onMessage: nakamaService.onMessage.bind(nakamaService),
    onPresence: nakamaService.onPresence.bind(nakamaService),
    onTyping: nakamaService.onTyping.bind(nakamaService),
  };
};
