'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendingArtists } from '@/components/home/TrendingArtists';
import { SongList } from '@/components/home/SongList';
import { TaskPanel } from '@/components/tasks/TaskPanel';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { ChatList } from '@/components/chat/ChatList';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { BannerModal } from '@/components/modals/BannerModal';
import { EmailModal } from '@/components/modals/EmailModal';
import { WelcomeBonusModal } from '@/components/modals/WelcomeBonusModal';
import { useAppStore } from '@/store/useAppStore';
import { useDemoData } from '@/hooks/useDemoData';
import { useAuth } from '@/hooks/auth/useAuth';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const { theme } = useTheme();
  const supabase = createClient();
  const { 
    user, 
    isAuthenticated, 
    createUser, 
    activateAccount,
    updateUserPoints,
    updateUserStreak
  } = useAuth();
  
  const {
    isSidebarOpen,
    isTaskPanelOpen,
    isNotificationPanelOpen,
    setIsSidebarOpen,
    setIsTaskPanelOpen,
    setIsNotificationPanelOpen,
    tasks,
    setTasks,
    notifications,
    setNotifications,
    chatMessages,
    setChatMessages,
    points,
    streak,
    tier
  } = useAppStore();

  const {
    featuredArtist,
    trendingArtists,
    tracks,
    isLoading: isDataLoading
  } = useDemoData();

  const [showBanner, setShowBanner] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [incompleteTasksCount, setIncompleteTasksCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [poolMood, setPoolMood] = useState<{ state: string; score: number; activeUsers: number }>({
    state: 'neutral',
    score: 50,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIncompleteTasksCount(tasks.filter(t => !t.isCompleted).length);
  }, [tasks]);

  useEffect(() => {
    setUnreadNotificationsCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('hasSeenBanner');
    if (hasSeenBanner) setShowBanner(false);
    if (isAuthenticated && user?.isActive) setHasActivated(true);
    setIsLoading(false);
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchPoolMood = async () => {
      const { data, error } = await supabase
        .from('pool_mood_state')
        .select('mood_state, mood_score')
        .eq('pool_id', 'default')
        .single();

      if (!error && data) {
        setPoolMood(prev => ({
          ...prev,
          state: data.mood_state,
          score: data.mood_score
        }));
      }
    };

    fetchPoolMood();

    const channel = supabase
      .channel('pool-mood')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pool_mood_state',
          filter: 'pool_id=eq.default'
        },
        (payload) => {
          const newState = payload.new as any;
          setPoolMood(prev => ({
            ...prev,
            state: newState.mood_state,
            score: newState.mood_score
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const updateActiveUsers = async () => {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gt('last_login', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      setPoolMood(prev => ({
        ...prev,
        activeUsers: count || 0
      }));
    };

    updateActiveUsers();
    const interval = setInterval(updateActiveUsers, 60000);
    return () => clearInterval(interval);
  }, [supabase]);

  const handleStartPlaying = () => {
    setShowBanner(false);
    localStorage.setItem('hasSeenBanner', 'true');
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string) => {
    const newUser = await createUser(email);
    if (newUser) {
      setShowEmailModal(false);
      if (!newUser.isActive) {
        setShowWelcomeBonus(true);
      }
    } else {
      setShowEmailModal(false);
    }
  };

  const handleSongClick = async (trackId: string) => {
    if (!isAuthenticated) {
      setShowEmailModal(true);
      return;
    }

    if (!hasActivated) {
      setShowWelcomeBonus(true);
      return;
    }

    await supabase
      .from('user_listening_history')
      .insert({
        user_id: user?.id,
        track_id: trackId,
        listened_at: new Date().toISOString()
      });

    const { data: track } = await supabase
      .from('tracks')
      .select('plays')
      .eq('id', trackId)
      .single();

    if (track) {
      await supabase
        .from('tracks')
        .update({ plays: (track.plays || 0) + 1 })
        .eq('id', trackId);
    }

    const listenTasks = tasks.filter(t => 
      t.type === 'listen' && !t.isCompleted
    );
    
    for (const task of listenTasks) {
      const newProgress = task.progress + 1;
      if (newProgress >= task.target) {
        await supabase
          .from('user_tasks')
          .update({ 
            progress: newProgress,
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', task.id);

        await supabase
          .from('notification')
          .insert({
            user_id: user?.id,
            title: 'Task Complete',
            message: `You completed "${task.title}"! Claim your reward.`,
            create_time: new Date().toISOString(),
            is_read: false
          });
      } else {
        await supabase
          .from('user_tasks')
          .update({ progress: newProgress })
          .eq('id', task.id);
      }
    }

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
          target_id,
          type,
          reward,
          description,
          title
        )
      `)
      .eq('user_id', user?.id);

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
  };

  const handlePlayFeatured = async () => {
    setShowWelcomeBonus(false);
    
    if (user && !hasActivated) {
      const activated = await activateAccount();
      if (activated) {
        setHasActivated(true);
        await handleSongClick(featuredArtist.artistId);
      }
    } else if (user && hasActivated) {
      await handleSongClick(featuredArtist.artistId);
    }
  };

  const handleTaskPlay = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.targetId) {
      await handleSongClick(task.targetId);
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.isCompleted || task.isClaimed) return;

    const reward = task.points;
    
    await supabase
      .from('user_tasks')
      .update({ is_claimed: true })
      .eq('id', taskId);

    await supabase
      .from('wallet_ledger')
      .insert({
        user_id: user?.id,
        amount: reward,
        reason: `Task reward: ${task.title}`,
        create_time: new Date().toISOString()
      });

    await updateUserPoints(reward);

    await supabase
      .from('notification')
      .insert({
        user_id: user?.id,
        title: 'Reward Claimed',
        message: `You earned ${reward} points for completing ${task.title}!`,
        create_time: new Date().toISOString(),
        is_read: false
      });

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isClaimed: true } : t
    ));
  };

  const handleSendMessage = async (message: string) => {
    if (!user?.id) {
      setShowEmailModal(true);
      return;
    }

    await supabase
      .from('message')
      .insert({
        sender_id: user.id,
        content: message,
        stream_mode: 'chat',
        stream_subject: 'global',
        stream_descriptor: 'main',
        stream_label: 'general',
        create_time: new Date().toISOString()
      });
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notification')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (!user?.id) return;

    await supabase
      .from('notification')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse-slow">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-purple-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onTaskClick={() => setIsTaskPanelOpen(true)}
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
        taskCount={incompleteTasksCount}
        notificationCount={unreadNotificationsCount}
        points={points}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <TaskPanel
        isOpen={isTaskPanelOpen}
        onClose={() => setIsTaskPanelOpen(false)}
        tasks={tasks}
        streak={streak}
        onTaskPlay={handleTaskPlay}
        onTaskClaim={handleTaskClaim}
      />

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      <MobileNav
        activeTab={activeTab}
        taskCount={incompleteTasksCount}
        notificationCount={unreadNotificationsCount}
        points={points}
        onTabChange={setActiveTab}
      />

      <main className="pt-16 sm:pt-20 pb-8">
        <Container>
          <div className="space-y-8">
            <HeroSection
              artistName={featuredArtist.artistName}
              songTitle={featuredArtist.songTitle}
              albumArt={featuredArtist.albumArt || ''}
              playCount={featuredArtist.playCount}
              onPlay={handlePlayFeatured}
              hasWelcomeBonus={isAuthenticated && !hasActivated}
            />

            {trendingArtists.length > 0 && (
              <div>
                <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>Trending Artists</h2>
                <TrendingArtists 
                  artists={trendingArtists} 
                  onArtistClick={(id) => console.log('Artist clicked', id)} 
                />
              </div>
            )}

            {tracks.length > 0 && (
              <SongList 
                tracks={tracks} 
                onTrackClick={handleSongClick} 
                title="Featured Songs" 
              />
            )}

            <div>
              <ChatHeader
                poolName="Main Chat"
                moodState={poolMood.state}
                moodScore={poolMood.score}
                activeUsers={poolMood.activeUsers}
                isCollapsed={isChatCollapsed}
                onToggle={() => setIsChatCollapsed(!isChatCollapsed)}
              />
              {!isChatCollapsed && (
                <Card className="rounded-t-none" padding="none">
                  <ChatList 
                    messages={chatMessages} 
                    currentUserId={user?.username || user?.email?.split('@')[0] || ''} 
                  />
                  <ChatInput onSendMessage={handleSendMessage} />
                </Card>
              )}
            </div>
          </div>
        </Container>
      </main>

      <BannerModal 
        isOpen={showBanner} 
        onClose={() => setShowBanner(false)} 
        onStart={handleStartPlaying} 
      />
      
      <EmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        onSubmit={handleEmailSubmit} 
      />
      
      <WelcomeBonusModal 
        isOpen={showWelcomeBonus} 
        onClose={() => setShowWelcomeBonus(false)} 
        onPlayFeatured={handlePlayFeatured} 
      />
    </div>
  );
}
