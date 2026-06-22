// src/lib/utils/shareUtils.ts
import { supabase } from '@/lib/supabase/client';

export interface ShareData {
  shareId: string;
  trackId: string;
  userId: string;
  title: string;
  artist: string;
  thumbnail?: string;
  taskId?: string;
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

/**
 * Generate a share URL for a track
 */
export async function generateShareUrl(
  trackId: string,
  userId: string,
  title: string,
  artist?: string,
  thumbnail?: string,
  taskId?: string
): Promise<GenerateShareResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
    
    const response = await fetch(`${baseUrl}/api/share/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackId,
        userId,
        title,
        artist: artist || '',
        thumbnail: thumbnail || '',
        taskId: taskId || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate share URL: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ShareUtils] Error generating share URL:', error);
    return {
      success: false,
      shareUrl: '',
      shareId: '',
      trackId: '',
      title: '',
      artist: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format share text for copying/sharing
 * Returns: "Listen to {title} 🎵" with URL embedded
 */
export function formatShareText(title: string, shareUrl: string): string {
  return `Listen to ${title} 🎵\n\n${shareUrl}`;
}

/**
 * Format share text for social media (without emoji, clean)
 */
export function formatShareTextSocial(title: string, artist: string, shareUrl: string): string {
  return `🎵 ${title}${artist ? ` · ${artist}` : ''}\n\n${shareUrl}`;
}

/**
 * Get the appropriate download URL based on platform
 */
export function getDownloadUrl(userAgent: string): string {
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
  if (isAndroid) {
    return process.env.ANDROID_DOWNLOAD_URL || 'https://github.com/yourusername/mavin-app/releases';
  }
  
  if (isIOS) {
    return process.env.IOS_DOWNLOAD_URL || process.env.GITHUB_RELEASES_URL || 'https://github.com/yourusername/mavin-app/releases';
  }
  
  return process.env.GITHUB_RELEASES_URL || 'https://github.com/yourusername/mavin-app/releases';
}

/**
 * Get platform from user agent
 */
export function getPlatform(userAgent: string): 'android' | 'ios' | 'web' {
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  return 'web';
}

/**
 * Track share click in the database
 */
export async function trackShareClick(shareId: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
    
    const response = await fetch(`${baseUrl}/api/share/track/${shareId}`, {
      method: 'POST',
    });

    return response.ok;
  } catch (error) {
    console.error('[ShareUtils] Error tracking share click:', error);
    return false;
  }
}

/**
 * Resolve a share ID to get track data
 */
export async function resolveShare(shareId: string): Promise<ShareData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
    
    const response = await fetch(`${baseUrl}/api/share/resolve/${shareId}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ShareUtils] Error resolving share:', error);
    return null;
  }
}

/**
 * Validate a share URL format
 */
export function isValidShareUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
    const baseUrlParsed = new URL(baseUrl);
    
    return (
      parsed.hostname === baseUrlParsed.hostname &&
      parsed.pathname.startsWith('/share/') &&
      parsed.pathname.length > 7 // /share/ + at least 1 char
    );
  } catch {
    return false;
  }
}

/**
 * Extract share ID from URL
 */
export function extractShareId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/');
    return pathParts[pathParts.length - 1] || null;
  } catch {
    return null;
  }
}