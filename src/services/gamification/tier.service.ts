// src/services/gamification/tier.service.ts
import { supabase } from '@/lib/supabase/client';

export interface TierConfig {
  name: string;
  minPoints: number;
  maxPoints: number;
  multiplier: number;
  color: string;
}

const TIERS: TierConfig[] = [
  { name: 'T4', minPoints: 0, maxPoints: 499, multiplier: 1.0, color: 'gray' },
  { name: 'T3', minPoints: 500, maxPoints: 1999, multiplier: 1.5, color: 'bronze' },
  { name: 'T2', minPoints: 2000, maxPoints: 9999, multiplier: 2.0, color: 'silver' },
  { name: 'T1', minPoints: 10000, maxPoints: 999999, multiplier: 3.0, color: 'gold' },
];

class TierService {
  async checkAndUpdateTier(userId: string): Promise<string> {
    const { data: user } = await supabase
      .from('users')
      .select('points, tier')
      .eq('id', userId)
      .single();

    const currentPoints = user?.points || 0;
    const currentTier = user?.tier || 'T4';
    let newTier = currentTier;

    for (const tier of TIERS) {
      if (currentPoints >= tier.minPoints && currentPoints <= tier.maxPoints) {
        newTier = tier.name;
        break;
      }
    }

    if (newTier !== currentTier) {
      await supabase
        .from('users')
        .update({ tier: newTier })
        .eq('id', userId);

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'tier_upgrade',
        content: { text: `â¬†ï¸ Congratulations! You advanced to ${newTier} tier! ðŸš€` },
        created_at: new Date().toISOString(),
      });

      await supabase.from('migration_cards').insert({
        user_id: userId,
        from_tier: currentTier,
        to_tier: newTier,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return newTier;
  }

  async getTierMultiplier(userId: string): Promise<number> {
    const { data } = await supabase
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single();

    const tier = TIERS.find(t => t.name === (data?.tier || 'T4'));
    return tier?.multiplier || 1.0;
  }

  async getNextTier(userId: string): Promise<{ name: string; pointsNeeded: number } | null> {
    const { data } = await supabase
      .from('users')
      .select('points, tier')
      .eq('id', userId)
      .single();

    const currentPoints = data?.points || 0;
    const currentTier = data?.tier || 'T4';
    const currentIndex = TIERS.findIndex(t => t.name === currentTier);
    const nextTier = TIERS[currentIndex + 1];

    if (nextTier) {
      return {
        name: nextTier.name,
        pointsNeeded: Math.max(0, nextTier.minPoints - currentPoints),
      };
    }
    return null;
  }
}

export const tierService = new TierService();
