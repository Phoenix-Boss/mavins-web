// src/hooks/queries/useArtistQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { cacheService } from '@/services/cache/cache.service';

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  isTrending: boolean;
}

const fetchTrendingArtists = async (): Promise<Artist[]> => {
  const cached = cacheService.get<Artist[]>('trending-artists');
  if (cached) return cached;
  
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, edge_count')
    .eq('user_type', 'seed')
    .order('edge_count', { ascending: false })
    .limit(5);
  
  if (error) throw new Error(error.message);
  
  const artists = data.map(user => ({
    id: user.id,
    name: user.username,
    avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=amber&color=white`,
    followers: user.edge_count || 0,
    isTrending: true,
  }));
  
  cacheService.set('trending-artists', artists, 15 * 60 * 1000);
  return artists;
};

export const useArtistQuery = () => {
  return useQuery({
    queryKey: ['trending-artists'],
    queryFn: fetchTrendingArtists,
    staleTime: 15 * 60 * 1000,
  });
};
