// src/lib/dummy-data.ts
// Centralized dummy data for all pages

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  audioUrl: string;
  plays: string;
  liked: boolean;
  earnings?: number;
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  role: 'listener' | 'curator' | 'artist' | 'admin';
  balance: number;
  streak: number;
  totalEarned: number;
  isLoggedIn?: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  progress: number;
  max: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'streak';
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'earning' | 'promotion' | 'system' | 'social';
  read: boolean;
  timestamp: string;
  icon: string;
}

export interface Promotion {
  id: number;
  trackId: number;
  trackTitle: string;
  artist: string;
  budget: number;
  targetPlaylists: number;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  submittedAt: string;
  genre: string;
}

export interface CuratorRequest {
  id: number;
  track: Track;
  artist: string;
  budget: number;
  message: string;
  submittedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Campaign {
  id: number;
  name: string;
  artist: string;
  budget: number;
  spent: number;
  tracks: number;
  playlists: number;
  spins: string;
  status: 'active' | 'paused' | 'completed';
}

export interface Artist {
  id: number;
  name: string;
  followers: string;
  avatar: string;
}

export interface Playlist {
  id: number;
  name: string;
  tracks: number;
  cover: string;
}

// ============ USER DATA ============
export const currentUser: User = {
  id: 1,
  name: 'Peter Bulus',
  avatar: 'https://picsum.photos/seed/user1/100/100',
  role: 'curator',
  balance: 2847,
  streak: 12,
  totalEarned: 18420,
  isLoggedIn: false,
};

// ============ TRACKS ============
export const dummyTracks: Track[] = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Wave", album: "Nocturnal", duration: "3:45", cover: "https://picsum.photos/seed/1/200/200", audioUrl: "#", plays: "1.2M", liked: true, earnings: 45 },
  { id: 2, title: "Electric Soul", artist: "Neon Pulse", album: "Voltage", duration: "4:12", cover: "https://picsum.photos/seed/2/200/200", audioUrl: "#", plays: "890K", liked: false, earnings: 32 },
  { id: 3, title: "Golden Hour", artist: "Aurora Sky", album: "Sunset Sessions", duration: "3:28", cover: "https://picsum.photos/seed/3/200/200", audioUrl: "#", plays: "2.4M", liked: true, earnings: 78 },
  { id: 4, title: "Urban Echo", artist: "City Beats", album: "Metropolitan", duration: "4:01", cover: "https://picsum.photos/seed/4/200/200", audioUrl: "#", plays: "567K", liked: false, earnings: 21 },
  { id: 5, title: "Stellar Voyage", artist: "Cosmic Drift", album: "Nebula", duration: "5:17", cover: "https://picsum.photos/seed/5/200/200", audioUrl: "#", plays: "1.8M", liked: true, earnings: 65 },
  { id: 6, title: "Velvet Rain", artist: "Silk Sound", album: "Smooth Waves", duration: "3:55", cover: "https://picsum.photos/seed/6/200/200", audioUrl: "#", plays: "743K", liked: false, earnings: 28 },
];

// ============ FEATURED SONGS ============
export const featuredSongs = [
  { id: 1, title: "Midnight Dreams", artist: "Luna Wave", cover: "https://picsum.photos/seed/1/200/200", plays: "1.2M" },
  { id: 2, title: "Electric Soul", artist: "Neon Pulse", cover: "https://picsum.photos/seed/2/200/200", plays: "890K" },
  { id: 3, title: "Golden Hour", artist: "Aurora Sky", cover: "https://picsum.photos/seed/3/200/200", plays: "2.4M" },
  { id: 4, title: "Urban Echo", artist: "City Beats", cover: "https://picsum.photos/seed/4/200/200", plays: "567K" },
  { id: 5, title: "Stellar Voyage", artist: "Cosmic Drift", cover: "https://picsum.photos/seed/5/200/200", plays: "1.8M" },
  { id: 6, title: "Velvet Rain", artist: "Silk Sound", cover: "https://picsum.photos/seed/6/200/200", plays: "743K" },
];

// ============ DAILY TASKS ============
export const dailyTasks: Task[] = [
  { id: 1, title: "Daily Check-in", description: "Log in to claim bonus", reward: 10, progress: 1, max: 1, completed: true, type: 'daily' },
  { id: 2, title: "Listen to 10 Tracks", description: "Stream full songs to earn", reward: 50, progress: 7, max: 10, completed: false, type: 'daily' },
  { id: 3, title: "Share a Track", description: "Share on social media", reward: 25, progress: 0, max: 1, completed: false, type: 'daily' },
  { id: 4, title: "Weekly Streak", description: "Listen 5 days this week", reward: 100, progress: 4, max: 5, completed: false, type: 'weekly' },
  { id: 5, title: "Curator Review", description: "Review 3 submitted tracks", reward: 75, progress: 1, max: 3, completed: false, type: 'weekly' },
];

// ============ NOTIFICATIONS ============
export const notifications: Notification[] = [
  { id: 1, title: "🎉 Reward Earned!", message: "You earned 45 points for listening to 'Midnight Dreams'", type: 'earning', read: false, timestamp: '2 min ago', icon: '💰' },
  { id: 2, title: "📈 Track Promoted", message: "Your track 'Electric Soul' was added to 3 playlists", type: 'promotion', read: false, timestamp: '1 hour ago', icon: '🚀' },
  { id: 3, title: "🔥 Streak Bonus", message: "12-day streak! Claim your 100-point bonus", type: 'earning', read: true, timestamp: '3 hours ago', icon: '⚡' },
  { id: 4, title: "👥 New Follower", message: "Aurora Sky started following you", type: 'social', read: true, timestamp: 'Yesterday', icon: '❤️' },
  { id: 5, title: "💸 Payout Processed", message: "Your withdrawal of 500 points was approved", type: 'system', read: true, timestamp: '2 days ago', icon: '✅' },
];

// ============ PROMOTIONS ============
export const userPromotions: Promotion[] = [
  { id: 1, trackId: 2, trackTitle: "Electric Soul", artist: "Neon Pulse", budget: 500, targetPlaylists: 50, status: 'active', submittedAt: '2024-01-15', genre: 'Electronic' },
  { id: 2, trackId: 4, trackTitle: "Urban Echo", artist: "City Beats", budget: 250, targetPlaylists: 25, status: 'pending', submittedAt: '2024-01-18', genre: 'Hip-Hop' },
  { id: 3, trackId: 6, trackTitle: "Velvet Rain", artist: "Silk Sound", budget: 1000, targetPlaylists: 100, status: 'completed', submittedAt: '2024-01-10', genre: 'R&B' },
];

// ============ CURATOR REQUESTS ============
export const curatorRequests: CuratorRequest[] = [
  { id: 1, track: dummyTracks[1], artist: "Neon Pulse", budget: 50, message: "Perfect for your Electronic playlist!", submittedAt: '2024-01-18', status: 'pending' },
  { id: 2, track: dummyTracks[3], artist: "City Beats", budget: 30, message: "Great vibes for late night mixes", submittedAt: '2024-01-17', status: 'pending' },
  { id: 3, track: dummyTracks[5], artist: "Silk Sound", budget: 75, message: "Smooth track for chill playlists", submittedAt: '2024-01-16', status: 'accepted' },
];

// ============ TRENDING ARTISTS ============
export const trendingArtists: Artist[] = [
  { id: 1, name: "Luna Wave", followers: "2.1M", avatar: "https://picsum.photos/seed/a1/100/100" },
  { id: 2, name: "Neon Pulse", followers: "1.8M", avatar: "https://picsum.photos/seed/a2/100/100" },
  { id: 3, name: "Aurora Sky", followers: "3.4M", avatar: "https://picsum.photos/seed/a3/100/100" },
  { id: 4, name: "City Beats", followers: "987K", avatar: "https://picsum.photos/seed/a4/100/100" },
];

// ============ DUMMY PLAYLISTS ============
export const dummyPlaylists: Playlist[] = [
  { id: 1, name: "Chill Vibes", tracks: 24, cover: "https://picsum.photos/seed/p1/200/200" },
  { id: 2, name: "Workout Energy", tracks: 18, cover: "https://picsum.photos/seed/p2/200/200" },
  { id: 3, name: "Late Night Jazz", tracks: 32, cover: "https://picsum.photos/seed/p3/200/200" },
  { id: 4, name: "Focus Flow", tracks: 41, cover: "https://picsum.photos/seed/p4/200/200" },
];

// ============ LEADERBOARD ============
export const leaderboard = [
  { rank: 1, user: "Luna Wave", avatar: "https://picsum.photos/seed/l1/50/50", earned: 12450, role: 'artist' as const },
  { rank: 2, user: "Peter Bulus", avatar: "https://picsum.photos/seed/user1/50/50", earned: 8920, role: 'listener' as const },
  { rank: 3, user: "CuratorPro", avatar: "https://picsum.photos/seed/l3/50/50", earned: 7340, role: 'curator' as const },
  { rank: 4, user: "Neon Pulse", avatar: "https://picsum.photos/seed/l4/50/50", earned: 6180, role: 'artist' as const },
  { rank: 5, user: "MusicLover99", avatar: "https://picsum.photos/seed/l5/50/50", earned: 5420, role: 'listener' as const },
];

// ============ ADMIN CAMPAIGNS ============
export const adminCampaigns: Campaign[] = [
  { id: 1, name: "New Artist Boost", artist: "Various", budget: 5000, spent: 3240, tracks: 12, playlists: 45, spins: "24.5K", status: 'active' as const },
  { id: 2, name: "Weekend Vibes Push", artist: "Aurora Sky", budget: 2000, spent: 2000, tracks: 3, playlists: 28, spins: "18.2K", status: 'completed' as const },
  { id: 3, name: "Hip-Hop Discovery", artist: "City Beats", budget: 3500, spent: 1200, tracks: 8, playlists: 32, spins: "9.8K", status: 'active' as const },
  { id: 4, name: "Chill Sunday", artist: "Silk Sound", budget: 1500, spent: 0, tracks: 5, playlists: 0, spins: "0", status: 'paused' as const },
];

// ============ EARNING RULES ============
export const earningRules = {
  pointsPerMinute: 2,
  pointsPerFullListen: 10,
  dailyCap: 500,
  streakBonus: { 3: 25, 7: 100, 14: 250, 30: 1000 },
  curatorReviewReward: 25,
  referralBonus: 100,
};