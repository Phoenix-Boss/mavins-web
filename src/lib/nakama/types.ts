// src/lib/nakama/types.ts
export interface NakamaMessage {
  channelId: string;
  messageId: string;
  code: number;
  senderId: string;
  username: string;
  content: {
    text?: string;
    mentions?: string[];
  };
  createTime: string;
  updateTime: string;
  persistent: boolean;
}

export interface NakamaChannel {
  id: string;
  name: string;
  description?: string;
  room?: string;
  groupId?: string;
  userIdOne?: string;
  userIdTwo?: string;
  presence?: NakamaPresence[];
}

export interface NakamaPresence {
  userId: string;
  sessionId: string;
  username: string;
  status?: string;
}

export interface SendMessageParams {
  channelId: string;
  content: string;
  mentions?: string[];
}

export interface TypingEvent {
  channelId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface PoolConfig {
  region: string;
  tier: string;
  role: string;
  poolId: string;
}
