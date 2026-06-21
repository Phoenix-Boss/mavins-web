// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Get session for auth check
  const { data: { session } } = await supabase.auth.getSession();

  // --- SHARE ROUTE HANDLING ---
  // Allow share routes to be accessible without authentication
  // These routes need to be publicly accessible for rich previews and deep linking
  const isShareRoute = req.nextUrl.pathname.startsWith('/share/');
  const isShareApiRoute = req.nextUrl.pathname.startsWith('/api/share/');
  const isDeeplinkRoute = req.nextUrl.pathname.startsWith('/api/deeplink/');

  // Skip auth check for share and deeplink routes
  if (isShareRoute || isShareApiRoute || isDeeplinkRoute) {
    // Add cache control headers for share routes
    if (isShareRoute) {
      res.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
    
    // Add security headers for share routes
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    
    // Allow sharing metadata
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return res;
  }

  // --- PROTECTED ROUTES ---
  // Protect routes that require authentication
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                          req.nextUrl.pathname.startsWith('/profile') ||
                          req.nextUrl.pathname.startsWith('/earn') ||
                          req.nextUrl.pathname.startsWith('/leaderboard') ||
                          req.nextUrl.pathname.startsWith('/api/protected');

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // --- AUTH ROUTES ---
  // Redirect to dashboard if already logged in on auth pages
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth/');
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // --- API ROUTE HANDLING ---
  // Handle CORS for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }
  }

  // --- SECURITY HEADERS ---
  // Add security headers to all routes
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Add HSTS header for production
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Add Referrer-Policy
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return res;
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/earn/:path*',
    '/leaderboard/:path*',
    '/api/:path*',
    '/auth/:path*',
    // Share routes (new)
    '/share/:path*',
    '/api/share/:path*',
    '/api/deeplink/:path*',
  ],
};