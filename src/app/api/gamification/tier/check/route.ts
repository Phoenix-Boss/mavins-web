// src/app/api/gamification/tier/check/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const TIERS = [
  { name: 'T4', minPoints: 0, maxPoints: 499, multiplier: 1.0 },
  { name: 'T3', minPoints: 500, maxPoints: 1999, multiplier: 1.5 },
  { name: 'T2', minPoints: 2000, maxPoints: 9999, multiplier: 2.0 },
  { name: 'T1', minPoints: 10000, maxPoints: 999999, multiplier: 3.0 },
];

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
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

    const currentIndex = TIERS.findIndex(t => t.name === newTier);
    const nextTier = TIERS[currentIndex + 1];
    const nextTierInfo = nextTier ? {
      name: nextTier.name,
      pointsNeeded: Math.max(0, nextTier.minPoints - currentPoints),
    } : null;

    return NextResponse.json({ tier: newTier, nextTier: nextTierInfo });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check tier' }, { status: 500 });
  }
}
