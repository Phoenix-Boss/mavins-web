// src/hooks/auth/useAuth.ts
'use client';

import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  username: string;
  points: number;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  streak: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  artistName?: string;
  chartPosition?: number;
}

interface UseAuthReturn {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createUser: (email: string) => Promise<AuthUser | null>;
  activateAccount: () => Promise<boolean>;
  updateUserPoints: (points: number) => Promise<void>;
  updateUserStreak: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const supabase = createClient();
  const { showToast } = useToast();
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string): Promise<AuthUser | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Fetch points from wallet_ledger
    const { data: pointsData } = await supabase
      .from('wallet_ledger')
      .select('amount')
      .eq('user_id', userId)
      .order('create_time', { ascending: false });

    const totalPoints = pointsData?.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) || 0;

    let tier: AuthUser['tier'] = 'bronze';
    if (totalPoints >= 10000) tier = 'platinum';
    else if (totalPoints >= 5000) tier = 'gold';
    else if (totalPoints >= 1000) tier = 'silver';

    const authUser: AuthUser = {
      id: data.id,
      email: data.email,
      username: data.username,
      points: totalPoints,
      isActive: data.is_active || false,
      createdAt: new Date(data.created_at),
      lastLoginAt: new Date(data.last_login || data.created_at),
      streak: data.streak || 0,
      tier,
      artistName: data.artist_name,
      chartPosition: data.chart_position,
    };

    setUserState(authUser);
    return authUser;
  }, [supabase]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user.id);
      }

      setIsLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, newSession: any) => {
      setSession(newSession);
      
      if (newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setUserState(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: email.split('@')[0],
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            username: email.split('@')[0],
            is_active: false,
            streak: 0,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        showToast('Account created! Please check your email to verify.', 'success');
        return { success: true };
      }

      return { success: false, error: 'Failed to create account' };
    } catch (error: any) {
      showToast(error.message || 'Sign up failed', 'error');
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);

        showToast('Welcome back!', 'success');
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      showToast(error.message || 'Sign in failed', 'error');
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showToast('Signed out successfully', 'info');
    } catch (error: any) {
      showToast(error.message || 'Sign out failed', 'error');
    }
  };

  const createUser = async (email: string): Promise<AuthUser | null> => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        const { error: signInError } = await supabase.auth.signInWithOtp({ email });
        if (signInError) throw signInError;
        showToast('Magic link sent to your email!', 'success');
        return null;
      }

      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: {
            username: email.split('@')[0],
          }
        }
      });

      if (signUpError) throw signUpError;

      showToast('Magic link sent! Check your email to activate.', 'success');
      return null;
    } catch (error: any) {
      showToast(error.message || 'Failed to create user', 'error');
      return null;
    }
  };

  const activateAccount = async (): Promise<boolean> => {
    if (!user) {
      showToast('No user found', 'error');
      return false;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserState({ ...user, isActive: true });
      showToast('Account activated! Welcome! ??', 'success');
      await updateUserPoints(500);
      
      return true;
    } catch (error: any) {
      showToast(error.message || 'Activation failed', 'error');
      return false;
    }
  };

  const updateUserPoints = async (newPoints: number): Promise<void> => {
    if (!user) return;

    try {
      const updatedPoints = user.points + newPoints;
      let newTier = user.tier;
      
      if (updatedPoints >= 10000) newTier = 'platinum';
      else if (updatedPoints >= 5000) newTier = 'gold';
      else if (updatedPoints >= 1000) newTier = 'silver';

      const { error: ledgerError } = await supabase
        .from('wallet_ledger')
        .insert({
          user_id: user.id,
          amount: newPoints,
          reason: 'Points update',
          create_time: new Date().toISOString()
        });

      if (ledgerError) throw ledgerError;

      const updatedUser = { ...user, points: updatedPoints, tier: newTier };
      setUserState(updatedUser);
    } catch (error: any) {
      console.error('Failed to update points:', error);
    }
  };

  const updateUserStreak = async (): Promise<void> => {
    if (!user) return;

    try {
      const today = new Date().toDateString();
      const lastLogin = new Date(user.lastLoginAt).toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = user.streak;
      
      if (today === lastLogin) {
        return;
      } else if (lastLogin === yesterday.toDateString()) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          streak: newStreak,
          last_login: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, streak: newStreak, lastLoginAt: new Date() };
      setUserState(updatedUser);
      
      if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
        showToast(`?? ${newStreak} day streak! You're on fire!`, 'success');
      }
    } catch (error: any) {
      console.error('Failed to update streak:', error);
    }
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && user.isActive,
    signUp,
    signIn,
    signOut,
    createUser,
    activateAccount,
    updateUserPoints,
    updateUserStreak,
  };
}

