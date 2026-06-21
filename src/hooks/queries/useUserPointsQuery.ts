// src/hooks/queries/useUserPointsQuery.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/store/useAppStore';

const fetchUserPoints = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('points, streak, tier')
    .eq('id', userId)
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const useUserPointsQuery = () => {
  const { user } = useAppStore();
  
  return useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: () => fetchUserPoints(user!.id),
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
