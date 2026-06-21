// src/app/api/nakama/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NAKAMA_URL = 'https://nakama-mmpb.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, ...data } = body;
    
    const url = `${NAKAMA_URL}/${path}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Nakama' },
      { status: 500 }
    );
  }
}