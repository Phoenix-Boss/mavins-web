// src/components/tasks/StreakDisplay.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface StreakDisplayProps {
  streak: number;
}

export const StreakDisplay = ({ streak }: StreakDisplayProps) => {
  const { theme } = useTheme();
  const supabase = createClient();
  const { user } = useAuth();
  const [animate, setAnimate] = useState(false);
  const [nextMilestonePoints, setNextMilestonePoints] = useState(100);
  const [nextMilestoneDays, setNextMilestoneDays] = useState(1);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [streak]);

  useEffect(() => {
    // Calculate next milestone based on streak
    if (streak < 7) {
      setNextMilestonePoints(100);
      setNextMilestoneDays(7 - streak);
    } else if (streak < 30) {
      setNextMilestonePoints(500);
      setNextMilestoneDays(30 - streak);
    } else if (streak < 100) {
      setNextMilestonePoints(1000);
      setNextMilestoneDays(100 - streak);
    } else {
      setNextMilestonePoints(5000);
      setNextMilestoneDays(streak + 1);
    }
  }, [streak]);

  // Subscribe to streak updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('streak-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newStreak = (payload.new as any).streak;
          if (newStreak !== streak) {
            setAnimate(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id, streak]);

  return (
    <Card padding="sm" glass>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl transition-all duration-300',
            animate && 'scale-125 rotate-12'
          )}>
            🔥
          </div>
          <div>
            <p className={cn('text-xs', theme.textSecondary)}>Current Streak</p>
            <p className="text-2xl font-bold">
              {streak} day{streak !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-xs', theme.textSecondary)}>Next Milestone</p>
          <p className="text-sm font-medium text-amber-400">
            +{nextMilestonePoints} pts at {nextMilestoneDays} day{nextMilestoneDays !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Card>
  );
};