// src/hooks/deeplink/useDeeplink.ts
'use client';

import { useCallback, useState } from 'react';
import { deeplinkService } from '@/services/deeplink/deeplink.service';
import { useAuth } from '@/hooks/auth/useAuth';

export const useDeeplink = () => {
  const { user } = useAuth();
  const [isOpening, setIsOpening] = useState(false);
  
  const playTrack = useCallback(async (trackId: string, taskId?: string) => {
    if (!user) {
      console.warn('User not authenticated');
      return false;
    }
    
    setIsOpening(true);
    try {
      const success = await deeplinkService.playTrack(trackId, user.id, taskId);
      return success;
    } finally {
      setIsOpening(false);
    }
  }, [user]);
  
  const activateAccount = useCallback(async () => {
    if (!user) return false;
    
    setIsOpening(true);
    try {
      const success = await deeplinkService.activateAccount(user.id);
      return success;
    } finally {
      setIsOpening(false);
    }
  }, [user]);
  
  const completeTask = useCallback(async (taskId: string, trackId: string) => {
    if (!user) return false;
    
    setIsOpening(true);
    try {
      const success = await deeplinkService.completeTask(taskId, trackId, user.id);
      return success;
    } finally {
      setIsOpening(false);
    }
  }, [user]);
  
  const checkAppInstalled = useCallback(async () => {
    return deeplinkService.checkAppInstalled();
  }, []);
  
  const getPlayStoreUrl = useCallback(() => {
    return deeplinkService.getPlayStoreUrl();
  }, []);
  
  return {
    playTrack,
    activateAccount,
    completeTask,
    checkAppInstalled,
    getPlayStoreUrl,
    isOpening,
  };
};
