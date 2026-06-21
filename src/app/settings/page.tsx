// src/app/settings/page.tsx
'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { theme } = useTheme();
  const {
    user,
    tasks,
    notifications,
    points,
    setIsSidebarOpen,
    setIsTaskPanelOpen,
    setIsNotificationPanelOpen,
  } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpenState] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'appearance'>('appearance');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const incompleteTasksCount = tasks.filter(t => !t.isCompleted).length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn('min-h-screen pb-16 md:pb-0', theme.bg)}>
      <Header
        onMenuClick={() => setIsSidebarOpenState(true)}
        onTaskClick={() => setIsTaskPanelOpen(true)}
        onNotificationClick={() => setIsNotificationPanelOpen(true)}
        taskCount={incompleteTasksCount}
        notificationCount={unreadNotificationsCount}
        points={points}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpenState(false)} />
      <MobileNav activeTab="settings" />

      <main className="pt-24 pb-8">
        <Container>
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className={cn('text-sm mt-1', theme.textSecondary)}>Manage your preferences</p>
            </div>
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'appearance' && <AppearanceSettings />}

            {activeTab === 'profile' && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-1">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400" />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-1">Display Name</label>
                    <input type="text" placeholder="Your display name" className="w-full px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-1">Bio</label>
                    <textarea rows={3} placeholder="Tell us about yourself" className="w-full px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-amber-500 focus:outline-none"></textarea>
                  </div>
                  <Button variant="primary">Save Changes</Button>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-neutral-400">Receive updates via email</p>
                    </div>
                    <button onClick={() => setEmailNotifications(!emailNotifications)} className={cn('w-12 h-6 rounded-full transition-colors relative', emailNotifications ? 'bg-amber-500' : 'bg-neutral-700')}>
                      <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', emailNotifications ? 'translate-x-7' : 'translate-x-1')} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-neutral-400">Get notified about tasks and activity</p>
                    </div>
                    <button onClick={() => setPushNotifications(!pushNotifications)} className={cn('w-12 h-6 rounded-full transition-colors relative', pushNotifications ? 'bg-amber-500' : 'bg-neutral-700')}>
                      <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', pushNotifications ? 'translate-x-7' : 'translate-x-1')} />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4 text-red-500">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-neutral-400">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
