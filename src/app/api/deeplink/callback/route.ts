// src/app/api/deeplink/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateDeeplink } from '@/lib/deeplink/validator';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      track_id: searchParams.get('track_id') || '',
      user_id: searchParams.get('user_id') || '',
      task_id: searchParams.get('task_id') || undefined,
      activate: searchParams.get('activate') || undefined,
      ts: searchParams.get('ts') || '',
      sig: searchParams.get('sig') || '',
      duration: searchParams.get('duration') || undefined,
      share_id: searchParams.get('share_id') || undefined,
      title: searchParams.get('title') || undefined,
      artist: searchParams.get('artist') || undefined,
    };
    
    const validation = validateDeeplink(params);
    
    if (!validation.isValid) {
      console.error('[Deeplink Callback] Invalid deeplink:', validation.error);
      return NextResponse.redirect(new URL('/?error=invalid_link', request.url));
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
    
    const data = validation.data!;
    
    // Track share click if share_id is present
    if (data.shareId) {
      try {
        const { error: shareError } = await supabase
          .from('shares')
          .update({ 
            clicks: supabase.rpc('increment', { row_id: data.shareId }),
            last_click: new Date().toISOString()
          })
          .eq('share_id', data.shareId);
          
        if (shareError) {
          console.warn('[Deeplink Callback] Failed to track share click:', shareError);
        }
      } catch (error) {
        console.warn('[Deeplink Callback] Share tracking error:', error);
      }
    }
    
    // Handle user activation if activate flag is true
    if (data.activate) {
      try {
        const { error: userError } = await supabase
          .from('users')
          .update({ is_active: true, activated_at: new Date().toISOString() })
          .eq('id', data.userId);
          
        if (userError) {
          console.warn('[Deeplink Callback] Failed to activate user:', userError);
        } else {
          // Insert activation notification
          await supabase.from('notifications').insert({
            user_id: data.userId,
            type: 'activation',
            content: { text: '🎉 Welcome to Mavin Player! Your account has been activated.' },
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.warn('[Deeplink Callback] User activation error:', error);
      }
    }
    
    // Handle task completion if task_id is present
    if (data.taskId && data.trackId) {
      try {
        // Get task details
        const { data: task, error: taskError } = await supabase
          .from('user_tasks')
          .select('*, task:daily_tasks(*)')
          .eq('user_id', data.userId)
          .eq('task_id', data.taskId)
          .single();
          
        if (taskError) {
          console.warn('[Deeplink Callback] Task not found:', taskError);
        } else if (task && !task.is_completed) {
          const newProgress = Math.min(task.progress + 1, task.task.target_count);
          const isCompleted = newProgress >= task.task.target_count;
          
          await supabase
            .from('user_tasks')
            .update({
              progress: newProgress,
              is_completed: isCompleted,
              completed_at: isCompleted ? new Date().toISOString() : null,
            })
            .eq('id', task.id);
            
          // If task completed, award points
          if (isCompleted && task.task.points_reward) {
            await supabase
              .from('user_points')
              .insert({
                user_id: data.userId,
                points: task.task.points_reward,
                source: 'task_completion',
                task_id: data.taskId,
                created_at: new Date().toISOString(),
              });
          }
        }
      } catch (error) {
        console.warn('[Deeplink Callback] Task completion error:', error);
      }
    }
    
    // Handle listening duration tracking
    const listenDuration = data.duration || 0;
    const expectedDuration = 210; // 3.5 minutes minimum
    const isValidListen = listenDuration >= expectedDuration * 0.75;
    
    if (isValidListen && data.trackId && data.trackId !== 'featured') {
      try {
        await supabase.from('user_listening_history').insert({
          user_id: data.userId,
          track_id: data.trackId,
          task_id: data.taskId || null,
          share_id: data.shareId || null,
          duration: listenDuration,
          is_full_listen: listenDuration >= expectedDuration,
          listened_at: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('[Deeplink Callback] Listening history error:', error);
      }
    }
    
    // Redirect with success
    return NextResponse.redirect(
      new URL('/?callback=success&track=' + encodeURIComponent(data.trackId), request.url)
    );
  } catch (error) {
    console.error('[Deeplink Callback] Unexpected error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}