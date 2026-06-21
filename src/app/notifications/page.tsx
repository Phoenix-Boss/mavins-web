"use client";

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { notifications, Notification } from '@/app/lib/dummy-data';

export default function NotificationsPage() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className={`flex-1 ${theme.bg} ${theme.text} overflow-y-auto pb-24 md:pb-20 p-4 md:p-6`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">🔔 Notifications</h1>
            <p className={`${theme.textSecondary} mt-1`}>Stay updated on your earnings and promotions</p>
          </div>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${theme.accentBg} text-white hover:opacity-90 transition-opacity`}>
            Mark all read
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? `${theme.accentBg} text-white` 
                  : `${theme.bgCard} ${theme.text} hover:${theme.cardHover}`
              }`}
            >
              {f === 'all' ? 'All' : 'Unread'}
              {f === 'unread' && <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 rounded-full">{notifications.filter(n => !n.read).length}</span>}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl ${theme.bgCard} ${theme.border} border ${theme.textSecondary}`}>
              <p className="text-lg">✨ All caught up!</p>
              <p className="mt-1">No new notifications</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border ${!notif.read ? `border-l-4 border-l-amber-500 ${theme.border}` : ''} hover:${theme.cardHover} transition-all cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.bgTertiary} flex items-center justify-center text-xl flex-shrink-0`}>
                    {notif.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{notif.title}</p>
                      <span className={`text-xs ${theme.textSecondary} whitespace-nowrap`}>{notif.timestamp}</span>
                    </div>
                    <p className={`text-sm ${theme.textSecondary} mt-1`}>{notif.message}</p>
                    
                    {/* Action Buttons for specific types */}
                    {notif.type === 'earning' && notif.message.includes('Bonus') && (
                      <button className={`mt-3 px-3 py-1.5 text-sm rounded-lg ${theme.accentBg} text-white hover:opacity-90 transition-opacity`}>
                        Claim Bonus
                      </button>
                    )}
                    {notif.type === 'promotion' && (
                      <button className={`mt-3 px-3 py-1.5 text-sm rounded-lg ${theme.bgSecondary} ${theme.text} hover:${theme.cardHover} transition-colors`}>
                        View Track
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Settings */}
        <section className={`p-5 rounded-2xl ${theme.bgTertiary} ${theme.border} border`}>
          <h3 className="font-bold mb-4">🔧 Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { label: "Earning alerts", desc: "Get notified when you earn points", enabled: true },
              { label: "Promotion updates", desc: "Track your playlist push campaigns", enabled: true },
              { label: "Social activity", desc: "New followers and interactions", enabled: false },
              { label: "Platform announcements", desc: "Important updates from SoundWave", enabled: true },
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{pref.label}</p>
                  <p className={`text-sm ${theme.textSecondary}`}>{pref.desc}</p>
                </div>
                <button className={`w-12 h-6 rounded-full relative transition-colors ${pref.enabled ? theme.accentBg : theme.bgSecondary}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${pref.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
