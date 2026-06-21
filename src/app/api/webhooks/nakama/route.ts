// src/app/api/webhooks/nakama/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    const supabase = createRouteHandlerClient({ cookies });
    
    if (type === 'message') {
      await supabase.from('messages').insert({
        id: data.messageId,
        pool_id: data.channelId,
        username: data.username,
        content: { text: data.content },
        sender_id: data.userId,
        created_at: new Date().toISOString(),
      });
    }
    
    if (type === 'notification') {
      await supabase.from('notifications').insert({
        id: data.id,
        user_id: data.userId,
        content: data.content,
        type: data.notificationType,
        created_at: new Date().toISOString(),
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
