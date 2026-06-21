// src/services/gamification/badge.service.ts
import { supabase } from '@/lib/supabase/client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}

const BADGES: Badge[] = [
  { id: 'welcome_pioneer', name: 'Welcome Pioneer', description: 'Played featured artist for first time', icon: 'ðŸŽ‰' },
  { id: 'week_warrior', name: 'Week Warrior', description: 'Maintained 7 day streak', icon: 'ðŸ”¥' },
  { id: 'task_master', name: 'Task Master', description: 'Completed 50 tasks', icon: 'âœ…' },
  { id: 'genre_explorer', name: 'Genre Explorer', description: 'Played 5 different genres', icon: 'ðŸŽ§' },
  { id: 'night_owl', name: 'Night Owl', description: 'Played songs after midnight 10 times', icon: 'ðŸ¦‰' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Got 10 @mentions from seeds', icon: 'ðŸ¦‹' },
  { id: 'rising_star', name: 'Rising Star', description: 'Reached 100 points', icon: 'â­' },
  { id: 'point_collector', name: 'Point Collector', description: 'Reached 500 points', icon: 'ðŸ’°' },
  { id: 'points_master', name: 'Points Master', description: 'Reached 1000 points', icon: 'ðŸ†' },
  { id: 'legend', name: 'Legend', description: 'Reached 5000 points', icon: 'ðŸ‘‘' },
];

class BadgeService {
  async getUserBadges(userId: string): Promise<Badge[]> {
    const { data: earned } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId);

    const earnedIds = new Set(earned?.map(e => e.badge_id) || []);

    return BADGES.map(badge => ({
      ...badge,
      earnedAt: earned?.find(e => e.badge_id === badge.id)?.earned_at,
    }));
  }

  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (existing) return false;

    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) return false;

    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
      });

    if (error) return false;

    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'badge_earned',
      content: { text: `ðŸ† Badge Unlocked: ${badge.name}! ${badge.description}` },
      created_at: new Date().toISOString(),
    });

    return true;
  }

  async checkAndAwardGenreExplorer(userId: string, genres: string[]): Promise<void> {
    const uniqueGenres = new Set(genres);
    if (uniqueGenres.size >= 5) {
      await this.awardBadge(userId, 'genre_explorer');
    }
  }

  async getBadgeCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('user_badges')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    return count || 0;
  }
}

export const badgeService = new BadgeService();
