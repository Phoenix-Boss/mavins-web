// src/app/api/auth/activate/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
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
    
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'Failed to activate account' },
      { status: 500 }
    );
  }
}