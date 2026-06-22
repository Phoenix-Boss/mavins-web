// src/app/api/share/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering — this route writes to the database and requires
// runtime env vars. Without this, Next.js tries to statically collect page
// data at build time, evaluating the module before env vars are available.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Initialize inside the handler so the client is never created at module
  // load time (which happens during the build's static analysis phase).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Share Generate] Missing Supabase env vars');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await request.json();
    const { trackId, userId, title, artist, thumbnail, taskId } = body;

    if (!trackId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: trackId and userId are required' },
        { status: 400 }
      );
    }

    // Generate a unique share ID
    const shareId = generateShareId(trackId, userId);

    // Store share data in Supabase
    const { data, error } = await supabase
      .from('shares')
      .insert({
        share_id: shareId,
        track_id: trackId,
        user_id: userId,
        title: title || 'Unknown Track',
        artist: artist || 'Unknown Artist',
        thumbnail: thumbnail || '',
        task_id: taskId || null,
        created_at: new Date().toISOString(),
        clicks: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[Share Generate] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to store share data' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mavins.vercel.app';
    const shareUrl = `${baseUrl}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareId,
      trackId,
      title: data.title,
      artist: data.artist,
    });
  } catch (error) {
    console.error('[Share Generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

function generateShareId(trackId: string, userId: string): string {
  const combined = `${trackId.slice(0, 6)}${userId.slice(0, 4)}`;
  const timestamp = Date.now().toString(36);
  return `${combined}${timestamp.slice(-4)}`.toLowerCase();
}
