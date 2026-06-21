// src/components/withdrawal/CreatorStats.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface CreatorStatsProps {
  totalPoints: number;
  totalEarned: number;
  availableForWithdrawal: number;
  withdrawnTotal: number;
  rank: number;
  totalUsers: number;
  weeklyPoints: number;
  monthlyPoints: number;
  onWithdraw: () => void;
}

export const CreatorStats = ({
  totalPoints,
  totalEarned,
  availableForWithdrawal,
  withdrawnTotal,
  rank,
  totalUsers,
  weeklyPoints,
  monthlyPoints,
  onWithdraw,
}: CreatorStatsProps) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>Total Points</p>
          <p className="text-xl font-bold text-amber-400">{totalPoints.toLocaleString()}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>Total Earned</p>
          <p className="text-xl font-bold text-green-400">${totalEarned.toFixed(2)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>Available</p>
          <p className="text-xl font-bold text-purple-400">${availableForWithdrawal.toFixed(2)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>Withdrawn</p>
          <p className="text-xl font-bold text-blue-400">${withdrawnTotal.toFixed(2)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>Global Rank</p>
          <p className="text-lg font-bold">#{rank}</p>
          <p className={cn('text-xs', theme.textMuted)}>of {totalUsers} users</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>This Week</p>
          <p className="text-lg font-bold text-amber-400">{weeklyPoints.toLocaleString()} pts</p>
        </Card>
        <Card className="p-3 text-center">
          <p className={cn('text-xs', theme.textSecondary)}>This Month</p>
          <p className="text-lg font-bold text-purple-400">{monthlyPoints.toLocaleString()} pts</p>
        </Card>
      </div>

      {availableForWithdrawal >= 10 && (
        <Button onClick={onWithdraw} fullWidth size="lg">
          Withdraw Available Funds
        </Button>
      )}
    </div>
  );
};
