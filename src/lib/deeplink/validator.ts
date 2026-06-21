// src/lib/deeplink/validator.ts
export interface DeeplinkParams {
  track_id: string;
  user_id: string;
  task_id?: string;
  activate?: string;
  ts: string;
  sig: string;
  duration?: string;
  share_id?: string;
  title?: string;
  artist?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: {
    trackId: string;
    userId: string;
    taskId?: string;
    activate: boolean;
    timestamp: number;
    duration?: number;
    shareId?: string;
    title?: string;
    artist?: string;
  };
}

const SECRET_KEY = process.env.DEEPLINK_SECRET_KEY || 'soundwave-secret-key-2024';
const MAX_AGE = 5 * 60 * 1000; // 5 minutes

export function validateDeeplink(params: DeeplinkParams): ValidationResult {
  try {
    const timestamp = parseInt(params.ts);
    
    if (isNaN(timestamp)) {
      return { isValid: false, error: 'Invalid timestamp' };
    }
    
    const now = Date.now();
    if (now - timestamp > MAX_AGE) {
      return { isValid: false, error: 'Link expired' };
    }
    
    const payload = {
      trackId: params.track_id,
      userId: params.user_id,
      taskId: params.task_id,
      activate: params.activate === 'true',
      timestamp: timestamp,
    };
    
    const expectedSignature = generateSignature(payload);
    
    if (params.sig !== expectedSignature) {
      return { isValid: false, error: 'Invalid signature' };
    }
    
    return {
      isValid: true,
      data: {
        trackId: params.track_id,
        userId: params.user_id,
        taskId: params.task_id,
        activate: params.activate === 'true',
        timestamp: timestamp,
        duration: params.duration ? parseInt(params.duration) : undefined,
        shareId: params.share_id,
        title: params.title,
        artist: params.artist,
      },
    };
  } catch (error) {
    return { isValid: false, error: 'Validation failed' };
  }
}

function generateSignature(payload: any): string {
  const data = JSON.stringify(payload);
  const crypto = require('crypto');
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex').substring(0, 16);
}