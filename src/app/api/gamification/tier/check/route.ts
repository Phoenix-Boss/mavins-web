// src/app/api/gamification/tier/check/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const TIERS = [
  { name: 'T4', minPoints: 0, maxPoints: 499, multiplier: 1.0, label: 'Listener', icon: '🟢' },
  { name: 'T3', minPoints: 500, maxPoints: 1999, multiplier: 1.5, label: 'Contributor', icon: '🟡' },
  { name: 'T2', minPoints: 2000, maxPoints: 9999, multiplier: 2.0, label: 'Creator', icon: '🟠' },
  { name: 'T1', minPoints: 10000, maxPoints: 999999, multiplier: 3.0, label: 'Curator', icon: '🔴' },
];

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Get user's current points and tier
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points, tier')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentPoints = user?.points || 0;
    const currentTier = user?.tier || 'T4';
    let newTier = currentTier;
    let newTierData = null;

    // Determine new tier based on points
    for (const tier of TIERS) {
      if (currentPoints >= tier.minPoints && currentPoints <= tier.maxPoints) {
        newTier = tier.name;
        newTierData = tier;
        break;
      }
    }

    // If tier changed, update database
    if (newTier !== currentTier) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ tier: newTier })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating tier:', updateError);
        return NextResponse.json(
          { error: 'Failed to update tier' },
          { status: 500 }
        );
      }

      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'tier_upgrade',
          content: { 
            text: `⬆️ Congratulations! You advanced to ${newTier} tier! 🚀` 
          },
          created_at: new Date().toISOString(),
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Create migration card
      const { error: cardError } = await supabase
        .from('migration_cards')
        .insert({
          user_id: userId,
          from_tier: currentTier,
          to_tier: newTier,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (cardError) {
        console.error('Error creating migration card:', cardError);
      }
    }

    // Get next tier information
    const currentIndex = TIERS.findIndex(t => t.name === newTier);
    const nextTier = TIERS[currentIndex + 1] || null;
    const nextTierInfo = nextTier ? {
      name: nextTier.name,
      label: nextTier.label,
      icon: nextTier.icon,
      pointsNeeded: Math.max(0, nextTier.minPoints - currentPoints),
      multiplier: nextTier.multiplier,
    } : null;

    return NextResponse.json({
      success: true,
      tier: newTier,
      tierDetails: newTierData ? {
        name: newTierData.name,
        label: newTierData.label,
        icon: newTierData.icon,
        multiplier: newTierData.multiplier,
        minPoints: newTierData.minPoints,
        maxPoints: newTierData.maxPoints,
      } : null,
      nextTier: nextTierInfo,
      currentPoints,
      tierChanged: newTier !== currentTier,
      isMaxTier: !nextTier,
    });
    
  } catch (error) {
    console.error('Tier check error:', error);
    return NextResponse.json(
      { error: 'Failed to check tier' },
      { status: 500 }
    );
  }
}
