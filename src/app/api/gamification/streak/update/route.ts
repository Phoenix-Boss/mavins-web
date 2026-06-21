// src/app/api/gamification/streak/update/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: user } = await supabase
      .from('users')
      .select('streak, last_active')
      .eq('id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user?.last_active?.split('T')[0];
    let newStreak = user?.streak || 0;

    if (lastActive === today) {
      return NextResponse.json({ streak: newStreak });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      newStreak++;
    } else {
      newStreak = 1;
    }

    await supabase
      .from('users')
      .update({
        streak: newStreak,
        last_active: new Date().toISOString(),
      })
      .eq('id', userId);

    const streakMilestones = [7, 14, 30, 60, 100];
    const bonusPoints: Record<number, number> = { 7: 100, 14: 250, 30: 500, 60: 1000, 100: 2500 };

    if (streakMilestones.includes(newStreak)) {
      await supabase.rpc('award_points', {
        p_user_id: userId,
        p_points: bonusPoints[newStreak],
        p_reason: `${newStreak} day streak milestone!`,
      });

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'milestone',
        content: { text: `ðŸ”¥ ${newStreak} day streak! You earned ${bonusPoints[newStreak]} bonus points!` },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ streak: newStreak });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}
