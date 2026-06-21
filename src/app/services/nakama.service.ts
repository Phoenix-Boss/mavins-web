// services/nakama.service.ts
import { Client, Session } from '@heroiclabs/nakama-js';

class NakamaService {
  private client: Client;
  private session: Session | null = null;
  private static instance: NakamaService;

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

  async authenticate(userId: string, username?: string): Promise<Session> {
    try {
      console.log('🔐 Authenticating with Nakama...', { userId, username });

      this.session = await this.client.authenticateCustom(
        userId,
        true,
        username || userId
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
    const session = this.session;

    if (!session.user_id) throw new Error('Session is missing user_id');

    try {
      const result = await this.client.listLeaderboardRecords(
        session,
        leaderboardId,
        [session.user_id],  // ownerIds as string array
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
    this.session = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nakama_session');
    }
  }
}

export const nakamaService = NakamaService.getInstance();
