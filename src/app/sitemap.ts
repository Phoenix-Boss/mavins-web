// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';

// This is optional - you can skip if you don't want share routes in sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
  
  // Fetch all active share IDs (optional - if you want to include them)
  // const supabase = createClient();
  // const { data: shares } = await supabase
  //   .from('shares')
  //   .select('share_id, updated_at')
  //   .eq('is_active', true)
  //   .limit(1000);

  // Core pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/earn`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/creator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  // Add share routes (optional - but note they change frequently)
  // if (shares) {
  //   shares.forEach((share) => {
  //     routes.push({
  //       url: `${baseUrl}/share/${share.share_id}`,
  //       lastModified: new Date(share.updated_at),
  //       changeFrequency: 'monthly' as const,
  //       priority: 0.5,
  //     });
  //   });
  // }

  return routes;
}