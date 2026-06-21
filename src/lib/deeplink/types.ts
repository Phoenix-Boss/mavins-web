// src/lib/deeplink/types.ts
export interface DeeplinkParams {
  trackId: string;
  userId: string;
  taskId?: string;
  activate?: boolean;
  timestamp: number;
  signature: string;
}

export interface DeeplinkResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface AppInstallCheck {
  isInstalled: boolean;
  downloadUrl: string;
}

export type DeeplinkType = 'play' | 'task' | 'activate' | 'profile' | 'earnings' | 'share';

export interface DeeplinkConfig {
  scheme: string;
  host: string;
  packageName: string;
  downloadUrl: string;
}

// NEW: Share related types
export interface ShareData {
  shareId: string;
  trackId: string;
  userId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  taskId?: string;
  createdAt: string;
  clicks: number;
  lastClick?: string;
}

export interface GenerateShareResponse {
  success: boolean;
  shareUrl: string;
  shareId: string;
  trackId: string;
  title: string;
  artist: string;
  error?: string;
}

export interface ShareTrackRequest {
  trackId: string;
  userId: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  taskId?: string;
}

export interface ShareRedirectData {
  title: string;
  artist: string;
  thumbnail: string;
  trackId: string;
  userId: string;
  deepLink: string;
}