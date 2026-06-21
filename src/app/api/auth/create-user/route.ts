// src/app/api/auth/create-user/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    const generatedPassword = `sw_${Math.random().toString(36).substring(2, 10)}`;
    
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: generatedPassword,
      options: {
        emailRedirectTo: request.headers.get('origin') || '',
        data: { email_confirmed: true }
      }
    });

    if (signUpError) throw signUpError;

    const { error: insertError } = await supabase
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
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
