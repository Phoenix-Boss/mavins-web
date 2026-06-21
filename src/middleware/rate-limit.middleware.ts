// src/middleware/rate-limit.middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(req: NextRequest, limit: number = 100, windowMs: number = 60 * 1000) {
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (record) {
    if (now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }

    if (record.count >= limit) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    record.count++;
    rateLimitMap.set(ip, record);
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
  }

  return null;
}
