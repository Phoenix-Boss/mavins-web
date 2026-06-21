// src/app/api/gamification/tasks/update/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, taskId, increment } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: currentTask } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (!currentTask || currentTask.is_completed) {
      return NextResponse.json({ success: false, message: 'Task already completed' });
    }

    const newProgress = Math.min(currentTask.progress + (increment || 1), currentTask.task.target_count);
    const isCompleted = newProgress >= currentTask.task.target_count;

    const { data: updatedTask } = await supabase
      .from('user_tasks')
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', currentTask.id)
      .select()
      .single();

    if (isCompleted) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'task_completed',
        content: { text: `âœ… Completed task! Claim your ${currentTask.task.reward_points} points!` },
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, task: updatedTask, isCompleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
