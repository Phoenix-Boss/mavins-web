// src/app/api/deeplink/generate/route.ts
import { NextResponse } from 'next/server';
import { generateDeeplink } from '@/lib/deeplink/generator';

export async function POST(request: Request) {
  try {
    const { trackId, userId, taskId, activate } = await request.json();
    
    if (!trackId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    const deeplink = generateDeeplink({
      trackId,
      userId,
      taskId,
      activate: activate || false,
    });
    
    return NextResponse.json({ success: true, deeplink });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate deeplink' }, { status: 500 });
  }
}
