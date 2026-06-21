// src/lib/deeplink/generator.ts
import crypto from 'crypto';

const SECRET_KEY = process.env.DEEPLINK_SECRET_KEY || 'soundwave-secret-key-2024';
const APP_SCHEME = 'soundwave';
const APP_HOST = 'play';

export interface DeeplinkOptions {
  trackId: string;
  userId: string;
  taskId?: string;
  activate?: boolean;
  duration?: number;
  title?: string;
  artist?: string;
  shareId?: string;
}

export function generateDeeplink(options: DeeplinkOptions): string {
  const timestamp = Date.now();
  const payload = {
    trackId: options.trackId,
    userId: options.userId,
    taskId: options.taskId,
    activate: options.activate || false,
    timestamp: timestamp,
  };
  
  const signature = generateSignature(payload);
  
  let url = `${APP_SCHEME}://${APP_HOST}?track_id=${options.trackId}&user_id=${options.userId}&ts=${timestamp}&sig=${signature}`;
  
  if (options.taskId) {
    url += `&task_id=${options.taskId}`;
  }
  
  if (options.activate) {
    url += `&activate=true`;
  }
  
  if (options.duration) {
    url += `&duration=${options.duration}`;
  }
  
  if (options.title) {
    url += `&title=${encodeURIComponent(options.title)}`;
  }
  
  if (options.artist) {
    url += `&artist=${encodeURIComponent(options.artist)}`;
  }
  
  if (options.shareId) {
    url += `&share_id=${options.shareId}`;
  }
  
  return url;
}

function generateSignature(payload: any): string {
  const data = JSON.stringify(payload);
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex').substring(0, 16);
}

export function validateSignature(params: DeeplinkParams): boolean {
  const { trackId, userId, taskId, activate, timestamp, signature } = params;
  const payload = {
    trackId,
    userId,
    taskId,
    activate: activate || false,
    timestamp,
  };
  const expectedSignature = generateSignature(payload);
  return signature === expectedSignature;
}

export function generatePlayDeeplink(trackId: string, userId: string, taskId?: string): string {
  return generateDeeplink({ trackId, userId, taskId });
}

export function generateActivateDeeplink(userId: string): string {
  return generateDeeplink({ trackId: 'featured', userId, activate: true });
}

export function generateTaskDeeplink(taskId: string, trackId: string, userId: string): string {
  return generateDeeplink({ trackId, userId, taskId });
}

// NEW: Generate share deeplink with web fallback
export function generateShareDeeplink(options: {
  trackId: string;
  userId: string;
  title: string;
  artist?: string;
  taskId?: string;
}): { deeplink: string; shareUrl: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
  
  // Generate a short share ID
  const shareId = generateShareId(options.trackId, options.userId);
  
  // Generate the deeplink
  const deeplink = generateDeeplink({
    trackId: options.trackId,
    userId: options.userId,
    taskId: options.taskId,
    title: options.title,
    artist: options.artist,
    shareId,
  });
  
  return {
    deeplink,
    shareUrl: `${baseUrl}/share/${shareId}`,
  };
}

function generateShareId(trackId: string, userId: string): string {
  const combined = `${trackId.slice(0, 6)}${userId.slice(0, 4)}`;
  const timestamp = Date.now().toString(36);
  return `${combined}${timestamp.slice(-4)}`.toLowerCase();
}