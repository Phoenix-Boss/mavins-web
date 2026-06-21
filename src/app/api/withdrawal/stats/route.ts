// src/app/api/withdrawal/stats/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data: user } = await supabase
      .from('users')
      .select('points, wallet')
      .eq('id', userId)
      .single();

    const { data: rankData } = await supabase
      .from('leaderboard_record')
      .select('owner_id, score')
      .order('score', { ascending: false });

    const rank = rankData?.findIndex(r => r.owner_id === userId) + 1 || 0;

    const pointsMultiplier = 100;
    const totalEarned = (user?.points || 0) / pointsMultiplier;
    const availableForWithdrawal = totalEarned - (user?.wallet?.pending_withdrawal || 0);
    const withdrawnTotal = user?.wallet?.withdrawn_total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalPoints: user?.points || 0,
        totalEarned: totalEarned,
        availableForWithdrawal: Math.max(0, availableForWithdrawal),
        withdrawnTotal: withdrawnTotal,
        rank: rank,
        totalUsers: rankData?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
