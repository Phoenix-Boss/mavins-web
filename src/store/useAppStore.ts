// src/store/useAppStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

// Define Task type based on your actual database schema
export interface Task {
  id: string;
  userId: string;
  taskId: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  type: 'listen' | 'share' | 'daily' | 'achievement';
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt?: Date;
  targetId?: string; // track_id for listen tasks
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createTime: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createTime: Date;
  username?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  points: number;
  streak: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  artistName?: string;
  chartPosition?: number;
  isActive: boolean;
}

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Points & streak
  points: number;
  streak: number;
  tier: string;
  setPoints: (points: number) => void;
  setStreak: (streak: number) => void;
  setTier: (tier: string) => void;
  
  // UI state
  isSidebarOpen: boolean;
  isTaskPanelOpen: boolean;
  isNotificationPanelOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsTaskPanelOpen: (isOpen: boolean) => void;
  setIsNotificationPanelOpen: (isOpen: boolean) => void;
  
  // Data
  tasks: Task[];
  notifications: Notification[];
  chatMessages: ChatMessage[];
  setTasks: (tasks: Task[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  
  // Async actions
  fetchUserData: (userId: string) => Promise<void>;
  fetchUserTasks: (userId: string) => Promise<void>;
  fetchUserNotifications: (userId: string) => Promise<void>;
  fetchChatMessages: (poolId?: string) => Promise<void>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  claimTaskReward: (taskId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addPoints: (userId: string, points: number, reason: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      points: 0,
      streak: 0,
      tier: 'bronze',
      isSidebarOpen: false,
      isTaskPanelOpen: false,
      isNotificationPanelOpen: false,
      tasks: [],
      notifications: [],
      chatMessages: [],
      
      // Setters
      setUser: (user) => set({ user }),
      setPoints: (points) => set({ points }),
      setStreak: (streak) => set({ streak }),
      setTier: (tier) => set({ tier }),
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      setIsTaskPanelOpen: (isTaskPanelOpen) => set({ isTaskPanelOpen }),
      setIsNotificationPanelOpen: (isNotificationPanelOpen) => set({ isNotificationPanelOpen }),
      setTasks: (tasks) => set({ tasks }),
      setNotifications: (notifications) => set({ notifications }),
      setChatMessages: (chatMessages) => set({ chatMessages }),
      
      // Async actions
      fetchUserData: async (userId: string) => {
        const supabase = createClient();
        
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, username, artist_name, chart_position, created_at, last_login')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        
        // Fetch user points from wallet_ledger
        const { data: pointsData } = await supabase
          .from('wallet_ledger')
          .select('amount')
          .eq('user_id', userId)
          .order('create_time', { ascending: false });
        
        const totalPoints = pointsData?.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) || 0;
        
        // Calculate tier based on points
        let tier = 'bronze';
        if (totalPoints >= 10000) tier = 'platinum';
        else if (totalPoints >= 5000) tier = 'gold';
        else if (totalPoints >= 1000) tier = 'silver';
        
        set({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            artistName: user.artist_name,
            chartPosition: user.chart_position,
            points: totalPoints,
            streak: 0,
            tier: tier as any,
            isActive: true
          },
          points: totalPoints,
          tier
        });
      },
      
      fetchUserTasks: async (userId: string) => {
        const supabase = createClient();
        
        const { data: userTasks, error } = await supabase
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
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error fetching tasks:', error);
          return;
        }
        
        const formattedTasks: Task[] = userTasks.map((ut: any) => ({
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
        
        set({ tasks: formattedTasks });
      },
      
      fetchUserNotifications: async (userId: string) => {
        const supabase = createClient();
        
        const { data: notifications, error } = await supabase
          .from('notification')
          .select('id, user_id, title, message, is_read, create_time')
          .eq('user_id', userId)
          .order('create_time', { ascending: false })
          .limit(50);
        
        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }
        
        const formattedNotifications: Notification[] = notifications.map((n: any) => ({
          id: n.id,
          userId: n.user_id,
          title: n.title || 'Notification',
          message: n.message,
          isRead: n.is_read,
          createTime: new Date(n.create_time)
        }));
        
        set({ notifications: formattedNotifications });
      },
      
      fetchChatMessages: async (poolId?: string) => {
        const supabase = createClient();
        
        let query = supabase
          .from('message')
          .select('id, sender_id, content, create_time')
          .eq('stream_mode', 'chat')
          .order('create_time', { ascending: false })
          .limit(100);
        
        if (poolId) {
          query = query.eq('stream_descriptor', poolId);
        }
        
        const { data: messages, error } = await query;
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        const senderIds = [...new Set(messages.map((m: any) => m.sender_id))];
        const { data: users } = await supabase
          .from('users')
          .select('id, username')
          .in('id', senderIds);
        
        const userMap = new Map(users?.map((u: any) => [u.id, u.username]) || []);
        
        const formattedMessages: ChatMessage[] = messages.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          content: m.content,
          createTime: new Date(m.create_time),
          username: userMap.get(m.sender_id) || 'Unknown'
        })).reverse();
        
        set({ chatMessages: formattedMessages });
      },
      
      updateTaskProgress: async (taskId: string, progress: number) => {
        const supabase = createClient();
        const { tasks } = get();
        const task = tasks.find((t: any) => t.id === taskId);
        
        if (!task) return;
        
        const newProgress = Math.min(task.progress + progress, task.target);
        const isCompleted = newProgress >= task.target;
        
        const { error } = await supabase
          .from('user_tasks')
          .update({
            progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', taskId);
        
        if (error) {
          console.error('Error updating task:', error);
          return;
        }
        
        set({
          tasks: tasks.map((t: any) =>
            t.id === taskId
              ? { ...t, progress: newProgress, isCompleted, completedAt: isCompleted ? new Date() : t.completedAt }
              : t
          )
        });
      },
      
      completeTask: async (taskId: string) => {
        const supabase = createClient();
        const { tasks } = get();
        const task = tasks.find((t: any) => t.id === taskId);
        
        if (!task || task.isCompleted) return;
        
        const { error } = await supabase
          .from('user_tasks')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', taskId);
        
        if (error) {
          console.error('Error completing task:', error);
          return;
        }
        
        set({
          tasks: tasks.map((t: any) =>
            t.id === taskId
              ? { ...t, isCompleted: true, completedAt: new Date() }
              : t
          )
        });
      },
      
      claimTaskReward: async (taskId: string) => {
        const supabase = createClient();
        const { tasks, user, addPoints } = get();
        const task = tasks.find((t: any) => t.id === taskId);
        
        if (!task || !task.isCompleted || task.isClaimed || !user) return;
        
        const reward = task.points;
        
        const { error: taskError } = await supabase
          .from('user_tasks')
          .update({ is_claimed: true })
          .eq('id', taskId);
        
        if (taskError) {
          console.error('Error claiming task:', taskError);
          return;
        }
        
        await addPoints(user.id, reward, `Task reward: ${task.title}`);
        
        set({
          tasks: tasks.map((t: any) =>
            t.id === taskId
              ? { ...t, isClaimed: true }
              : t
          )
        });
      },
      
      markNotificationAsRead: async (notificationId: string) => {
        const supabase = createClient();
        const { notifications } = get();
        
        const { error } = await supabase
          .from('notification')
          .update({ is_read: true })
          .eq('id', notificationId);
        
        if (error) {
          console.error('Error marking notification as read:', error);
          return;
        }
        
        set({
          notifications: notifications.map((n: any) =>
            n.id === notificationId
              ? { ...n, isRead: true }
              : n
          )
        });
      },
      
      addPoints: async (userId: string, points: number, reason: string) => {
        const supabase = createClient();
        const { points: currentPoints, user } = get();
        
        const { error: ledgerError } = await supabase
          .from('wallet_ledger')
          .insert({
            user_id: userId,
            amount: points,
            reason: reason,
            create_time: new Date().toISOString()
          });
        
        if (ledgerError) {
          console.error('Error adding points:', ledgerError);
          return;
        }
        
        const newPoints = currentPoints + points;
        let newTier = user?.tier || 'bronze';
        
        if (newPoints >= 10000) newTier = 'platinum';
        else if (newPoints >= 5000) newTier = 'gold';
        else if (newPoints >= 1000) newTier = 'silver';
        
        set({
          points: newPoints,
          tier: newTier,
          user: user ? { ...user, points: newPoints, tier: newTier as any } : null
        });
      }
    }),
    {
      name: 'soundwave-storage',
      partialize: (state) => ({
        user: state.user,
        points: state.points,
        streak: state.streak,
        tier: state.tier
      })
    }
  )
);


