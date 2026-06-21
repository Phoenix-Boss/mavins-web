// app/api/setup-leaderboard/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const host = 'nakama-mmpb.onrender.com';
  const serverKey = 'DaNjI20sbHAZBy3h86xCoTfMleidWELw';
  const auth = btoa(`${serverKey}:`);
  
  const leaderboards = [
    'earnings_leaderboard',
    'earnings_leaderboard_week',
    'earnings_leaderboard_month'
  ];
  
  const results = [];
  
  for (const leaderboardId of leaderboards) {
    try {
      const response = await fetch(`https://${host}/v2/leaderboard/${leaderboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          authoritative: true,
          sort_order: "desc",
          operator: "best",
          reset_schedule: "0 0 * * 0"
        })
      });
      
      results.push({
        leaderboard: leaderboardId,
        success: response.ok || response.status === 409,
        status: response.status
      });
    } catch (error) {
      results.push({
        leaderboard: leaderboardId,
        success: false,
        error: String(error)
      });
    }
  }
  
  const allSuccess = results.every(r => r.success);
  
  return NextResponse.json({
    success: allSuccess,
    results
  });
}