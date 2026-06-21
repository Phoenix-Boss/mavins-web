// src/services/gamification/points.service.ts
import { supabase } from '@/lib/supabase/client';

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'task' | 'streak' | 'bonus' | 'welcome' | 'milestone';
  description: string;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredPoints: number;
  rewardPoints: number;
  badgeId: string;
}

const MILESTONES: Milestone[] = [
  { id: '100', name: 'Rising Star', description: 'Reached 100 points', requiredPoints: 100, rewardPoints: 50, badgeId: 'rising_star' },
  { id: '500', name: 'Point Collector', description: 'Reached 500 points', requiredPoints: 500, rewardPoints: 100, badgeId: 'point_collector' },
  { id: '1000', name: 'Points Master', description: 'Reached 1000 points', requiredPoints: 1000, rewardPoints: 200, badgeId: 'points_master' },
  { id: '5000', name: 'Legend', description: 'Reached 5000 points', requiredPoints: 5000, rewardPoints: 500, badgeId: 'legend' },
];

class PointsService {
  async awardPoints(userId: string, amount: number, type: PointsTransaction['type'], description: string): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single();

      const newPoints = (user?.points || 0) + amount;

      const { error: updateError } = await supabase
        .from('users')
        .update({ points: newPoints })
        .eq('id', userId);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('points_history')
        .insert({
          user_id: userId,
          amount: amount,
          type: type,
          description: description,
          created_at: new Date().toISOString(),
        });

      if (transactionError) throw transactionError;

      await this.checkMilestones(userId, newPoints);
      await this.updateLeaderboard(userId);

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  private async checkMilestones(userId: string, currentPoints: number): Promise<void> {
    for (const milestone of MILESTONES) {
      if (currentPoints >= milestone.requiredPoints) {
        const { data: existing } = await supabase
          .from('user_milestones')
          .select('id')
          .eq('user_id', userId)
          .eq('milestone_id', milestone.id)
          .single();

        if (!existing) {
          await supabase.from('user_milestones').insert({
            user_id: userId,
            milestone_id: milestone.id,
            achieved_at: new Date().toISOString(),
          });

          await this.awardPoints(userId, milestone.rewardPoints, 'milestone', `Achieved: ${milestone.name}`);

          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'milestone',
            content: { text: `ðŸŽ‰ ${milestone.name}! You earned ${milestone.rewardPoints} bonus points!` },
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  private async updateLeaderboard(userId: string): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('points, username, tier')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase.from('leaderboard_record').upsert({
        owner_id: userId,
        username: user.username,
        score: user.points,
        subscore: 0,
        metadata: { tier: user.tier },
        update_time: new Date().toISOString(),
      });
    }
  }

  async getUserPoints(userId: string): Promise<number> {
    const { data } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();
    return data?.points || 0;
  }

  async getPointsHistory(userId: string, limit: number = 20): Promise<PointsTransaction[]> {
    const { data } = await supabase
      .from('points_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }
}

export const pointsService = new PointsService();
