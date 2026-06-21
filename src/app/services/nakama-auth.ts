// app/services/nakama-auth.ts
interface NakamaSession {
  token: string;
  refreshToken: string;
  userId: string;
  username: string;
  expiresAt: number;
}

interface LeaderboardRecord {
  rank: number;
  score: number;
  ownerId: string;
  username?: string;
  avatarUrl?: string;
}

class NakamaAuthService {
  private session: NakamaSession | null = null;
  private host: string;
  private serverKey: string;

  constructor() {
    this.host = process.env.NEXT_PUBLIC_NAKAMA_HOST || 'nakama-mmpb.onrender.com';
    this.serverKey = process.env.NEXT_PUBLIC_NAKAMA_SERVER_KEY || 'DaNjI20sbHAZBy3h86xCoTfMleidWELw';
  }

  async authenticate(userId: string, username?: string): Promise<NakamaSession> {
    try {
      console.log('🔐 Authenticating with Nakama...', { host: this.host });
      
      const auth = btoa(`${this.serverKey}:`);
      
      const response = await fetch(`https://${this.host}/v2/account/authenticate/custom?create=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          id: userId,
          username: username || userId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
      
      const data = await response.json();
      
      this.session = {
        token: data.token,
        refreshToken: data.refreshToken,
        userId: data.userId || userId,
        username: username || userId,
        expiresAt: Date.now() + (data.ttl || 7200) * 1000
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('nakama_session', JSON.stringify(this.session));
      }
      
      console.log('✅ Authentication successful!');
      return this.session;
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  async createLeaderboard(leaderboardId: string): Promise<boolean> {
    try {
      const auth = btoa(`${this.serverKey}:`);
      
      const response = await fetch(`https://${this.host}/v2/leaderboard/${leaderboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          authoritative: true,
          sort_order: "desc",
          operator: "best",
          reset_schedule: "0 0 * * 0"
        })
      });
      
      if (response.ok || response.status === 409) {
        console.log(`✅ Leaderboard '${leaderboardId}' ready`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create leaderboard:', error);
      return false;
    }
  }

  async ensureLeaderboards(): Promise<void> {
    const leaderboards = [
      'earnings_leaderboard',
      'earnings_leaderboard_week',
      'earnings_leaderboard_month'
    ];
    
    for (const lb of leaderboards) {
      await this.createLeaderboard(lb);
    }
  }

  async submitScore(leaderboardId: string, score: number): Promise<any> {
    if (!this.session) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`https://${this.host}/v2/leaderboard/${leaderboardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.session.token}`
        },
        body: JSON.stringify({ score }),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          await this.createLeaderboard(leaderboardId);
          const retryResponse = await fetch(`https://${this.host}/v2/leaderboard/${leaderboardId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.session.token}`
            },
            body: JSON.stringify({ score }),
          });
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
        throw new Error('Failed to submit score');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }

  async getLeaderboard(leaderboardId: string, limit: number = 50): Promise<LeaderboardRecord[]> {
    if (!this.session) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `https://${this.host}/v2/leaderboard/${leaderboardId}?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${this.session.token}`
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async getUserRank(leaderboardId: string): Promise<{ rank: number; score: number } | null> {
    if (!this.session) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(
        `https://${this.host}/v2/leaderboard/${leaderboardId}?ownerIds=${this.session.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.session.token}`
          }
        }
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.records && data.records.length > 0) {
        return {
          rank: data.records[0].rank,
          score: data.records[0].score
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return null;
    }
  }

  async rpcCall(funcName: string, payload?: any): Promise<any> {
    if (!this.session) throw new Error('Not authenticated');
    
    try {
      const response = await fetch(`https://${this.host}/v2/rpc/${funcName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.session.token}`
        },
        body: payload ? JSON.stringify(payload) : undefined
      });
      
      if (!response.ok) {
        throw new Error('RPC call failed');
      }
      
      const data = await response.json();
      return data.payload ? JSON.parse(data.payload) : data;
    } catch (error) {
      console.error('Failed to call RPC:', error);
      throw error;
    }
  }

  getSession(): NakamaSession | null {
    if (this.session) return this.session;
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nakama_session');
      if (saved) {
        try {
          this.session = JSON.parse(saved);
          if (this.session.expiresAt < Date.now() - 300000) {
            this.session = null;
            localStorage.removeItem('nakama_session');
          }
          return this.session;
        } catch (e) {
          console.error('Failed to restore session:', e);
        }
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && session.expiresAt > Date.now();
  }

  async disconnect(): Promise<void> {
    this.session = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nakama_session');
    }
  }
}

export const nakamaAuth = new NakamaAuthService();