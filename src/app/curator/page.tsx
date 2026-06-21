"use client";

import { useState } from 'react';
import { useTheme } from '../components/theme-provider';
import { curatorRequests, CuratorRequest } from '../lib/dummy-data';

export default function CuratorPage() {
  const { theme } = useTheme();
  const [requests, setRequests] = useState(curatorRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

  const handleReview = (id: number, action: 'accept' | 'reject') => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected' } : req
    ));
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'reviewed') return req.status !== 'pending';
    return true;
  });

  return (
    <div className={`flex-1 ${theme.bg} ${theme.text} overflow-y-auto pb-24 md:pb-20 p-4 md:p-6`}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">🎧 Curator Center</h1>
            <p className={`${theme.textSecondary} mt-1`}>Review tracks and earn rewards</p>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${theme.bgTertiary}`}>
            <span className="text-2xl">⭐</span>
            <div>
              <p className={`text-xs ${theme.textSecondary}`}>Curator Rating</p>
              <p className="font-bold">4.8/5.0</p>
            </div>
          </div>
        </div>

        {/* Curator Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Reviews Today</p>
            <p className="text-2xl font-bold mt-1">7/10</p>
          </div>
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Points Earned</p>
            <p className="text-2xl font-bold mt-1">+175</p>
          </div>
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Acceptance Rate</p>
            <p className="text-2xl font-bold mt-1">68%</p>
          </div>
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Playlists Managed</p>
            <p className="text-2xl font-bold mt-1">3</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'reviewed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? `${theme.accentBg} text-white` 
                  : `${theme.bgCard} ${theme.text} hover:${theme.cardHover}`
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>}
            </button>
          ))}
        </div>

        {/* Review Requests */}
        <section>
          <h2 className="text-xl font-bold mb-4">📬 Track Submissions</h2>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl ${theme.bgCard} ${theme.border} border ${theme.textSecondary}`}>
                <p className="text-lg">🎉 All caught up!</p>
                <p className="mt-1">No pending submissions. Check back later.</p>
              </div>
            ) : (
              filteredRequests.map((req) => (
                <div key={req.id} className={`p-4 md:p-5 rounded-2xl ${theme.bgCard} ${theme.border} border`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Track Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={req.track.cover} alt={req.track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{req.track.title}</p>
                        <p className={`text-sm ${theme.textSecondary}`}>{req.artist}</p>
                        <p className={`text-xs ${theme.textSecondary} mt-1`}>{req.track.duration} • {req.budget} pts budget</p>
                      </div>
                    </div>
                    
                    {/* Message */}
                    <div className={`flex-1 p-3 rounded-xl ${theme.bgTertiary} text-sm ${theme.textSecondary}`}>
                      "{req.message}"
                    </div>
                    
                    {/* Actions */}
                    {req.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(req.id, 'reject')}
                          className={`px-4 py-2 rounded-lg font-medium ${theme.bgSecondary} ${theme.text} hover:bg-red-500/20 hover:text-red-400 transition-colors`}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleReview(req.id, 'accept')}
                          className={`px-4 py-2 rounded-lg font-medium ${theme.accentBg} text-white hover:opacity-90 transition-opacity`}
                        >
                          Accept +25 pts
                        </button>
                      </div>
                    ) : (
                      <span className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {req.status === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
                      </span>
                    )}
                  </div>
                  
                  {/* Quick Listen */}
                  {req.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <button className={`flex items-center gap-2 text-sm ${theme.accent} hover:underline`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        Preview track (30s)
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* My Playlists */}
        <section>
          <h2 className="text-xl font-bold mb-4">📚 My Playlists</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Late Night Vibes", tracks: 42, followers: "2.1K", genre: "Chill" },
              { name: "Workout Energy", tracks: 28, followers: "890", genre: "Electronic" },
              { name: "Sunday Jazz", tracks: 35, followers: "1.4K", genre: "Jazz" },
            ].map((playlist, i) => (
              <div key={i} className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border hover:${theme.cardHover} transition-all cursor-pointer`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${theme.accentBg} flex items-center justify-center text-white font-bold`}>
                    {playlist.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{playlist.name}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{playlist.genre}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme.textSecondary}>{playlist.tracks} tracks</span>
                  <span className={theme.accent}>{playlist.followers} followers</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Curator Tips */}
        <section className={`p-5 rounded-2xl ${theme.bgTertiary} ${theme.border} border`}>
          <h3 className="font-bold mb-3">💡 Curator Tips</h3>
          <ul className={`space-y-2 text-sm ${theme.textSecondary}`}>
            <li>• Listen to at least 60 seconds before reviewing</li>
            <li>• Accept tracks that match your playlist's vibe</li>
            <li>• Quality reviews earn bonus points and higher ratings</li>
            <li>• You can review up to 10 tracks per day for max earnings</li>
          </ul>
        </section>
      </div>
    </div>
  );
}