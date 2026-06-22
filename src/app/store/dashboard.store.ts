// store/dashboard.store.ts
import { create } from 'zustand';
import { supabase } from '@/app/lib/supabase/client';
import { nakamaAuth } from '@/app/services/nakama-auth';

// Types
interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  target_count: number;
  reward_points: number;
  reward_amount: number;
  progress: number;
  is_completed: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  plays: number;
  earnings: number;
  liked: boolean;
}

interface Artist {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  verified: boolean;
  tier: string;
}

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  points: number;
  streak: number;
  role: string;
  tier: string;
  verified: boolean;
  wallet: any;
}

interface DashboardState {
  // User data
  userId: string | null;
  user: User | null;
  isNakamaConnected: boolean;
  
  // Stats
  todayEarnings: number;
  tracksListenedToday: number;
  weeklyTracks: number;
  weeklyEarnings: number;
  userRank: number | null;
  totalPoints: number;
  
  // Data
  tasks: Task[];
  trendingArtists: Artist[];
  tracks: Track[];
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: (userId: string) => Promise<void>;
  fetchDashboardData: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  fetchTodayStats: () => Promise<void>;
  fetchWeeklyStats: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchTrendingArtists: () => Promise<void>;
  fetchTracks: () => Promise<void>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>;
  likeTrack: (trackId: string) => Promise<void>;
  recordListening: (trackId: string, duration: number) => Promise<void>;
  submitEarningsToLeaderboard: (earnings: number) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  userId: null,
  user: null,
  isNakamaConnected: false,
  todayEarnings: 0,
  tracksListenedToday: 0,
  weeklyTracks: 0,
  weeklyEarnings: 0,
  userRank: null,
  totalPoints: 0,
  tasks: [],
  trendingArtists: [],
  tracks: [],
  loading: false,
  error: null,

  // Initialize with user ID
  initialize: async (userId: string) => {
    set({ loading: true, userId, error: null });

    try {
      console.log('🚀 Initializing dashboard for user:', userId);

      // Connect to Nakama
      const session = await nakamaAuth.authenticate(userId, `user_${userId.substring(0, 8)}`);

      // Ensure leaderboards exist
      await nakamaAuth.ensureLeaderboards();

      console.log('✅ Nakama authentication successful');

      // Get user rank
      const rankInfo = await nakamaAuth.getUserRank('earnings_leaderboard');

      set({
        isNakamaConnected: true,
        userRank: rankInfo?.rank || null,
        loading: false
      });

      // Fetch all dashboard data
      await get().fetchDashboardData();

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      set({
        error: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false,
        isNakamaConnected: false
      });
    }
  },

  // Fetch all dashboard data
  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    
    try {
      await Promise.all([
        get().fetchUserData(),
        get().fetchTodayStats(),
        get().fetchWeeklyStats(),
        get().fetchTasks(),
        get().fetchTrendingArtists(),
        get().fetchTracks()
      ]);
      
      set({ loading: false });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      set({ 
        error: 'Failed to load dashboard data',
        loading: false 
      });
    }
  },

  // Fetch user data from Supabase
  fetchUserData: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      set({ 
        user,
        totalPoints: user?.points || 0 
      });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  },

  // Fetch today's stats
  fetchTodayStats: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayHistory, error } = await supabase
        .from('user_listening_history')
        .select('amount_earned')
        .eq('user_id', userId)
        .gte('listened_at', today);

      if (error) throw error;

      const todayEarnings = todayHistory?.reduce((sum, h) => sum + (h.amount_earned || 0), 0) || 0;
      const tracksListenedToday = todayHistory?.length || 0;

      set({ todayEarnings, tracksListenedToday });
    } catch (error) {
      console.error('Failed to fetch today stats:', error);
    }
  },

  // Fetch weekly stats
  fetchWeeklyStats: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyHistory, error } = await supabase
        .from('user_listening_history')
        .select('amount_earned')
        .eq('user_id', userId)
        .gte('listened_at', weekAgo.toISOString());

      if (error) throw error;

      const weeklyEarnings = weeklyHistory?.reduce((sum, h) => sum + (h.amount_earned || 0), 0) || 0;
      const weeklyTracks = weeklyHistory?.length || 0;

      set({ weeklyEarnings, weeklyTracks });
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
    }
  },

  // Fetch tasks with progress
  fetchTasks: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data: tasksData, error } = await supabase
        .from('daily_tasks')
        .select(`
          id,
          title,
          description,
          task_type,
          target_count,
          reward_points,
          reward_amount,
          user_tasks!left (
            progress,
            is_completed
          )
        `)
        .eq('is_active', true)
        .eq('user_tasks.user_id', userId);

      if (error) throw error;

      const tasks: Task[] = tasksData?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        task_type: task.task_type,
        target_count: task.target_count,
        reward_points: task.reward_points,
        reward_amount: task.reward_amount,
        progress: task.user_tasks?.[0]?.progress || 0,
        is_completed: task.user_tasks?.[0]?.is_completed || false
      })) || [];

      set({ tasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  },

  // Fetch trending artists
  fetchTrendingArtists: async () => {
    try {
      const { data: artistsData, error } = await supabase
        .from('users')
        .select('id, username, artist_name, avatar_url, monthly_listeners_current, verified, tier')
        .eq('role', 'creator')
        .not('monthly_listeners_current', 'is', null)
        .order('monthly_listeners_current', { ascending: false })
        .limit(10);

      if (error) throw error;

      const trendingArtists: Artist[] = artistsData?.map(artist => ({
        id: artist.id,
        name: artist.artist_name || artist.username,
        avatar: artist.avatar_url || 'https://via.placeholder.com/100',
        followers: artist.monthly_listeners_current || 0,
        verified: artist.verified || false,
        tier: artist.tier || 'T3'
      })) || [];

      set({ trendingArtists });
    } catch (error) {
      console.error('Failed to fetch trending artists:', error);
    }
  },

  // Fetch tracks with like status
  fetchTracks: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data: tracksData, error } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          album,
          duration,
          cover_url,
          plays,
          earnings_per_play,
          users!tracks_artist_id_fkey (
            artist_name,
            display_name,
            username
          ),
          user_liked_tracks!left (
            user_id
          )
        `)
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;

      // Note: Supabase infers the `users` join as an array type here
      // (it can't statically guarantee a single related row), so we
      // index into it with [0] even though tracks_artist_id_fkey is
      // a many-to-one relationship that returns one artist per track.
      const tracks: Track[] = tracksData?.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.users?.[0]?.artist_name || track.users?.[0]?.display_name || track.users?.[0]?.username || 'Unknown Artist',
        album: track.album || 'Single',
        duration: track.duration || '3:00',
        cover: track.cover_url || 'https://via.placeholder.com/200',
        plays: track.plays || 0,
        earnings: track.earnings_per_play || 0.001,
        liked: track.user_liked_tracks?.some(ult => ult.user_id === userId) || false
      })) || [];

      set({ tracks });
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    }
  },

  // Update task progress
  updateTaskProgress: async (taskId: string, progress: number) => {
    const { userId, tasks } = get();
    if (!userId) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const isCompleted = progress >= task.target_count;
      
      const { error } = await supabase
        .from('user_tasks')
        .upsert({
          user_id: userId,
          task_id: taskId,
          progress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === taskId 
            ? { ...t, progress, is_completed: isCompleted }
            : t
        )
      }));

      // If task completed, add rewards
      if (isCompleted && !task.is_completed) {
        await supabase.rpc('increment_user_points', {
          user_id: userId,
          points_to_add: task.reward_points
        });
        
        // Update user points in state
        set(state => ({
          user: state.user ? { ...state.user, points: (state.user.points || 0) + task.reward_points } : null,
          totalPoints: state.totalPoints + task.reward_points
        }));
      }
    } catch (error) {
      console.error('Failed to update task progress:', error);
    }
  },

  // Like or unlike a track
  likeTrack: async (trackId: string) => {
    const { userId, tracks } = get();
    if (!userId) return;

    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    try {
      if (track.liked) {
        // Unlike
        const { error } = await supabase
          .from('user_liked_tracks')
          .delete()
          .eq('user_id', userId)
          .eq('track_id', trackId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('user_liked_tracks')
          .insert({ user_id: userId, track_id: trackId });

        if (error) throw error;
        
        // Update task progress for "Like 5 songs" task
        const likeTask = get().tasks.find(t => t.task_type === 'like');
        if (likeTask && !likeTask.is_completed) {
          await get().updateTaskProgress(likeTask.id, likeTask.progress + 1);
        }
      }

      // Update local state
      set(state => ({
        tracks: state.tracks.map(t =>
          t.id === trackId ? { ...t, liked: !t.liked } : t
        )
      }));
    } catch (error) {
      console.error('Failed to like/unlike track:', error);
    }
  },

  // Record listening activity
  recordListening: async (trackId: string, duration: number) => {
    const { userId } = get();
    if (!userId) return;

    const pointsEarned = Math.floor(duration / 60); // 1 point per minute
    const amountEarned = (duration / 60) * 0.001; // $0.001 per minute

    try {
      // Record in Supabase
      const { error } = await supabase
        .from('user_listening_history')
        .insert({
          user_id: userId,
          track_id: trackId,
          points_earned: pointsEarned,
          amount_earned: amountEarned,
          listened_at: new Date().toISOString(),
          is_full_listen: duration >= 180 // Consider full listen if 3+ minutes
        });

      if (error) throw error;

      // Update user points in Supabase
      await supabase.rpc('increment_user_points', {
        user_id: userId,
        points_to_add: pointsEarned
      });

      // Update task progress for listening tasks
      const listenTask = get().tasks.find(t => t.task_type === 'listen');
      if (listenTask && !listenTask.is_completed) {
        await get().updateTaskProgress(listenTask.id, listenTask.progress + 1);
      }

      // Refresh stats
      await get().fetchTodayStats();
      await get().fetchWeeklyStats();
      await get().fetchUserData();
      
      // Submit to Nakama leaderboard
      const newTotal = get().todayEarnings + amountEarned;
      await get().submitEarningsToLeaderboard(newTotal);
      
    } catch (error) {
      console.error('Failed to record listening:', error);
    }
  },

  // Submit earnings to Nakama leaderboard
  submitEarningsToLeaderboard: async (earnings: number) => {
    const { isNakamaConnected } = get();
    if (!isNakamaConnected) return;

    try {
      // Convert dollars to cents for leaderboard score
      const scoreInCents = Math.floor(earnings * 100);
      await nakamaAuth.submitScore('earnings_leaderboard', scoreInCents);
      
      // Get updated rank
      const rank = await nakamaAuth.getUserRank('earnings_leaderboard');
      if (rank) {
        set({ userRank: rank.rank });
      }
    } catch (error) {
      console.warn('Failed to submit to leaderboard:', error);
    }
  },

  // Disconnect from Nakama
  disconnect: async () => {
    await nakamaAuth.disconnect();
    set({ 
      isNakamaConnected: false, 
      userId: null, 
      user: null,
      userRank: null
    });
  }
}));
