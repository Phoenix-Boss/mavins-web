// src/hooks/gamification/useGamification.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { pointsService } from '@/services/gamification/points.service';
import { tasksService } from '@/services/gamification/tasks.service';
import { streakService } from '@/services/gamification/streak.service';
import { tierService } from '@/services/gamification/tier.service';
import { badgeService } from '@/services/gamification/badge.service';
import type { DailyTask, UserTask } from '@/services/gamification/tasks.service';
import type { Badge } from '@/services/gamification/badge.service';

export const useGamification = () => {
  const { user, updateUserPoints, updateUserStreak } = useAuth();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [nextTier, setNextTier] = useState<{ name: string; pointsNeeded: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [userTasks, userBadges, history, nextTierInfo] = await Promise.all([
        tasksService.getUserTasks(user.id),
        badgeService.getUserBadges(user.id),
        pointsService.getPointsHistory(user.id, 20),
        tierService.getNextTier(user.id),
      ]);

      setTasks(userTasks);
      setBadges(userBadges);
      setPointsHistory(history);
      setNextTier(nextTierInfo);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const updateTaskProgress = useCallback(async (taskId: string, increment: number = 1) => {
    if (!user) return null;
    const updatedTask = await tasksService.updateTaskProgress(user.id, taskId, increment);
    if (updatedTask) {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      // updateUserPoints expects a delta, not the new absolute total — task completion
      // doesn't award points until claimed, so we don't call it here.
    }
    return updatedTask;
  }, [user]);

  const claimTask = useCallback(async (taskId: string) => {
    if (!user) return false;
    const task = tasks.find(t => t.id === taskId);
    const success = await tasksService.claimTaskReward(user.id, taskId);
    if (success) {
      await loadAllData();
      // updateUserPoints adds this amount to the user's current points (delta, not total).
      if (task) {
        await updateUserPoints(task.reward_points ?? 0);
      }
    }
    return success;
  }, [user, tasks, loadAllData, updateUserPoints]);

  const refreshStreak = useCallback(async () => {
    if (!user) return 0;
    // updateUserStreak computes and persists the new streak internally
    // from user.lastLoginAt; it takes no arguments and returns void.
    await updateUserStreak();
    return user.streak;
  }, [user, updateUserStreak]);

  const refreshTier = useCallback(async () => {
    if (!user) return 'T4';
    const newTier = await tierService.checkAndUpdateTier(user.id);
    if (newTier !== user.tier) {
      await loadAllData();
    }
    return newTier;
  }, [user, loadAllData]);

  const getTaskById = useCallback((taskId: string) => {
    return tasks.find(t => t.task_id === taskId);
  }, [tasks]);

  const getTodayProgress = useCallback(async () => {
    if (!user) return { completed: 0, total: 0, totalPoints: 0 };
    return tasksService.getTodayProgress(user.id);
  }, [user]);

  return {
    tasks,
    badges,
    pointsHistory,
    nextTier,
    isLoading,
    updateTaskProgress,
    claimTask,
    refreshStreak,
    refreshTier,
    getTaskById,
    getTodayProgress,
    reload: loadAllData,
  };
};
