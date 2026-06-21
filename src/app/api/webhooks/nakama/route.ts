// src/app/api/webhooks/nakama/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: 'Webhook type is required' },
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
    
    // Process different webhook types
    if (type === 'message') {
      const { messageId, channelId, username, content, userId } = data || {};
      
      if (!messageId || !channelId || !userId) {
        return NextResponse.json(
          { error: 'Missing required message fields' },
          { status: 400 }
        );
      }
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          pool_id: channelId,
          username: username || 'unknown',
          content: { text: content || '' },
          sender_id: userId,
          created_at: new Date().toISOString(),
        });
      
      if (messageError) {
        console.error('Error inserting message:', messageError);
        return NextResponse.json(
          { error: 'Failed to save message' },
          { status: 500 }
        );
      }
    }
    
    if (type === 'notification') {
      const { id, userId, content, notificationType } = data || {};
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Missing required notification fields' },
          { status: 400 }
        );
      }
      
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          id: id || undefined,
          user_id: userId,
          content: content || { text: 'New notification' },
          type: notificationType || 'system',
          created_at: new Date().toISOString(),
          read: false,
        });
      
      if (notifError) {
        console.error('Error inserting notification:', notifError);
        return NextResponse.json(
          { error: 'Failed to save notification' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
      type,
    });
    
  } catch (error) {
    console.error('Nakama webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    );
  }
}
