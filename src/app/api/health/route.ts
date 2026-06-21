// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: error ? 'unhealthy' : 'healthy',
        api: 'healthy',
        auth: 'healthy',
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    const statusCode = error ? 503 : 200;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service unavailable' },
      { status: 503 }
    );
  }
}
