// src/services/nakama/nakama.service.ts
import { getNakamaClient, setNakamaSession, getNakamaSession, disconnectNakama, createSocket } from '@/lib/nakama/client';
import type { NakamaMessage, SendMessageParams, TypingEvent, PoolConfig } from '@/lib/nakama/types';
import { supabase } from '@/lib/supabase/client';

type MessageHandler = (message: NakamaMessage) => void;
type PresenceHandler = (presences: any[]) => void;
type TypingHandler = (event: TypingEvent) => void;

class NakamaService {
  private socket: any = null;
  private currentChannelId: string | null = null;
  private messageHandlers: MessageHandler[] = [];
  private presenceHandlers: PresenceHandler[] = [];
  private typingHandlers: TypingHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  async connect(userId: string, token: string): Promise<boolean> {
    try {
      await import('@heroiclabs/nakama-js');
      await setNakamaSession(token as any);
      this.socket = await createSocket();
      this.setupSocketHandlers();
      this.reconnectAttempts = 0;
      return true;
    } catch (error) {
      console.error('Nakama connection error:', error);
      this.scheduleReconnect(userId, token);
      return false;
    }
  }

  private scheduleReconnect(userId: string, token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect(userId, token);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private setupSocketHandlers() {
    if (!this.socket) return;

    this.socket.onmessage = (event: any) => {
      const message = event.data;
      if (message && message.channel_message) {
        this.messageHandlers.forEach(handler => handler(message.channel_message));
      }
      if (message && message.channel_presence_event) {
        this.presenceHandlers.forEach(handler => handler(message.channel_presence_event.joins || []));
      }
    };
  }

  async joinPool(poolConfig: PoolConfig): Promise<string> {
    if (!this.socket) throw new Error('Socket not connected');
    const channelId = `${poolConfig.region}_${poolConfig.tier}_${poolConfig.role}`;
    
    if (this.currentChannelId) {
      await this.socket.leave_channel(this.currentChannelId);
    }
    
    const channel = await this.socket.join_channel(channelId, 'room', { persistent: true });
    this.currentChannelId = channel.id;
    
    await this.sendSystemMessage('joined', `${poolConfig.region} â€¢ ${poolConfig.tier} pool`);
    
    return channel.id;
  }

  async leavePool(): Promise<void> {
    if (this.socket && this.currentChannelId) {
      await this.socket.leave_channel(this.currentChannelId);
      this.currentChannelId = null;
    }
  }

  async sendMessage(params: SendMessageParams): Promise<NakamaMessage | null> {
    if (!this.socket || !this.currentChannelId) return null;
    
    try {
      const result = await this.socket.write_chat_message(this.currentChannelId, {
        text: params.content,
        mentions: params.mentions || []
      });
      return result;
    } catch (error) {
      console.error('Send message error:', error);
      return null;
    }
  }

  async sendSystemMessage(type: string, content: string): Promise<void> {
    if (!this.socket || !this.currentChannelId) return;
    await this.socket.write_chat_message(this.currentChannelId, {
      text: `[System] ${content}`,
    });
  }

  async sendTypingIndicator(isTyping: boolean): Promise<void> {
    if (!this.socket || !this.currentChannelId) return;
    await this.socket.channel_message_send(this.currentChannelId, {
      typing: isTyping
    });
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onPresence(handler: PresenceHandler): () => void {
    this.presenceHandlers.push(handler);
    return () => {
      this.presenceHandlers = this.presenceHandlers.filter(h => h !== handler);
    };
  }

  onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
    };
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.socket.disconnect();
      this.socket = null;
    }
    this.currentChannelId = null;
    disconnectNakama();
  }

  isConnected(): boolean {
    return !!this.socket && !!this.currentChannelId;
  }

  getCurrentChannelId(): string | null {
    return this.currentChannelId;
  }
}

export const nakamaService = new NakamaService();
