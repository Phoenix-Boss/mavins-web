// src/app/api/gamification/tasks/claim/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { userId, taskId } = await request.json();
    
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
    
    // Get the user task with task details
    const { data: task, error: taskError } = await supabase
      .from('user_tasks')
      .select('*, task:daily_tasks(*)')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (taskError || !task) {
      console.error('Task not found:', taskError);
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if task can be claimed
    if (!task.is_completed || task.is_claimed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot claim reward - task not completed or already claimed' 
      });
    }

    // Mark task as claimed
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({ 
        is_claimed: true, 
        claimed_at: new Date().toISOString() 
      })
      .eq('id', task.id);

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to claim reward' },
        { status: 500 }
      );
    }

    // Get user's current points
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const rewardPoints = task.task.reward_points || 0;
    const newPoints = (user?.points || 0) + rewardPoints;

    // Update user's points
    const { error: pointsUpdateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', userId);

    if (pointsUpdateError) {
      console.error('Error updating points:', pointsUpdateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update points' },
        { status: 500 }
      );
    }

    // Add to points history
    const { error: historyError } = await supabase
      .from('points_history')
      .insert({
        user_id: userId,
        amount: rewardPoints,
        type: 'task',
        description: `Completed: ${task.task.title}`,
        created_at: new Date().toISOString(),
      });

    if (historyError) {
      console.error('Error adding points history:', historyError);
    }

    // Create notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'points_earned',
        content: { 
          text: `💰 You earned ${rewardPoints} points for completing "${task.task.title}"!` 
        },
        created_at: new Date().toISOString(),
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    return NextResponse.json({ 
      success: true, 
      newPoints,
      pointsEarned: rewardPoints,
      message: `Successfully claimed ${rewardPoints} points!`
    });
    
  } catch (error) {
    console.error('Claim reward error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim reward' },
      { status: 500 }
    );
  }
}
