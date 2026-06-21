// src/services/auth/auth.service.ts
import { supabase } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  points: number;
  streak: number;
  tier: string;
  isActive: boolean;
  createdAt: string;
}

class AuthService {
  async createUser(email: string) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, points, streak, tier, is_active, created_at')
        .eq('email', email)
        .single();

      if (existingUser) {
        const { data: sessionData } = await supabase.auth.signInWithPassword({
          email,
          password: this.generatePassword(email),
        });

        return {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            points: existingUser.points || 0,
            streak: existingUser.streak || 0,
            tier: existingUser.tier || 'T4',
            isActive: existingUser.is_active || false,
            createdAt: existingUser.created_at,
          },
          session: sessionData?.session
        };
      }

      const generatedPassword = this.generatePassword(email);
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: generatedPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: { email_confirmed: true }
        }
      });

      if (signUpError) throw signUpError;

      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: email,
          points: 0,
          streak: 0,
          tier: 'T4',
          role: 'listener',
          is_active: false,
          user_type: 'real',
          wallet: { balance: 0 },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        user: {
          id: userData.id,
          email: userData.email,
          points: userData.points || 0,
          streak: userData.streak || 0,
          tier: userData.tier || 'T4',
          isActive: userData.is_active || false,
          createdAt: userData.created_at,
        },
        session: authData.session
      };
    } catch (error) {
      console.error('Auth error:', error);
      return null;
    }
  }

  private generatePassword(email: string): string {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hashStr = Math.abs(hash).toString(36).substring(0, 8);
    return `sw_${hashStr}_${Math.floor(Math.random() * 10000)}`;
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, points, streak, tier, is_active, created_at')
      .eq('id', user.id)
      .single();

    if (error) return null;

    return {
      id: userData.id,
      email: userData.email,
      points: userData.points || 0,
      streak: userData.streak || 0,
      tier: userData.tier || 'T4',
      isActive: userData.is_active || false,
      createdAt: userData.created_at,
    };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async activateAccount(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId);
    if (error) return false;
    return true;
  }

  async updatePoints(userId: string, points: number): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ points })
      .eq('id', userId);
    if (error) return false;
    return true;
  }

  async updateStreak(userId: string, streak: number): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ streak })
      .eq('id', userId);
    if (error) return false;
    return true;
  }
}

export const authService = new AuthService();
