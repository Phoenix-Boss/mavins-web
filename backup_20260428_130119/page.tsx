// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { HeroSection } from '@/components/home/HeroSection';
import { TrendingArtists } from '@/components/home/TrendingArtists';
import { SongGrid } from '@/components/home/SongGrid';
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
import { useDeeplink } from '@/hooks/deeplink/useDeeplink';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  const { theme } = useTheme();
  const { user, createUser, activateAccount, isAuthenticated } = useAuth();
  const { playTrack } = useDeeplink();
  const {
    isSidebarOpen,
    isTaskPanelOpen,
    isNotificationPanelOpen,
    setIsSidebarOpen,
    setIsTaskPanelOpen,
    setIsNotificationPanelOpen,
  } = useAppStore();

  const {
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
    tier,
  } = useDemoData();

  const [showBanner, setShowBanner] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);

  useEffect(() => {
    const hasSeenBanner = localStorage.getItem('hasSeenBanner');
    if (hasSeenBanner) setShowBanner(false);
    if (isAuthenticated && user?.isActive) setHasActivated(true);
  }, [isAuthenticated, user]);

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
    }
  };

  const handleSongClick = async (trackId: string) => {
    if (!isAuthenticated) {
      setShowEmailModal(true);
    } else if (!hasActivated) {
      setShowWelcomeBonus(true);
    } else {
      await playTrack(trackId);
    }
  };

  const handlePlayFeatured = async () => {
    setShowWelcomeBonus(false);
    if (user && !hasActivated) {
      await activateAccount();
      await playTrack('featured', user.id);
      setHasActivated(true);
    }
  };

  const handleTaskPlay = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.task?.target_id) {
      await playTrack(task.task.target_id, taskId);
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, progress: t.target, isCompleted: true } : t
      ));
    }
  };

  const handleTaskClaim = async (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isClaimed: true } : t
    ));
  };

  const handleSendMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      username: user?.email?.split('@')[0] || 'You',
      content: message,
      timestamp: new Date(),
      isSeed: false,
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const incompleteTasksCount = tasks.filter(t => !t.isCompleted).length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
        onTaskClick={() => setIsTaskPanelOpen(true)}
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
        taskCount={incompleteTasksCount}
        notificationCount={unreadNotificationsCount}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userStats={user ? { points: user.points, streak, tier, username: user.email?.split('@')[0], email: user.email } : undefined}
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
        onMarkAsRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))}
        onMarkAllAsRead={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
      />

      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        taskCount={incompleteTasksCount}
        notificationCount={unreadNotificationsCount}
      />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-8">
            <HeroSection
              artistName={featuredArtist.artistName}
              songTitle={featuredArtist.songTitle}
              albumArt={featuredArtist.albumArt}
              playCount={featuredArtist.playCount}
              onPlay={handlePlayFeatured}
              hasWelcomeBonus={isAuthenticated && !hasActivated}
            />

            <div>
              <h2 className={cn('text-lg font-semibold mb-4', theme.text)}>Trending Artists</h2>
              <TrendingArtists artists={trendingArtists} onArtistClick={(id) => console.log('Artist clicked', id)} />
            </div>

            <SongGrid tracks={tracks} onTrackClick={handleSongClick} title="Featured Songs" />

            <div>
              <ChatHeader
                poolName="Brooklyn Beats â€¢ T3"
                moodState="hype"
                moodScore={87}
                activeUsers={234}
                isCollapsed={isChatCollapsed}
                onToggle={() => setIsChatCollapsed(!isChatCollapsed)}
              />
              {!isChatCollapsed && (
                <Card className="rounded-t-none" padding="none">
                  <ChatList messages={chatMessages} currentUserId={user?.email?.split('@')[0]} />
                  <ChatInput onSendMessage={handleSendMessage} />
                </Card>
              )}
            </div>
          </div>
        </Container>
      </main>

      <BannerModal isOpen={showBanner} onClose={() => setShowBanner(false)} onStart={handleStartPlaying} />
      <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSubmit={handleEmailSubmit} />
      <WelcomeBonusModal isOpen={showWelcomeBonus} onClose={() => setShowWelcomeBonus(false)} onPlayFeatured={handlePlayFeatured} />
    </div>
  );
}
