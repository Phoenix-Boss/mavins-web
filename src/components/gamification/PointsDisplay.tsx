// src/components/gamification/PointsDisplay.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface PointsDisplayProps {
  points: number;
  streak: number;
  tier: string;
  nextTier?: { name: string; pointsNeeded: number };
}

export const PointsDisplay = ({ points, streak, tier, nextTier }: PointsDisplayProps) => {
  const { theme } = useTheme();

  const tierColors = {
    T4: 'from-gray-500 to-gray-700',
    T3: 'from-amber-600 to-amber-800',
    T2: 'from-gray-300 to-gray-500',
    T1: 'from-yellow-400 to-yellow-600',
  };

  const tierColor = tierColors[tier as keyof typeof tierColors] || tierColors.T4;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card padding="sm" glass className="text-center">
        <p className={cn('text-xs', theme.textSecondary)}>Total Points</p>
        <p className="text-2xl font-bold text-amber-400">{points.toLocaleString()}</p>
      </Card>
      <Card padding="sm" glass className="text-center">
        <p className={cn('text-xs', theme.textSecondary)}>Streak</p>
        <p className="text-2xl font-bold flex items-center justify-center gap-1">
          {streak} <span className="text-amber-400">ðŸ”¥</span>
        </p>
      </Card>
      <Card padding="sm" glass className="text-center">
        <p className={cn('text-xs', theme.textSecondary)}>Tier</p>
        <div className={cn('text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent', tierColor)}>
          {tier}
        </div>
      </Card>
      {nextTier && (
        <Card padding="sm" glass className="col-span-3">
          <div className="flex items-center justify-between text-sm">
            <span className={theme.textSecondary}>Next Tier: {nextTier.name}</span>
            <span className="text-amber-400">{nextTier.pointsNeeded} points needed</span>
          </div>
          <div className="mt-2 w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-purple-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, (points / (points + nextTier.pointsNeeded)) * 100)}%` }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};
