"use client";

import { useTheme } from '../components/theme-provider';
import { adminCampaigns, earningRules } from '../lib/dummy-data';

export default function AdminPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'campaigns' | 'users'>('overview');

  return (
    <div className={`flex-1 ${theme.bg} ${theme.text} overflow-y-auto pb-24 md:pb-20 p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">⚙️ Admin Dashboard</h1>
            <p className={`${theme.textSecondary} mt-1`}>Platform management & configuration</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.bgTertiary} ${theme.textSecondary} text-sm`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            System Operational
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
          {(['overview', 'earnings', 'campaigns', 'users'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? `${theme.accentBg} text-white` 
                  : `${theme.bgCard} ${theme.text} hover:${theme.cardHover}`
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: "24.5K", change: "+12%" },
                { label: "Active Campaigns", value: "18", change: "+3" },
                { label: "Points Distributed", value: "1.2M", change: "+8%" },
                { label: "Pending Reviews", value: "47", change: "-5" },
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
                  <p className={`text-sm ${theme.textSecondary}`}>{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <span className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change} this week
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <section className={`p-5 rounded-2xl ${theme.bgCard} ${theme.border} border`}>
              <h3 className="font-bold mb-4">📋 Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: "New curator application", user: "MusicCurator23", time: "5 min ago" },
                  { action: "Campaign budget updated", user: "System", time: "1 hour ago" },
                  { action: "Suspicious activity flagged", user: "Auto-Detect", time: "2 hours ago" },
                  { action: "Payout processed", user: "Finance Bot", time: "3 hours ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className={`text-sm ${theme.textSecondary}`}>{item.user}</p>
                    </div>
                    <span className={`text-sm ${theme.textSecondary}`}>{item.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Earnings Rules Tab */}
        {activeTab === 'earnings' && (
          <section className={`p-5 md:p-6 rounded-2xl ${theme.bgCard} ${theme.border} border`}>
            <h3 className="font-bold text-lg mb-6">💰 Earning Rules Configuration</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Points per Minute */}
              <div>
                <label className="block text-sm font-medium mb-2">Points per Minute Listened</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={earningRules.pointsPerMinute}
                    readOnly
                    className="flex-1 accent-amber-500"
                  />
                  <span className={`font-bold ${theme.accent} w-8 text-right`}>{earningRules.pointsPerMinute}</span>
                </div>
              </div>
              
              {/* Full Listen Bonus */}
              <div>
                <label className="block text-sm font-medium mb-2">Bonus for Full Track Listen</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={earningRules.pointsPerFullListen}
                    readOnly
                    className="flex-1 accent-amber-500"
                  />
                  <span className={`font-bold ${theme.accent} w-8 text-right`}>{earningRules.pointsPerFullListen}</span>
                </div>
              </div>
              
              {/* Daily Cap */}
              <div>
                <label className="block text-sm font-medium mb-2">Daily Earning Cap per User</label>
                <input
                  type="number"
                  value={earningRules.dailyCap}
                  readOnly
                  className={`w-full px-4 py-3 rounded-xl ${theme.inputBg} ${theme.border} border ${theme.text}`}
                />
              </div>
              
              {/* Curator Review Reward */}
              <div>
                <label className="block text-sm font-medium mb-2">Points per Curator Review</label>
                <input
                  type="number"
                  value={earningRules.curatorReviewReward}
                  readOnly
                  className={`w-full px-4 py-3 rounded-xl ${theme.inputBg} ${theme.border} border ${theme.text}`}
                />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end gap-3">
              <button className={`px-5 py-2.5 rounded-lg ${theme.bgSecondary} ${theme.text} hover:${theme.cardHover} transition-colors`}>
                Cancel
              </button>
              <button className={`px-5 py-2.5 rounded-lg ${theme.accentBg} text-white font-medium hover:opacity-90 transition-opacity`}>
                Save Changes
              </button>
            </div>
          </section>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🚀 Playlist Push Campaigns</h2>
              <button className={`px-4 py-2 rounded-lg ${theme.accentBg} text-white font-medium hover:opacity-90 transition-opacity`}>
                + New Campaign
              </button>
            </div>
            
            <div className={`rounded-2xl overflow-hidden border ${theme.border}`}>
              {/* Header */}
              <div className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider ${theme.textSecondary} border-b ${theme.border}`}>
                <span>Campaign</span><span>Budget</span><span>Spent</span><span>Tracks</span><span>Status</span>
              </div>
              
              {/* Rows */}
              {adminCampaigns.map((campaign, index) => (
                <div key={campaign.id} className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center ${index !== adminCampaigns.length - 1 ? `border-b ${theme.border}` : ''}`}>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className={`text-sm ${theme.textSecondary}`}>{campaign.artist}</p>
                  </div>
                  <span>{campaign.budget.toLocaleString()} pts</span>
                  <span>{campaign.spent.toLocaleString()} pts</span>
                  <span>{campaign.tracks}</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    campaign.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    campaign.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Users Tab - Placeholder */}
        {activeTab === 'users' && (
          <section className={`p-8 text-center rounded-2xl ${theme.bgCard} ${theme.border} border ${theme.textSecondary}`}>
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <p className="text-lg">User Management Interface</p>
            <p className="mt-1">View, filter, and manage users by role, activity, or earnings</p>
            <button className={`mt-4 px-5 py-2.5 rounded-lg ${theme.accentBg} text-white font-medium hover:opacity-90 transition-opacity`}>
              Launch User Manager
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';