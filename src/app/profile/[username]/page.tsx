// src/app/profile/[username]/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { BadgeCollection, Badge } from '@/components/profile/BadgeCollection';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const params = useParams();
  const { theme } = useTheme();
  const { user, setIsSidebarOpen, setIsTaskPanelOpen, setIsNotificationPanelOpen } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpenState] = useState(false);
  const username = params.username as string;
  const isOwnProfile = user?.email?.split('@')[0] === username;

  const badges: Badge[] = [
    { id: '1', name: 'Welcome Pioneer', description: 'Played featured artist for first time', icon: '🎉', earnedAt: new Date() },
    { id: '2', name: 'Week Warrior', description: 'Maintained 7 day streak', icon: '🔥' },
    { id: '3', name: 'Task Master', description: 'Completed 50 tasks', icon: '✅' },
    { id: '4', name: 'Genre Explorer', description: 'Played 5 different genres', icon: '🎧' }
  ];

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header
        onMenuClick={() => setIsSidebarOpenState(true)}
        onTaskClick={() => setIsTaskPanelOpen(true)}
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpenState(false)} />
      <MobileNav activeTab="profile" />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-6">
            <ProfileHeader
              username={username}
              email={isOwnProfile ? user?.email : undefined}
              points={user?.points || 1250}
              streak={user?.streak || 7}
              tier={user?.tier || 'T3'}
              joinedDate="January 15, 2024"
              isOwnProfile={isOwnProfile}
            />
            <BadgeCollection badges={badges} />
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Completed "Play Featured Artist"</span>
                  <span className="text-amber-400">+150 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">7 day streak milestone</span>
                  <span className="text-amber-400">+100 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Listened to 10 tracks</span>
                  <span className="text-amber-400">+50 pts</span>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}