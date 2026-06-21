// src/components/tasks/TaskPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { TaskCard } from './TaskCard';
import { StreakDisplay } from './StreakDisplay';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';

interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  progress: number;
  target: number;
  type: string;
  isCompleted: boolean;
  isClaimed?: boolean;
  targetId?: string;
}

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  streak: number;
  onTaskPlay: (taskId: string) => void;
  onTaskClaim?: (taskId: string) => void;
}

export const TaskPanel = ({ 
  isOpen, 
  onClose, 
  tasks, 
  streak, 
  onTaskPlay, 
  onTaskClaim 
}: TaskPanelProps) => {
  const { theme } = useTheme();
  const supabase = createClient();
  const { user } = useAuth();
  const { setTasks } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Subscribe to task updates in real-time
  useEffect(() => {
    if (!user?.id || !isOpen) return;

    const channel = supabase
      .channel('task-panel-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Refresh tasks when updated
          setIsRefreshing(true);
          
          const { data: updatedTasks } = await supabase
            .from('user_tasks')
            .select(`
              id,
              user_id,
              task_id,
              progress,
              target,
              is_completed,
              is_claimed,
              completed_at,
              daily_tasks!inner (
                id,
                target_id,
                type,
                reward,
                description,
                title
              )
            `)
            .eq('user_id', user.id);

          if (updatedTasks) {
            const formattedTasks = updatedTasks.map((ut: any) => ({
              id: ut.id,
              userId: ut.user_id,
              taskId: ut.task_id,
              title: ut.daily_tasks?.title || 'Complete Task',
              description: ut.daily_tasks?.description || '',
              points: ut.daily_tasks?.reward || 50,
              progress: ut.progress,
              target: ut.target,
              type: ut.daily_tasks?.type || 'daily',
              isCompleted: ut.is_completed,
              isClaimed: ut.is_claimed,
              completedAt: ut.completed_at ? new Date(ut.completed_at) : undefined,
              targetId: ut.daily_tasks?.target_id
            }));
            setTasks(formattedTasks);
          }
          
          setIsRefreshing(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id, isOpen, setTasks]);

  if (!isOpen) return null;

  const incompleteCount = tasks.filter((t) => !t.isCompleted).length;
  const totalPointsAvailable = tasks
    .filter((t) => t.isCompleted && !t.isClaimed)
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" onClick={onClose} />
      <div className={cn(
        'fixed right-0 top-0 bottom-0 w-full max-w-md z-50 shadow-2xl transition-transform duration-300 ease-out',
        theme.bgSecondary,
        'border-l',
        theme.border
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-semibold">Daily Tasks</h2>
              <p className={cn('text-sm', theme.textSecondary)}>
                {incompleteCount} task{incompleteCount !== 1 ? 's' : ''} remaining
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 border-b border-neutral-800">
            <StreakDisplay streak={streak} />
          </div>

          {totalPointsAvailable > 0 && (
            <div className="p-4 bg-amber-500/10 border-b border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-lg">💰</span>
                  <span className="text-sm font-medium">Pending Rewards</span>
                </div>
                <span className="text-amber-400 font-bold">{totalPointsAvailable} pts</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isRefreshing ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
              </div>
            ) : tasks.length === 0 ? (
              <div className={cn('text-center py-8', theme.textSecondary)}>
                No tasks available. Check back tomorrow!
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  points={task.points}
                  progress={task.progress}
                  target={task.target}
                  type={task.type}
                  isCompleted={task.isCompleted}
                  isClaimed={task.isClaimed}
                  onPlay={() => onTaskPlay(task.id)}
                  onClaim={() => onTaskClaim?.(task.id)}
                />
              ))
            )}
          </div>

          <div className="p-4 border-t border-neutral-800">
            <p className={cn('text-xs text-center', theme.textMuted)}>
              Complete tasks to earn points and increase your streak!
            </p>
          </div>
        </div>
      </div>
    </>
  );
};