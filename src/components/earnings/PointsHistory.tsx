// src/components/earnings/PointsHistory.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

export interface HistoryEntry {
  id: string;
  action: string;
  points: number;
  timestamp: Date;
}

interface PointsHistoryProps {
  entries: HistoryEntry[];
}

export const PointsHistory = ({ entries }: PointsHistoryProps) => {
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Points History</h3>
      <div className="space-y-3">
        {entries.map((entry: any) => (
          <div key={entry.id} className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0">
            <div>
              <p className="font-medium">{entry.action}</p>
              <p className={cn('text-xs', theme.textSecondary)}>{formatDate(entry.timestamp)}</p>
            </div>
            <p className={cn('font-bold', entry.points > 0 ? 'text-green-400' : 'text-red-400')}>
              {entry.points > 0 ? '+' : ''}{entry.points}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

