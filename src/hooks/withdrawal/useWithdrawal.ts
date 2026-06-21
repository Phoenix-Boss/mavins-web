// src/hooks/withdrawal/useWithdrawal.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { withdrawalService } from '@/services/withdrawal/withdrawal.service';
import { useAuth } from '@/hooks/auth/useAuth';
import type { WithdrawalRequest, CreatorStats } from '@/services/withdrawal/withdrawal.service';

export const useWithdrawal = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        withdrawalService.getCreatorStats(user.id),
        withdrawalService.getWithdrawalHistory(user.id),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load withdrawal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requestWithdrawal = useCallback(
    async (amount: number, method: 'paypal' | 'bank' | 'crypto', accountDetails: any) => {
      if (!user) return null;
      const result = await withdrawalService.requestWithdrawal(user.id, amount, method, accountDetails);
      await loadData();
      return result;
    },
    [user, loadData]
  );

  const cancelWithdrawal = useCallback(
    async (withdrawalId: string) => {
      if (!user) return false;
      const success = await withdrawalService.cancelWithdrawal(withdrawalId, user.id);
      await loadData();
      return success;
    },
    [user, loadData]
  );

  const getStatus = useCallback(async (withdrawalId: string) => {
    return withdrawalService.getWithdrawalStatus(withdrawalId);
  }, []);

  const getPointsValue = useCallback((points: number) => {
    return points / 100;
  }, []);

  const getPointsFromAmount = useCallback((amount: number) => {
    return amount * 100;
  }, []);

  const canWithdraw = useCallback(() => {
    if (!stats) return false;
    return stats.availableForWithdrawal >= 10;
  }, [stats]);

  return {
    stats,
    history,
    isLoading,
    requestWithdrawal,
    cancelWithdrawal,
    getStatus,
    getPointsValue,
    getPointsFromAmount,
    canWithdraw,
    refresh: loadData,
  };
};
