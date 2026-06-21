// src/components/tasks/TaskCard.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  points: number;
  progress: number;
  target: number;
  type: string;
  isCompleted: boolean;
  isClaimed?: boolean;
  onPlay: () => void;
  onClaim?: () => void;
}

export const TaskCard = ({
  id,
  title,
  description,
  points,
  progress,
  target,
  type,
  isCompleted,
  isClaimed = false,
  onPlay,
  onClaim,
}: TaskCardProps) => {
  const { theme } = useTheme();
  const percentage = Math.min((progress / target) * 100, 100);

  const getTaskIcon = () => {
    switch (type) {
      case 'listen':
        return '🎵';
      case 'share':
        return '📤';
      case 'daily':
        return '📅';
      case 'achievement':
        return '🏆';
      default:
        return '📋';
    }
  };

  return (
    <Card padding="sm" className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{getTaskIcon()}</span>
            <h4 className={cn('font-medium', theme.text)}>{title}</h4>
            <Badge variant="accent" size="sm">+{points} pts</Badge>
            {isCompleted && !isClaimed && (
              <Badge variant="success" size="sm">Ready to Claim</Badge>
            )}
            {isClaimed && (
              <Badge variant="success" size="sm">Claimed ✓</Badge>
            )}
          </div>
          {description && (
            <p className={cn('text-sm mt-1', theme.textSecondary)}>{description}</p>
          )}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={theme.textSecondary}>Progress</span>
              <span className={theme.textSecondary}>
                {progress}/{target}
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isCompleted ? (
            <Button size="sm" onClick={onPlay} variant="primary">
              {type === 'listen' ? 'Play' : 'Complete'}
            </Button>
          ) : !isClaimed ? (
            <Button size="sm" onClick={onClaim} variant="success">
              Claim Reward
            </Button>
          ) : (
            <Button size="sm" disabled variant="ghost">
              Completed
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};