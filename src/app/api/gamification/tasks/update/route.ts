// src/app/api/gamification/tasks/update/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, taskId, increment } = await request.json();
    
    if (!userId || !taskId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Task ID are required' },
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
    
    // Get current task with details
    const { data: currentTask, error: taskError } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (taskError || !currentTask) {
      console.error('Task not found:', taskError);
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    if (currentTask.is_completed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Task already completed' 
      });
    }

    // Update progress
    const newProgress = Math.min(
      currentTask.progress + (increment || 1), 
      currentTask.task.target_count
    );
    const isCompleted = newProgress >= currentTask.task.target_count;

    const { data: updatedTask, error: updateError } = await supabase
      .from('user_tasks')
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', currentTask.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update task' },
        { status: 500 }
      );
    }

    // If task is completed, create notification
    if (isCompleted) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'task_completed',
          content: { 
            text: `✅ Task "${currentTask.task.title}" completed! Claim your ${currentTask.task.reward_points || 0} points!` 
          },
          created_at: new Date().toISOString(),
        });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      task: updatedTask, 
      isCompleted,
      progress: newProgress,
      target: currentTask.task.target_count,
      message: isCompleted ? 'Task completed! Claim your reward.' : 'Progress updated'
    });
    
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
