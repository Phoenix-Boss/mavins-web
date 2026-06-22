// src/components/withdrawal/WithdrawalHistory.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

export interface WithdrawalItem {
  id: string;
  amount: number;
  pointsAmount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';
  message?: string;
  createdAt: Date;
  processedAt?: Date;
}

interface WithdrawalHistoryProps {
  withdrawals: WithdrawalItem[];
}

const statusConfig = {
  pending: { label: 'Pending', color: 'warning' },
  processing: { label: 'Processing', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'destructive' },
  delayed: { label: 'Delayed', color: 'warning' },
};

export const WithdrawalHistory = ({ withdrawals }: WithdrawalHistoryProps) => {
  const { theme } = useTheme();

  if (withdrawals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <span className="text-4xl mb-2 block">💸</span>
        <p className={cn('text-sm', theme.textSecondary)}>No withdrawal requests yet</p>
        <p className={cn('text-xs mt-1', theme.textMuted)}>Your withdrawal history will appear here</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-neutral-800">
        <h3 className="font-semibold">Withdrawal History</h3>
      </div>
      <div className="divide-y divide-neutral-800">
        {withdrawals.map((w) => (
          <div key={w.id} className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium">${w.amount.toFixed(2)}</p>
                <p className={cn('text-xs', theme.textSecondary)}>
                  {w.method.charAt(0).toUpperCase() + w.method.slice(1)} • {w.pointsAmount.toLocaleString()} points
                </p>
                <p className="text-xs text-neutral-500 mt-1">{new Date(w.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <Badge variant={statusConfig[w.status].color} size="sm">
                  {statusConfig[w.status].label}
                </Badge>
                {w.message && <p className={cn('text-xs mt-2 max-w-[200px]', theme.textMuted)}>{w.message}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

