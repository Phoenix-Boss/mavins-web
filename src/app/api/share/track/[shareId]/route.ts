// src/app/api/share/track/[shareId]/route.ts (updated with batch)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClickBatcher } from '@/lib/utils/clickBatcher';

// Initialize Supabase client with service role key for write access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  request: Request,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;
    
    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for analytics
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const platform = getPlatform(userAgent);

    // Add to batch (doesn't hit database immediately)
    const batcher = getClickBatcher();
    batcher.addClick(shareId);

    // Insert click analytics asynchronously (non-blocking)
    // This is a separate operation from the click count
    try {
      // Don't await - fire and forget
      supabase
        .from('share_analytics')
        .insert({
          share_id: shareId,
          ip_address: ip,
          user_agent: userAgent,
          platform: platform,
          clicked_at: new Date().toISOString(),
        })
        .then(() => {
          // Analytics inserted successfully
        })
        .catch((error: Error) => {
          console.warn('[Share Track] Analytics insert error (non-critical):', error);
        });
    } catch (analyticsError) {
      // Non-critical - log but don't fail
      console.warn('[Share Track] Analytics insert error (non-critical):', analyticsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
      shareId,
    });
  } catch (error) {
    console.error('[Share Track] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track share click' },
      { status: 500 }
    );
  }
}

function getPlatform(userAgent: string): string {
  if (/android/i.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
  return 'web';
}

export async function GET(
  request: Request,
  { params }: { params: { shareId: string } }
) {
  try {
    const shareId = params.shareId;
    
    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Share not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      share: {
        shareId: data.share_id,
        trackId: data.track_id,
        userId: data.user_id,
        title: data.title,
        artist: data.artist,
        thumbnail: data.thumbnail,
        createdAt: data.created_at,
        clicks: data.clicks || 0,
        lastClick: data.last_click || null,
      }
    });
  } catch (error) {
    console.error('[Share Track] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get share data' },
      { status: 500 }
    );
  }
}
