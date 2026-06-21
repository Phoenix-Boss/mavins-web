// src/app/api/nakama/connect/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, poolId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: session } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const nakamaToken = Buffer.from(JSON.stringify({
      userId: userId,
      poolId: poolId,
      timestamp: Date.now()
    })).toString('base64');
    
    return NextResponse.json({ token: nakamaToken, poolId });
  } catch (error) {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
