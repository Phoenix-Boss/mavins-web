// src/hooks/useDemoData.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useAppStore, Task } from '@/store/useAppStore';

interface Artist {
  id: string;
  name: string;
  username: string;
  chartPosition: number;
  avatarUrl?: string;
}

interface Track {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  coverArt?: string;
  plays: number;
  duration?: number;
  audioUrl?: string;
}

interface FeaturedArtist {
  artistId: string;
  artistName: string;
  songTitle: string;
  albumArt?: string;
  playCount: number;
}

export function useDemoData() {
  const supabase = createClient();
  const { user } = useAuth();
  const {
    tasks,
    setTasks,
    notifications,
    setNotifications,
    chatMessages,
    setChatMessages,
    points,
    streak
  } = useAppStore();

  const [featuredArtist, setFeaturedArtist] = useState<FeaturedArtist>({
    artistId: '',
    artistName: 'Loading...',
    songTitle: 'Loading...',
    playCount: 0
  });
  
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured artist (top chart position #1)
  useEffect(() => {
    const fetchFeaturedArtist = async () => {
      const { data: artist, error } = await supabase
        .from('users')
        .select('id, username, artist_name, chart_position')
        .eq('chart_position', 1)
        .single();

      if (error) {
        console.error('Error fetching featured artist:', error);
        return;
      }

      if (artist) {
        const { data: topTrack, error: trackError } = await supabase
          .from('tracks')
          .select('id, title, plays, cover_art')
          .eq('artist_id', artist.id)
          .order('plays', { ascending: false })
          .limit(1)
          .single();

        if (!trackError && topTrack) {
          setFeaturedArtist({
            artistId: artist.id,
            artistName: artist.artist_name || artist.username,
            songTitle: topTrack.title,
            albumArt: topTrack.cover_art || '/images/default-album.jpg',
            playCount: topTrack.plays || 0
          });
        }
      }
    };

    fetchFeaturedArtist();
  }, [supabase]);

  // Fetch trending artists (top 10 by chart position)
  useEffect(() => {
    const fetchTrendingArtists = async () => {
      const { data: artists, error } = await supabase
        .from('users')
        .select('id, username, artist_name, chart_position, avatar_url')
        .not('chart_position', 'is', null)
        .order('chart_position', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching trending artists:', error);
        return;
      }

      const formattedArtists: Artist[] = artists.map((artist: any) => ({
        id: artist.id,
        name: artist.artist_name || artist.username,
        username: artist.username,
        chartPosition: artist.chart_position,
        avatarUrl: artist.avatar_url
      }));

      setTrendingArtists(formattedArtists);
    };

    fetchTrendingArtists();
  }, [supabase]);

  // Fetch featured tracks (ordered by plays)
  useEffect(() => {
    const fetchTracks = async () => {
      const { data: tracksData, error } = await supabase
        .from('tracks')
        .select(`
          id,
          title,
          artist_id,
          duration,
          plays,
          cover_art,
          audio_url,
          users!inner (
            username,
            artist_name
          )
        `)
        .gte('plays', 0)
        .order('plays', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching tracks:', error);
        return;
      }

      const formattedTracks: Track[] = tracksData.map((track: any) => ({
        id: track.id,
        title: track.title,
        artistId: track.artist_id,
        artistName: track.users?.artist_name || track.users?.username || 'Unknown Artist',
        coverArt: track.cover_art || '/images/default-album.jpg',
        plays: track.plays || 0,
        duration: track.duration,
        audioUrl: track.audio_url
      }));

      setTracks(formattedTracks);
    };

    fetchTracks();

    // Subscribe to track play count updates
    const tracksChannel = supabase
      .channel('tracks-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tracks'
        },
        (payload: any) => {
          const updatedTrack = payload.new as any;
          setTracks(prev => prev.map((track: any) => 
            track.id === updatedTrack.id 
              ? { ...track, plays: updatedTrack.plays }
              : track
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tracksChannel);
    };
  }, [supabase]);

  // Fetch user tasks from real table
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!user?.id) return;

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
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user tasks:', error);
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

      setTasks(formattedTasks);
    };

    fetchUserTasks();

    // Subscribe to task updates
    const tasksChannel = supabase
      .channel('user-tasks-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchUserTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
    };
  }, [user?.id, supabase, setTasks]);

  // Fetch user notifications from real table
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      const { data: notificationsData, error } = await supabase
        .from('notification')
        .select('id, user_id, title, message, is_read, create_time')
        .eq('user_id', user.id)
        .order('create_time', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const formattedNotifications = notificationsData.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title || 'Notification',
        message: n.message,
        isRead: n.is_read,
        createTime: new Date(n.create_time)
      }));

      setNotifications(formattedNotifications);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const notificationsChannel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `user_id=eq.${user?.id}`
        },
        (payload: any) => {
          const newNotification = payload.new as any;
          const formattedNotification = {
            id: newNotification.id,
            userId: newNotification.user_id,
            title: newNotification.title || 'Notification',
            message: newNotification.message,
            isRead: newNotification.is_read,
            createTime: new Date(newNotification.create_time)
          };
          // setNotifications takes a value, not a React-style (prev) => next updater,
          // so we read the freshest array straight off the store rather than closing
          // over `notifications` from this effect's original render.
          setNotifications([formattedNotification, ...useAppStore.getState().notifications]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user?.id, supabase, setNotifications]);

  // Fetch chat messages from real table
  useEffect(() => {
    const fetchChatMessages = async () => {
      const { data: messages, error } = await supabase
        .from('message')
        .select('id, sender_id, content, create_time')
        .eq('stream_mode', 'chat')
        .order('create_time', { ascending: false })
        .limit(100);

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

      const formattedMessages = messages.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        content: m.content,
        createTime: new Date(m.create_time),
        username: userMap.get(m.sender_id) || 'Anonymous'
      })).reverse();

      setChatMessages(formattedMessages);
    };

    fetchChatMessages();

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
          filter: 'stream_mode=eq.chat'
        },
        async (payload: any) => {
          const newMessage = payload.new as any;
          
          const { data: sender } = await supabase
            .from('users')
            .select('username')
            .eq('id', newMessage.sender_id)
            .single();

          const formattedMessage = {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            content: newMessage.content,
            createTime: new Date(newMessage.create_time),
            username: sender?.username || 'Anonymous'
          };

          setChatMessages([...useAppStore.getState().chatMessages, formattedMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, setChatMessages]);

  // Set loading false after initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    featuredArtist,
    trendingArtists,
    tracks,
    tasks,
    setTasks,
    notifications,
    setNotifications,
    chatMessages,
    setChatMessages,
    streak,
    points,
    tier: user?.tier || 'bronze',
    isLoading
  };
}


