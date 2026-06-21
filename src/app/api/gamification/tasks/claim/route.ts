// src/app/api/gamification/tasks/claim/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, taskId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: task } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (!task || !task.is_completed || task.is_claimed) {
      return NextResponse.json({ success: false, message: 'Cannot claim reward' });
    }

    await supabase
      .from('user_tasks')
      .update({ is_claimed: true, claimed_at: new Date().toISOString() })
      .eq('id', task.id);

    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    const newPoints = (user?.points || 0) + task.task.reward_points;

    await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    await supabase.from('points_history').insert({
      user_id: userId,
      amount: task.task.reward_points,
      type: 'task',
      description: `Completed: ${task.task.title}`,
      created_at: new Date().toISOString(),
    });

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'points_earned',
      content: { text: `ðŸ’° You earned ${task.task.reward_points} points for completing "${task.task.title}"!` },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, newPoints });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 });
  }
}
