// src/services/withdrawal/withdrawal.service.ts
import { supabase } from '@/lib/supabase/client';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  pointsAmount: number;
  method: 'paypal' | 'bank' | 'crypto';
  accountDetails: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';
  message?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface CreatorStats {
  totalPoints: number;
  totalEarned: number;
  availableForWithdrawal: number;
  withdrawnTotal: number;
  rank: number;
  totalUsers: number;
  weeklyPoints: number;
  monthlyPoints: number;
}

class WithdrawalService {
  async requestWithdrawal(
    userId: string,
    amount: number,
    method: 'paypal' | 'bank' | 'crypto',
    accountDetails: any
  ): Promise<WithdrawalRequest | null> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('points, wallet')
        .eq('id', userId)
        .single();

      const pointsMultiplier = 100;
      const pointsRequired = amount * pointsMultiplier;

      if ((user?.points || 0) < pointsRequired) {
        throw new Error('Insufficient points');
      }

      const { data: withdrawal, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: userId,
          amount: amount,
          points_amount: pointsRequired,
          method: method,
          account_details: accountDetails,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('users')
        .update({
          points: (user?.points || 0) - pointsRequired,
          wallet: {
            balance: (user?.wallet?.balance || 0) - amount,
            pending_withdrawal: amount,
          },
        })
        .eq('id', userId);

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'withdrawal_request',
        content: {
          text: `💰 Withdrawal request of $${amount} submitted. Processing in 1-3 business days.`,
        },
        created_at: new Date().toISOString(),
      });

      return withdrawal;
    } catch (error) {
      console.error('Withdrawal request failed:', error);
      return null;
    }
  }

  async getWithdrawalHistory(userId: string): Promise<WithdrawalRequest[]> {
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async getCreatorStats(userId: string): Promise<CreatorStats | null> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('points, wallet')
        .eq('id', userId)
        .single();

      const { data: rankData } = await supabase
        .from('leaderboard_record')
        // owner_id was missing from the original select — findIndex on r.owner_id
        // would always return -1 (field undefined), making rank always 0.
        .select('owner_id, score')
        .order('score', { ascending: false });

      // rankData?.findIndex(...) returns undefined when rankData is null/undefined,
      // making undefined + 1 = NaN. ?? -1 gives a safe fallback so not-found → 0.
      const rank = ((rankData?.findIndex((r: any) => r.owner_id === userId) ?? -1) + 1) || 0;

      const { data: weeklyData } = await supabase
        .from('points_history')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const weeklyPoints = weeklyData?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

      const { data: monthlyData } = await supabase
        .from('points_history')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const monthlyPoints = monthlyData?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

      const pointsMultiplier = 100;
      const totalEarned = (user?.points || 0) / pointsMultiplier;
      const availableForWithdrawal = totalEarned - (user?.wallet?.pending_withdrawal || 0);
      const withdrawnTotal = user?.wallet?.withdrawn_total || 0;

      return {
        totalPoints: user?.points || 0,
        totalEarned: totalEarned,
        availableForWithdrawal: Math.max(0, availableForWithdrawal),
        withdrawnTotal: withdrawnTotal,
        rank: rank,
        totalUsers: rankData?.length || 0,
        weeklyPoints: weeklyPoints,
        monthlyPoints: monthlyPoints,
      };
    } catch (error) {
      console.error('Failed to get creator stats:', error);
      return null;
    }
  }

  async getWithdrawalStatus(withdrawalId: string): Promise<WithdrawalRequest | null> {
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    return data;
  }

  async cancelWithdrawal(withdrawalId: string, userId: string): Promise<boolean> {
    try {
      const { data: withdrawal } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawalId)
        .eq('user_id', userId)
        .single();

      if (!withdrawal || withdrawal.status !== 'pending') {
        return false;
      }

      await supabase.from('withdrawals').update({ status: 'cancelled' }).eq('id', withdrawalId);

      await supabase.rpc('refund_points', {
        p_user_id: userId,
        p_points: withdrawal.points_amount,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

export const withdrawalService = new WithdrawalService();


