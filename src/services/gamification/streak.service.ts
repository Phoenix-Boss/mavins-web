// src/services/gamification/streak.service.ts
import { supabase } from '@/lib/supabase/client';

class StreakService {
  async updateStreak(userId: string): Promise<number> {
    const { data: user } = await supabase
      .from('users')
      .select('streak, last_active')
      .eq('id', userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user?.last_active?.split('T')[0];
    let newStreak = user?.streak || 0;

    if (lastActive === today) {
      return newStreak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      newStreak++;
    } else {
      newStreak = 1;
    }

    await supabase
      .from('users')
      .update({
        streak: newStreak,
        last_active: new Date().toISOString(),
      })
      .eq('id', userId);

    await this.checkStreakMilestones(userId, newStreak);

    return newStreak;
  }

  private async checkStreakMilestones(userId: string, streak: number): Promise<void> {
    const milestones = [7, 14, 30, 60, 100];
    const bonusPoints = { 7: 100, 14: 250, 30: 500, 60: 1000, 100: 2500 };

    for (const milestone of milestones) {
      if (streak === milestone) {
        const { data: existing } = await supabase
          .from('user_milestones')
          .select('id')
          .eq('user_id', userId)
          .eq('milestone_id', `streak_${milestone}`)
          .single();

        if (!existing) {
          await supabase.from('user_milestones').insert({
            user_id: userId,
            milestone_id: `streak_${milestone}`,
            achieved_at: new Date().toISOString(),
          });

          await supabase.rpc('award_points', {
            p_user_id: userId,
            p_points: bonusPoints[milestone as keyof typeof bonusPoints],
            p_reason: `${milestone} day streak milestone!`,
          });

          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'milestone',
            content: { text: `ðŸ”¥ ${milestone} day streak! You earned ${bonusPoints[milestone as keyof typeof bonusPoints]} bonus points!` },
            created_at: new Date().toISOString(),
          });
        }
        break;
      }
    }
  }

  async getStreak(userId: string): Promise<number> {
    const { data } = await supabase
      .from('users')
      .select('streak')
      .eq('id', userId)
      .single();
    return data?.streak || 0;
  }
}

export const streakService = new StreakService();
