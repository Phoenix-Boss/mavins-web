// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Check database connection with a simple query
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    const isDatabaseHealthy = !error;

    const health = {
      status: isDatabaseHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
        auth: 'healthy',
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = isDatabaseHealthy ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
        services: {
          database: 'unhealthy',
          api: 'healthy',
          auth: 'healthy',
        },
      },
      { status: 503 }
    );
  }
}
