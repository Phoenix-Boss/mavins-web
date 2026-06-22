// src/app/api/nakama/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NAKAMA_URL = process.env.NAKAMA_URL || 'https://nakama-mmpb.onrender.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, ...data } = body;
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }
    
    // Construct the full URL
    const url = `${NAKAMA_URL}/${path}`;
    
    // Forward the request to Nakama
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(body.token ? { 'Authorization': `Bearer ${body.token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    
    // Get the response
    const result = await response.json();
    
    // Return the response with the same status code
    return NextResponse.json(result, { status: response.status });
    
  } catch (error) {
    console.error('Nakama proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Nakama' },
      { status: 500 }
    );
  }
}

// Handle GET requests if needed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }
    
    const url = `${NAKAMA_URL}/${path}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
    
  } catch (error) {
    console.error('Nakama proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to Nakama' },
      { status: 500 }
    );
  }
}
