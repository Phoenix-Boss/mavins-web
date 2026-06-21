// src/app/api/nakama/connect/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, poolId } = await request.json();
    
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
    
    // Verify user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify the user ID matches the session
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'User ID does not match session' },
        { status: 403 }
      );
    }
    
    // Generate Nakama token
    const tokenData = {
      userId: userId,
      poolId: poolId || null,
      timestamp: Date.now(),
      expires: Date.now() + 3600000, // 1 hour expiry
    };
    
    const nakamaToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    
    return NextResponse.json({
      success: true,
      token: nakamaToken,
      poolId: poolId || null,
      expires: tokenData.expires,
    });
    
  } catch (error) {
    console.error('Nakama connect error:', error);
    return NextResponse.json(
      { error: 'Connection failed' },
      { status: 500 }
    );
  }
}
