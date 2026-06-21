// src/app/api/withdrawal/request/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, amount, method, accountDetails } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const { data: user } = await supabase
      .from('users')
      .select('points, wallet')
      .eq('id', userId)
      .single();

    const pointsMultiplier = 100;
    const pointsRequired = amount * pointsMultiplier;

    if ((user?.points || 0) < pointsRequired) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount: amount,
        points_amount: pointsRequired,
        method: method,
        account_details: accountDetails,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('users')
      .update({
        points: (user?.points || 0) - pointsRequired,
        wallet: {
          balance: (user?.wallet?.balance || 0) - amount,
          pending_withdrawal: amount,
        },
      })
      .eq('id', userId);

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 });
  }
}
