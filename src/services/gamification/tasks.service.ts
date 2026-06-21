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
      return existingTasks;
    }

    const dailyTasks = await this.getDailyTasks();
    const newTasks = [];

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
      
      if (newTask) newTasks.push(newTask);
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

    if (!currentTask || currentTask.is_completed) return currentTask;

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
        content: { text: `âœ… Completed "${currentTask.task.title}"! Claim your ${currentTask.task.rewardPoints} points!` },
        created_at: new Date().toISOString(),
      });
    }

    return updatedTask;
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
    const completed = tasks.filter(t => t.is_completed && t.is_claimed).length;
    const total = tasks.length;
    const totalPoints = tasks.reduce((sum, t) => sum + (t.is_claimed ? (t.task?.reward_points || 0) : 0), 0);
    return { completed, total, totalPoints };
  }
}

export const tasksService = new TasksService();
