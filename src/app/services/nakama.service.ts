// services/nakama.service.ts
import { Client, Session } from '@heroiclabs/nakama-js';

class NakamaService {
  private client: Client;
  private session: Session | null = null;
  private static instance: NakamaService;
  private useProxy: boolean = false; // Set to false since CORS might be working

  private constructor() {
    const host = 'nakama-mmpb.onrender.com';
    const port = 443;
    const ssl = true;
    const serverKey = 'defaultkey';
    
    console.log('🔧 Creating Nakama client with:', { host, port, ssl });
    // The Client constructor expects (serverKey, host, port, ssl)
    // port should be a string for the constructor
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
      
      // Try authentication with custom ID
      // The third parameter is create (boolean) - true to create account if it doesn't exist
      this.session = await this.client.authenticateCustom(userId, username || userId, true);
      
      // Store session
      if (typeof window !== 'undefined' && this.session) {
        localStorage.setItem('nakama_session', JSON.stringify({
          token: this.session.token,
          refreshToken: this.session.refreshToken,
          userId: this.session.userId,
          username: this.session.username,
          expiresAt: this.session.expiresAt
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
        '',
        limit
      );
      return result.records;
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async submitScore(leaderboardId: string, score: number, subscore: number = 0) {
    if (!this.session) throw new Error('Not authenticated');
    
    try {
      return await this.client.writeLeaderboardRecord(
        this.session,
        leaderboardId,
        score,
        subscore
      );
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }

  async getUserRank(leaderboardId: string): Promise<{ rank: number; score: number } | null> {
    if (!this.session) throw new error('Not authenticated');
    
    try {
      const result = await this.client.listLeaderboardRecords(
        this.session,
        leaderboardId,
        '',
        1,
        [this.session.userId]
      );
      
      if (result.records && result.records.length > 0) {
        return {
          rank: result.records[0].rank,
          score: result.records[0].score
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
    return result.payload ? JSON.parse(result.payload) : null;
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
