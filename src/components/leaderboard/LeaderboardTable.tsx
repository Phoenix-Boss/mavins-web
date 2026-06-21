// src/components/leaderboard/LeaderboardTable.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  tier: string;
  isCurrentUser?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  title?: string;
  isLoading?: boolean;
}

export const LeaderboardTable = ({ entries, title, isLoading = false }: LeaderboardTableProps) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-neutral-700 rounded-full"></div>
              <div className="flex-1 h-4 bg-neutral-700 rounded"></div>
              <div className="w-16 h-4 bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'ðŸ¥‡';
    if (rank === 2) return 'ðŸ¥ˆ';
    if (rank === 3) return 'ðŸ¥‰';
    return '#' + rank;
  };

  return (
    <Card className="overflow-hidden">
      {title && (
        <div className={cn('p-4 border-b', theme.border)}>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}
      <div className="divide-y divide-neutral-800">
        {entries.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              'flex items-center gap-3 p-3 transition-colors',
              entry.isCurrentUser ? 'bg-amber-500/10' : 'hover:bg-white/5'
            )}
          >
            <div className="w-10 text-center font-mono text-sm font-bold">
              {getRankBadge(entry.rank)}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {entry.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className={cn('font-medium', entry.isCurrentUser ? 'text-amber-400' : theme.text)}>
                {entry.username}
                {entry.isCurrentUser && <span className="text-xs ml-2 text-neutral-400">(You)</span>}
              </p>
              <p className="text-xs text-neutral-400">Tier {entry.tier}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-amber-400">{entry.points.toLocaleString()} pts</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
