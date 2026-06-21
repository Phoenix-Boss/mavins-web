// src/hooks/useDemoData.ts
'use client';

import { useState } from 'react';
import type { Notification } from '@/components/notifications/NotificationItem';
import type { ChatMessage } from '@/components/chat/ChatMessage';

export interface DemoArtist {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  isTrending?: boolean;
}

export interface DemoTrack {
  id: string;
  title: string;
  albumArt: string;
  isTask?: boolean;
}

export interface DemoTask {
  id: string;
  title: string;
  description?: string;
  points: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed?: boolean;
}

const INITIAL_ARTISTS: DemoArtist[] = [
  { id: '1', name: 'MayaBeats',     avatar: 'https://picsum.photos/id/64/100/100',  followers: 2847, isTrending: true },
  { id: '2', name: 'DJShadow',      avatar: 'https://picsum.photos/id/15/100/100',  followers: 2156, isTrending: true },
  { id: '3', name: 'GaryTheGrump',  avatar: 'https://picsum.photos/id/26/100/100',  followers: 1892 },
  { id: '4', name: 'EleanorWright', avatar: 'https://picsum.photos/id/29/100/100',  followers: 1567 },
  { id: '5', name: 'RicoSilva',     avatar: 'https://picsum.photos/id/30/100/100',  followers: 1234 },
];

const INITIAL_TRACKS: DemoTrack[] = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  title: [
    'Blinding Lights', 'Midnight Dreams', 'Neon Lights', 'Sunrise Drift',
    'Electric Feel', 'Lost in Space', 'Purple Rain', 'Golden Hour',
    'Midnight City', 'Starboy', 'Shape of You', 'Humble',
    'Gods Plan', 'Bad Guy', 'Old Town Road', 'Senorita',
    'Happier', 'Dance Monkey', 'Someone You Loved', 'Circles',
  ][i],
  albumArt: `https://picsum.photos/id/${101 + i}/200/200`,
  isTask: i === 1,
}));

const INITIAL_TASKS: DemoTask[] = [
  { id: '1', title: 'Play "Midnight Dreams" by Luna Wave', points: 150, progress: 0, target: 1, isCompleted: false },
  { id: '2', title: 'Play any Electronic song',            points: 100, progress: 0, target: 1, isCompleted: false },
  { id: '3', title: 'Listen for 15 minutes total',         points: 200, progress: 0, target: 15, isCompleted: false },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'task_completed', message: 'DJShadow completed "Play Featured Artist" and earned 150 points!', timestamp: new Date(Date.now() - 5 * 60000),   isRead: false },
  { id: '2', type: 'song_played',    message: 'MayaBeats played "Nocturnal" - Total plays: 12,848',               timestamp: new Date(Date.now() - 15 * 60000),  isRead: false },
  { id: '3', type: 'badge_earned',   message: 'EleanorWright unlocked "Week Warrior" badge!',                      timestamp: new Date(Date.now() - 60 * 60000),  isRead: true  },
  { id: '4', type: 'tier_upgrade',   message: 'RicoSilva advanced to T3 tier!',                                    timestamp: new Date(Date.now() - 120 * 60000), isRead: true  },
  { id: '5', type: 'user_joined',    message: 'Alex joined SoundWave and earned Welcome Bonus!',                   timestamp: new Date(Date.now() - 180 * 60000), isRead: false },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', username: 'MayaBeats',   content: "drop at 1:42 is criminal. where's bass supposed to live?",   timestamp: new Date(Date.now() - 2 * 60000),  isSeed: true  },
  { id: '2', username: 'GaryTheGrump', content: "back in '19, we had actual dynamics. this is compressed garbage", timestamp: new Date(Date.now() - 5 * 60000),  isSeed: true  },
  { id: '3', username: 'DJShadow',    content: 'sidechain eating the kick. try headphones.',                  timestamp: new Date(Date.now() - 8 * 60000),  isSeed: true  },
  { id: '4', username: 'System',      content: 'Pool mood: HYPE (score: 87)',                                 timestamp: new Date(Date.now() - 15 * 60000), isSeed: false },
];

export const useDemoData = () => {
  const [featuredArtist] = useState({
    artistName: 'Luna Wave',
    songTitle: 'Nocturnal',
    albumArt: 'https://picsum.photos/id/100/200/200',
    playCount: 12847,
  });

  const [trendingArtists]                   = useState<DemoArtist[]>(INITIAL_ARTISTS);
  const [tracks]                            = useState<DemoTrack[]>(INITIAL_TRACKS);
  const [tasks,          setTasks]          = useState<DemoTask[]>(INITIAL_TASKS);
  const [notifications,  setNotifications]  = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [chatMessages,   setChatMessages]   = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [streak]                            = useState(7);
  const [points]                            = useState(1250);
  const [tier]                              = useState('T3');

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
    tier,
  };
};
