// src/services/nakama/nakama.service.ts
import {
  Client,
  Session,
  Socket,
  Channel,
  ChannelMessage,
  ChannelPresenceEvent,
  Presence,
} from '@heroiclabs/nakama-js';
import type {
  NakamaMessage,
  NakamaChannel,
  NakamaPresence,
  SendMessageParams,
  TypingEvent,
  PoolConfig,
} from '@/lib/nakama/types';

// Nakama channel type enum (socket.d.ts): 1 = Room, 2 = Direct Message, 3 = Group.
// Pools are always treated as rooms here since PoolConfig has no DM/group notion.
const CHANNEL_TYPE_ROOM = 1;

// socket.d.ts's writeChatMessage(channel_id, content) has no client-settable `code`
// param — code is server-assigned, not something we can use to mark a message as a
// typing ping. So typing pings are tagged with a `kind` field inside the (untyped,
// `any`) wire payload, and stripped back out before building a NakamaMessage /
// TypingEvent for listeners. Real text messages always carry `kind: 'text'` too, so
// the discriminator is unambiguous on receipt.
const MESSAGE_KIND_TEXT = 'text';
const MESSAGE_KIND_TYPING = 'typing';

interface NakamaPresenceEvent {
  channelId: string;
  joins: NakamaPresence[];
  leaves: NakamaPresence[];
}

type MessageListener = (message: NakamaMessage) => void;
type PresenceListener = (event: NakamaPresenceEvent) => void;
type TypingListener = (event: TypingEvent) => void;
type Unsubscribe = () => void;

function toNakamaPresence(p: Presence, status?: string): NakamaPresence {
  return {
    userId: p.user_id,
    sessionId: p.session_id,
    username: p.username,
    status,
  };
}

class NakamaService {
  private client: Client;
  private session: Session | null = null;
  private socket: Socket | null = null;
  private currentChannelId: string | null = null;
  private currentChannel: NakamaChannel | null = null;
  private static instance: NakamaService;

  private messageListeners = new Set<MessageListener>();
  private presenceListeners = new Set<PresenceListener>();
  private typingListeners = new Set<TypingListener>();

  private constructor() {
    const host = 'nakama-mmpb.onrender.com';
    const port = 443;
    const ssl = true;
    const serverKey = 'defaultkey';

    console.log('🔧 Creating Nakama client with:', { host, port, ssl });
    this.client = new Client(serverKey, host, port.toString(), ssl);
  }

  static getInstance(): NakamaService {
    if (!NakamaService.instance) {
      NakamaService.instance = new NakamaService();
    }
    return NakamaService.instance;
  }

  async authenticate(userId: string, username?: string, appToken?: string): Promise<Session> {
    try {
      console.log('🔐 Authenticating with Nakama...', { userId, username });

      this.session = await this.client.authenticateCustom(
        userId,
        true,
        username || userId,
        appToken ? { appToken } : undefined
      );

      if (typeof window !== 'undefined' && this.session) {
        localStorage.setItem('nakama_session', JSON.stringify({
          token: this.session.token,
          refreshToken: this.session.refresh_token,
          userId: this.session.user_id,
          username: this.session.username,
          expiresAt: this.session.expires_at
        }));
      }

      console.log('✅ Authentication successful!');
      return this.session;

    } catch (error) {
      console.error('❌ Nakama authentication failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate (if there's no session yet) and open the realtime socket.
   * `token` is your app's own auth token (e.g. the 'soundwave-auth-token' value) —
   * it's passed through to authenticateCustom()'s `vars` so the server can verify it
   * in a custom authentication hook. Returns true once the socket is connected.
   */
  async connect(userId: string, token?: string): Promise<boolean> {
    try {
      if (!this.session) {
        await this.authenticate(userId, undefined, token);
      }
      if (!this.session) return false;

      this.socket = this.client.createSocket(true /* useSSL */, false /* verbose */);

      this.socket.onchannelmessage = (msg: ChannelMessage) => this.handleChannelMessage(msg);
      this.socket.onchannelpresence = (evt: ChannelPresenceEvent) => {
        const event: NakamaPresenceEvent = {
          channelId: evt.channel_id,
          joins: evt.joins.map((p) => toNakamaPresence(p, 'online')),
          leaves: evt.leaves.map((p) => toNakamaPresence(p, 'offline')),
        };
        this.presenceListeners.forEach((listener) => listener(event));
      };
      this.socket.ondisconnect = () => {
        console.warn('⚠️ Nakama socket disconnected');
      };

      await this.socket.connect(this.session, true);
      console.log('✅ Nakama realtime socket connected');
      return true;

    } catch (error) {
      console.error('❌ Nakama connect failed:', error);
      this.socket = null;
      return false;
    }
  }

  /**
   * Joins (or creates) a chat room for the given pool.
   *
   * ASSUMPTION: PoolConfig carries region/tier/role/poolId rather than a raw Nakama
   * `target` string, so the room name is derived as `pool:{region}:{tier}:{role}:{poolId}`.
   * This needs to match whatever naming convention your server-side module/matchmaker
   * actually uses — adjust this line if your backend names rooms differently.
   */
  async joinPool(poolConfig: PoolConfig): Promise<string> {
    if (!this.socket) throw new Error('Socket not connected — call connect() first');

    const target = `pool:${poolConfig.region}:${poolConfig.tier}:${poolConfig.role}:${poolConfig.poolId}`;

    const channel: Channel = await this.socket.joinChat(
      target,
      CHANNEL_TYPE_ROOM,
      true,  // persistence
      false  // hidden
    );

    this.currentChannelId = channel.id;
    this.currentChannel = {
      id: channel.id,
      name: target,
      room: target,
      presence: (channel.presences ?? []).map((p) => toNakamaPresence(p, 'online')),
    };

    return channel.id;
  }

  getCurrentChannel(): NakamaChannel | null {
    return this.currentChannel;
  }

  async sendMessage(params: SendMessageParams): Promise<NakamaMessage> {
    if (!this.socket) throw new Error('Socket not connected');

    const ack = await this.socket.writeChatMessage(params.channelId, {
      kind: MESSAGE_KIND_TEXT,
      text: params.content,
      mentions: params.mentions ?? [],
    });

    return {
      channelId: ack.channel_id,
      messageId: ack.message_id,
      code: ack.code,
      senderId: this.session?.user_id ?? '',
      username: ack.username,
      content: {
        text: params.content,
        mentions: params.mentions ?? [],
      },
      createTime: ack.create_time,
      updateTime: ack.update_time,
      persistent: ack.persistence,
    };
  }

  /** Sends a non-persistent, tagged chat message standing in for a typing indicator. */
  sendTypingIndicator(isTyping: boolean): void {
    if (!this.socket || !this.currentChannelId) return;

    this.socket
      .writeChatMessage(this.currentChannelId, { kind: MESSAGE_KIND_TYPING, isTyping })
      .catch((error) => console.warn('Failed to send typing indicator:', error));
  }

  // NOTE: nakama-js's package root re-exports the *REST-history* ChannelMessage type
  // (client.d.ts, all fields optional) rather than the realtime-socket one
  // (socket.d.ts, all fields guaranteed) due to a duplicate-export collision in the
  // package's own index.d.ts. The server always populates these fields on a live
  // socket event, but we default defensively since the type doesn't promise it.
  private handleChannelMessage(msg: ChannelMessage): void {
    const content = (msg.content ?? {}) as Record<string, any>;

    if (content.kind === MESSAGE_KIND_TYPING) {
      const event: TypingEvent = {
        channelId: msg.channel_id ?? '',
        userId: msg.sender_id ?? '',
        username: msg.username ?? '',
        isTyping: !!content.isTyping,
      };
      this.typingListeners.forEach((listener) => listener(event));
      return;
    }

    const message: NakamaMessage = {
      channelId: msg.channel_id ?? '',
      messageId: msg.message_id ?? '',
      code: msg.code ?? 0,
      senderId: msg.sender_id ?? '',
      username: msg.username ?? '',
      content: {
        text: content.text,
        mentions: content.mentions ?? [],
      },
      createTime: msg.create_time ?? '',
      updateTime: msg.update_time ?? msg.create_time ?? '',
      persistent: msg.persistent ?? true,
    };
    this.messageListeners.forEach((listener) => listener(message));
  }

  onMessage(listener: MessageListener): Unsubscribe {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onPresence(listener: PresenceListener): Unsubscribe {
    this.presenceListeners.add(listener);
    return () => this.presenceListeners.delete(listener);
  }

  onTyping(listener: TypingListener): Unsubscribe {
    this.typingListeners.add(listener);
    return () => this.typingListeners.delete(listener);
  }

  /**
   * Submit a score to a leaderboard.
   *
   * Client.writeLeaderboardRecord(session, leaderboardId, request: WriteLeaderboardRecord)
   * where WriteLeaderboardRecord = { score?: string; subscore?: string; metadata?: object }
   *
   * - score/subscore must be passed as strings (client converts back to number on read).
   * - metadata is a plain object, NOT a JSON string — the client stringifies it internally
   *   before sending to the server, and parses it back automatically when reading records.
   */
  async getLeaderboard(leaderboardId: string, limit: number = 10) {
    if (!this.session) throw new Error('Not authenticated');

    try {
      const result = await this.client.listLeaderboardRecords(
        this.session,
        leaderboardId,
        [],   // ownerIds - empty array for all records
        limit,
        ''    // cursor - empty string for first page
      );
      return result.records || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async submitScore(
    leaderboardId: string,
    score: number,
    subscore: number = 0,
    metadata?: Record<string, any>
  ) {
    if (!this.session) throw new Error('Not authenticated');

    try {
      return await this.client.writeLeaderboardRecord(
        this.session,
        leaderboardId,
        {
          score: score.toString(),
          subscore: subscore.toString(),
          metadata: metadata,
        }
      );
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }

  async getUserRank(leaderboardId: string): Promise<{ rank: number; score: number } | null> {
    if (!this.session) throw new Error('Not authenticated');

    try {
      const result = await this.client.listLeaderboardRecords(
        this.session,
        leaderboardId,
        [this.session.user_id],  // ownerIds as string array
        1,
        ''
      );

      if (result.records && result.records.length > 0) {
        // Note: at the Client level (not the raw NakamaApi level), rank/score
        // are already typed and returned as numbers, not strings.
        return {
          rank: result.records[0].rank ?? 0,
          score: result.records[0].score ?? 0
        };
      }
      return null;
    } catch (error) {
      console.warn('Failed to get user rank:', error);
      return null;
    }
  }

  async rpcCall(funcName: string, payload: any) {
    if (!this.session) throw new Error('Not authenticated');

    const payloadJson = JSON.stringify(payload);
    const result = await this.client.rpc(this.session, funcName, payloadJson);
    return result.payload ?? null;
  }

  getSession(): Session | null {
    if (this.session) return this.session;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nakama_session');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.session = Session.restore(data.token, data.refreshToken);
          return this.session;
        } catch (e) {
          console.error('Failed to restore session:', e);
        }
      }
    }
    return null;
  }

  async disconnect() {
    if (this.socket) {
      this.socket.disconnect(true);
      this.socket = null;
    }
    this.currentChannelId = null;
    this.currentChannel = null;
    this.session = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nakama_session');
    }
  }
}

export const nakamaService = NakamaService.getInstance();
