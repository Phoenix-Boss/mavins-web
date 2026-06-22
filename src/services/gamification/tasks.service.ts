// src/services/gamification/tasks.service.ts
import { supabase } from '@/lib/supabase/client';

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  type: 'specific_song' | 'genre' | 'quantity' | 'duration' | 'featured';
  targetId?: string;
  targetCount: number;
  rewardPoints: number;
}

export interface UserTask {
  id: string;
  taskId: string;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: Date;
  claimedAt?: Date;
  task?: DailyTask;
}

// Maps a raw snake_case Supabase row to the camelCase UserTask interface.
// All methods that return UserTask rows go through this so the interface
// is actually satisfied rather than just asserted via `any`.
function mapToUserTask(row: any): UserTask {
  return {
    id: row.id,
    taskId: row.task_id,
    progress: row.progress,
    isCompleted: row.is_completed,
    isClaimed: row.is_claimed,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    claimedAt: row.claimed_at ? new Date(row.claimed_at) : undefined,
    task: row.task ? {
      id: row.task.id,
      title: row.task.title,
      description: row.task.description,
      type: row.task.type,
      targetId: row.task.target_id,
      targetCount: row.task.target_count,
      rewardPoints: row.task.reward_points,
    } : undefined,
  };
}

class TasksService {
  async getDailyTasks(): Promise<DailyTask[]> {
    const { data } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('is_active', true)
      .limit(3);
    return data || [];
  }

  async getUserTasks(userId: string): Promise<UserTask[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existingTasks } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .gte('created_at', today);

    if (existingTasks && existingTasks.length > 0) {
      return existingTasks.map(mapToUserTask);
    }

    const dailyTasks = await this.getDailyTasks();
    const newTasks: UserTask[] = [];

    for (const task of dailyTasks) {
      const { data: newTask } = await supabase
        .from('user_tasks')
        .insert({
          user_id: userId,
          task_id: task.id,
          progress: 0,
          is_completed: false,
          is_claimed: false,
          created_at: new Date().toISOString(),
        })
        .select('*, task:daily_tasks(*)')
        .single();
      
      if (newTask) newTasks.push(mapToUserTask(newTask));
    }

    return newTasks;
  }

  async updateTaskProgress(userId: string, taskId: string, increment: number = 1): Promise<UserTask | null> {
    const { data: currentTask } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (!currentTask || currentTask.is_completed) return currentTask ? mapToUserTask(currentTask) : null;

    const newProgress = Math.min(currentTask.progress + increment, currentTask.task.target_count);
    const isCompleted = newProgress >= currentTask.task.target_count;

    const { data: updatedTask } = await supabase
      .from('user_tasks')
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', currentTask.id)
      .select('*, task:daily_tasks(*)')
      .single();

    if (isCompleted && updatedTask) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'task_completed',
        content: { text: `✅ Completed "${currentTask.task.title}"! Claim your ${currentTask.task.reward_points} points!` },
        created_at: new Date().toISOString(),
      });
    }

    return updatedTask ? mapToUserTask(updatedTask) : null;
  }

  async claimTaskReward(userId: string, taskId: string): Promise<boolean> {
    const { data: task } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (!task || !task.is_completed || task.is_claimed) return false;

    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({
        is_claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    if (updateError) return false;

    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    const newPoints = (user?.points || 0) + task.task.reward_points;

    await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    await supabase.from('points_history').insert({
      user_id: userId,
      amount: task.task.reward_points,
      type: 'task',
      description: `Completed: ${task.task.title}`,
      created_at: new Date().toISOString(),
    });

    return true;
  }

  async getTodayProgress(userId: string): Promise<{ completed: number; total: number; totalPoints: number }> {
    const tasks = await this.getUserTasks(userId);
    const completed = tasks.filter(t => t.isCompleted && t.isClaimed).length;
    const total = tasks.length;
    const totalPoints = tasks.reduce((sum, t) => sum + (t.isClaimed ? (t.task?.rewardPoints || 0) : 0), 0);
    return { completed, total, totalPoints };
  }
}

export const tasksService = new TasksService();
