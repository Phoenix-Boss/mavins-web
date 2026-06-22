// app/test-nakama/page.tsx
'use client';

import { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export default function TestNakamaPage() {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Health Check', status: 'pending', message: 'Testing connection...' },
    { name: 'Authentication', status: 'pending', message: 'Waiting...' },
    { name: 'Leaderboard Check', status: 'pending', message: 'Waiting...' },
    { name: 'Submit Score', status: 'pending', message: 'Waiting...' },
    { name: 'Fetch Leaderboard', status: 'pending', message: 'Waiting...' },
    { name: 'RPC Call', status: 'pending', message: 'Waiting...' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');
  const [sessionUserId, setSessionUserId] = useState<string>('');
  const [testScoreStatus, setTestScoreStatus] = useState<string>('');
  const [leaderboardExists, setLeaderboardExists] = useState<boolean | null>(null);

  const updateResult = (index: number, status: TestResult['status'], message: string, data?: any) => {
    setResults(prev => prev.map((r, i) => 
      i === index ? { ...r, status, message, data } : r
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    setAllPassed(false);
    setTestScoreStatus('');
    setLeaderboardExists(null);
    
    setResults(prev => prev.map((r: any) => ({ ...r, status: 'pending', message: 'Testing...', data: undefined })));
    
    const host = 'nakama-mmpb.onrender.com';
    const serverKey = 'DaNjI20sbHAZBy3h86xCoTfMleidWELw';
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const username = 'emilia';
    
    let token = '';

    // Test 1: Health Check
    updateResult(0, 'pending', 'Checking server health...');
    try {
      const healthResponse = await fetch(`https://${host}/healthcheck`);
      if (healthResponse.ok) {
        updateResult(0, 'success', `Server is healthy! Status: ${healthResponse.status}`);
      } else {
        updateResult(0, 'error', `Health check failed: ${healthResponse.status}`);
        setIsRunning(false);
        return;
      }
    } catch (error) {
      updateResult(0, 'error', `Cannot reach server: ${error instanceof Error ? error.message : 'Network error'}`);
      setIsRunning(false);
      return;
    }

    // Test 2: Authentication
    updateResult(1, 'pending', 'Authenticating with Nakama...');
    try {
      const auth = btoa(`${serverKey}:`);
      
      const authResponse = await fetch(`https://${host}/v2/account/authenticate/custom?create=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({ id: userId, username: username }),
      });
      
      const authData = await authResponse.json();
      
      if (authResponse.ok) {
        token = authData.token;
        setAuthToken(token);
        setSessionUserId(authData.userId || userId);
        updateResult(1, 'success', `Authenticated as ${username}!`, {
          userId: authData.userId || userId,
          username: username,
          tokenPreview: token.substring(0, 20) + '...'
        });
      } else {
        updateResult(1, 'error', `Auth failed: ${authData.message || authResponse.statusText}`, authData);
        setIsRunning(false);
        return;
      }
    } catch (error) {
      updateResult(1, 'error', `Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsRunning(false);
      return;
    }

    // Test 3: Check if leaderboard exists (try to fetch it)
    updateResult(2, 'pending', 'Checking if leaderboard exists...');
    try {
      const checkResponse = await fetch(`https://${host}/v2/leaderboard/earnings_leaderboard?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (checkResponse.ok) {
        setLeaderboardExists(true);
        updateResult(2, 'success', `Leaderboard "earnings_leaderboard" exists!`);
      } else if (checkResponse.status === 404) {
        setLeaderboardExists(false);
        updateResult(2, 'warning', `Leaderboard "earnings_leaderboard" not found (404). It needs to be created server-side.`, {
          solution: 'Create it via Nakama Console > Leaderboards, or server runtime code',
          docs: 'https://heroiclabs.com/docs/nakama/concepts/leaderboards/'
        });
      } else {
        updateResult(2, 'warning', `Unexpected status: ${checkResponse.status}`);
      }
    } catch (error) {
      updateResult(2, 'warning', `Could not verify leaderboard: ${error instanceof Error ? error.message : 'Error'}`);
    }

    // Test 4: Submit Score (will be done by separate button if leaderboard exists)
    if (leaderboardExists === false) {
      updateResult(3, 'warning', `Skipped: Leaderboard doesn't exist yet. Create it first.`);
    } else {
      updateResult(3, 'pending', `Click "Submit Test Score" button to test score submission`);
    }

    // Test 5: Fetch Leaderboard
    if (leaderboardExists === false) {
      updateResult(4, 'warning', `Skipped: Leaderboard doesn't exist yet.`);
    } else {
      updateResult(4, 'pending', `Submit a score first or click "Fetch Leaderboard"`);
    }

    // Test 6: RPC Call
    updateResult(5, 'pending', 'Testing RPC function...');
    try {
      const rpcResponse = await fetch(`https://${host}/v2/rpc/health`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (rpcResponse.ok) {
        const rpcData = await rpcResponse.json();
        updateResult(5, 'success', `RPC 'health' call successful!`, rpcData);
      } else {
        updateResult(5, 'warning', `RPC call returned: ${rpcResponse.status}`);
      }
    } catch (error) {
      updateResult(5, 'warning', `RPC test skipped: ${error instanceof Error ? error.message : 'Error'}`);
    }

    setAllPassed(true);
    setIsRunning(false);
  };

  const submitTestScore = async () => {
    if (!authToken) {
      setTestScoreStatus('❌ Please run the integration tests first to get authentication token');
      return;
    }

    setTestScoreStatus('🔄 Submitting test score...');
    
    const host = 'nakama-mmpb.onrender.com';
    const testScore = Math.floor(Math.random() * 10000) + 1000;
    
    try {
      // According to Nakama docs, the correct endpoint is POST /v2/leaderboard/{leaderboardId}
      // with body: { "record": { "score": 100 } } or simply { "score": 100 }
      const scoreResponse = await fetch(`https://${host}/v2/leaderboard/earnings_leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ score: testScore }),
      });
      
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setTestScoreStatus(`✅ Score submitted successfully! Score: ${testScore}, Rank: ${scoreData.rank || 'N/A'}`);
        
        updateResult(3, 'success', `Score submitted successfully!`, {
          score: testScore,
          rank: scoreData.rank || 'N/A',
          leaderboardId: 'earnings_leaderboard'
        });
        
        // Now fetch the leaderboard
        await fetchLeaderboard();
      } else if (scoreResponse.status === 404) {
        const errorText = await scoreResponse.text();
        setTestScoreStatus(`❌ Leaderboard not found (404). You must create "earnings_leaderboard" server-side.`);
        updateResult(3, 'error', `Leaderboard "earnings_leaderboard" does not exist. Create it in Nakama Console or via runtime code.`, {
          error: errorText,
          status: 404,
          help: 'Leaderboards must be pre-created via server runtime or console. They are NOT auto-created on first submission.'
        });
      } else {
        const errorText = await scoreResponse.text();
        setTestScoreStatus(`❌ Score submission failed: ${scoreResponse.status} - ${errorText}`);
        updateResult(3, 'error', `Score submission failed: ${scoreResponse.status}`, { error: errorText });
      }
    } catch (error) {
      setTestScoreStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      updateResult(3, 'error', `Network error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const fetchLeaderboard = async () => {
    if (!authToken) {
      setTestScoreStatus('❌ Please authenticate first');
      return;
    }
    
    const host = 'nakama-mmpb.onrender.com';
    
    try {
      const leaderboardResponse = await fetch(`https://${host}/v2/leaderboard/earnings_leaderboard?limit=10`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        const records = leaderboardData.records || [];
        updateResult(4, 'success', `Leaderboard fetched! ${records.length} entries found.`, {
          totalEntries: records.length,
          topEntries: records.slice(0, 5).map((r: any) => ({
            rank: r.rank,
            username: r.username || r.ownerId?.substring(0, 8),
            score: r.score,
            subscore: r.subscore
          }))
        });
      } else if (leaderboardResponse.status === 404) {
        updateResult(4, 'error', `Leaderboard not found (404). Create it first.`, {
          help: 'Use Nakama Console or server runtime to create "earnings_leaderboard"'
        });
      } else {
        const errorText = await leaderboardResponse.text();
        updateResult(4, 'error', `Leaderboard fetch failed: ${leaderboardResponse.status}`, { error: errorText });
      }
    } catch (error) {
      updateResult(4, 'error', `Network error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '🔄';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🎮</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Nakama Integration Test</h1>
          <p className="text-gray-600">Testing connection to your Nakama server</p>
          <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            🟢 Server: nakama-mmpb.onrender.com
          </div>
        </div>

        {/* Server Status Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-blue-800">Server Status:</span>
            <span className="text-blue-600">Live and accepting connections</span>
            <span className="ml-auto text-xs text-blue-500">Nakama v3.22.0</span>
          </div>
        </div>

        {/* Error Explanation for 404 */}
        {leaderboardExists === false && (
          <div className="mb-6 p-4 rounded-xl border-2 border-red-300 bg-red-50 text-red-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <strong className="text-lg">Leaderboard Not Found (404)</strong>
                <p className="text-sm mt-1">
                  The leaderboard <code>earnings_leaderboard</code> does not exist on your Nakama server. 
                  Leaderboards must be <strong>pre-created</strong> via server runtime code or the Nakama Console — 
                  they are NOT automatically created on first score submission.
                </p>
                <div className="mt-3 p-3 bg-white rounded-lg text-xs font-mono">
                  <p className="font-semibold mb-1">Server-side TypeScript ( nakama/data/modules/main.ts ):</p>
                  <pre className="text-gray-700">
{`let id = 'earnings_leaderboard';
let authoritative = false;
let sort = nkruntime.SortOrder.DESCENDING;
let operator = nkruntime.Operator.BEST;
let reset = '0 0 * * 1'; // Weekly reset
try {
  nk.leaderboardCreate(id, authoritative, sort, operator, reset, {});
} catch(error) {
  logger.error('Failed to create leaderboard:', error);
}`}
                  </pre>
                </div>
                <p className="text-xs mt-2">
                  Or create it in the <a href={`https://nakama-mmpb.onrender.com/console`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Nakama Console</a> under Leaderboards section.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              isRunning 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
            }`}
          >
            {isRunning ? 'Running Tests...' : '🚀 Run Integration Tests'}
          </button>
          
          <button
            onClick={submitTestScore}
            disabled={!authToken || isRunning}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              !authToken || isRunning
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
            }`}
          >
            📊 Submit Test Score
          </button>

          <button
            onClick={fetchLeaderboard}
            disabled={!authToken || isRunning}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              !authToken || isRunning
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg'
            }`}
          >
            📈 Fetch Leaderboard
          </button>
        </div>

        {/* Test Score Status */}
        {testScoreStatus && (
          <div className={`mb-6 p-4 rounded-xl ${
            testScoreStatus.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' :
            testScoreStatus.includes('❌') ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {testScoreStatus}
          </div>
        )}

        {/* Overall Status */}
        {!isRunning && allPassed && leaderboardExists !== false && (
          <div className="mb-6 p-4 rounded-xl border-2 border-green-500 bg-green-100 text-green-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <strong className="text-lg">All Systems Operational!</strong>
                <p className="text-sm mt-1">Authentication and server connectivity verified. Leaderboard is ready.</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div 
              key={index}
              className={`border-l-4 p-4 rounded-r-xl shadow-sm transition-all ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{result.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          📋 View details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-64 font-mono">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Summary */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>⚙️</span> Configuration Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nakama Host:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-purple-600">nakama-mmpb.onrender.com</code>
            </div>
            <div>
              <span className="text-gray-500">Server Key:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-purple-600">DaNjI20sbHAZBy3h86xCoTfMleidWELw</code>
            </div>
            <div>
              <span className="text-gray-500">Test User ID:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-purple-600">550e8400-e29b-41d4-a716-446655440000</code>
            </div>
            <div>
              <span className="text-gray-500">Leaderboard ID:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-purple-600">earnings_leaderboard</code>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>📝</span> How to Test
          </h3>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>Click <strong>"Run Integration Tests"</strong> to verify authentication and check leaderboard status</li>
            <li>If leaderboard shows 404, create it via Nakama Console or server runtime code</li>
            <li>Click <strong>"Submit Test Score"</strong> to write a score to the leaderboard</li>
            <li>Click <strong>"Fetch Leaderboard"</strong> to retrieve and display rankings</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
            <strong>💡 Pro Tip:</strong> The score submission endpoint is <code>POST /v2/leaderboard/{"{leaderboardId}"}</code> with body <code>{"{ \"score\": 100 }"}</code>. 
            The leaderboard must exist before submitting scores — Nakama does not auto-create leaderboards. [^2^]
          </div>
        </div>
      </div>
    </div>
  );
}
