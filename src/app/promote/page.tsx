"use client";

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { userPromotions, Promotion } from '@/app/lib/dummy-data';

export default function PromotePage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    trackUrl: '',
    genre: '',
    targetPlaylists: 25,
    budget: 250,
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Track submitted for promotion! 🎉');
      setFormData({ trackUrl: '', genre: '', targetPlaylists: 25, budget: 250, description: '' });
    }, 1500);
  };

  const statusColors: Record<Promotion['status'], string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    completed: 'bg-blue-500/20 text-blue-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className={`flex-1 ${theme.bg} ${theme.text} overflow-y-auto pb-24 md:pb-20 p-4 md:p-6`}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">🚀 Promote Your Track</h1>
          <p className={`${theme.textSecondary} mt-1`}>Get your music heard by thousands of listeners</p>
        </div>

        {/* How Playlist Push Works */}
        <section className={`p-5 rounded-2xl ${theme.bgTertiary} ${theme.border} border`}>
          <h3 className="font-bold mb-4">📋 How It Works</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: 1, title: "Submit Track", desc: "Upload your song & set preferences" },
              { step: 2, title: "Set Budget", desc: "Choose how many playlists to target" },
              { step: 3, title: "Get Reviewed", desc: "Curators review & add to playlists" },
              { step: 4, title: "Earn Streams", desc: "Track performance in real-time" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-10 h-10 mx-auto rounded-full ${theme.accentBg} text-white flex items-center justify-center font-bold mb-2`}>
                  {item.step}
                </div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className={`text-xs ${theme.textSecondary} mt-1`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Submission Form */}
        <section className={`p-5 md:p-6 rounded-2xl ${theme.bgCard} ${theme.border} border`}>
          <h3 className="font-bold text-lg mb-5">📤 Submit a New Track</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Track URL */}
            <div>
              <label className="block text-sm font-medium mb-2">Track URL or Upload</label>
              <input
                type="url"
                placeholder="https://soundcloud.com/artist/track or upload file"
                value={formData.trackUrl}
                onChange={(e) => setFormData({ ...formData, trackUrl: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl ${theme.bgTertiary} ${theme.border} border ${theme.text} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                required
              />
            </div>

            {/* Genre & Budget Row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${theme.bgTertiary} ${theme.border} border ${theme.text} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  required
                >
                  <option value="">Select genre...</option>
                  <option value="electronic">Electronic</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="pop">Pop</option>
                  <option value="rnb">R&B/Soul</option>
                  <option value="rock">Rock</option>
                  <option value="jazz">Jazz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget (Points)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="flex-1 accent-amber-500"
                  />
                  <span className={`font-bold ${theme.accent} w-16 text-right`}>{formData.budget}</span>
                </div>
                <p className={`text-xs ${theme.textSecondary} mt-1`}>~{Math.floor(formData.budget * 0.001 * 100) / 100} USD equivalent</p>
              </div>
            </div>

            {/* Target Playlists */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Playlists</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={formData.targetPlaylists}
                  onChange={(e) => setFormData({ ...formData, targetPlaylists: Number(e.target.value) })}
                  className="flex-1 accent-amber-500"
                />
                <span className={`font-bold ${theme.accent} w-12 text-right`}>{formData.targetPlaylists}</span>
              </div>
              <p className={`text-xs ${theme.textSecondary} mt-1`}>Estimated reach: {(formData.targetPlaylists * 450).toLocaleString()} listeners</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description for Curators</label>
              <textarea
                placeholder="Tell curators why your track fits their playlist..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl ${theme.bgTertiary} ${theme.border} border ${theme.text} focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl ${theme.accentBg} text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Submitting...
                </>
              ) : (
                <>🚀 Submit for Promotion</>
              )}
            </button>
          </form>
        </section>

        {/* Active Promotions */}
        <section>
          <h2 className="text-xl font-bold mb-4">📊 Your Promotions</h2>
          <div className={`rounded-2xl overflow-hidden border ${theme.border}`}>
            {userPromotions.length === 0 ? (
              <div className={`p-8 text-center ${theme.textSecondary}`}>
                <p>No active promotions yet</p>
                <p className="text-sm mt-1">Submit your first track to get started!</p>
              </div>
            ) : (
              userPromotions.map((promo, index) => (
                <div key={promo.id} className={`p-4 md:p-5 ${index !== userPromotions.length - 1 ? `border-b ${theme.border}` : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${theme.bgTertiary} flex items-center justify-center text-xl`}>🎵</div>
                      <div>
                        <p className="font-medium">{promo.trackTitle}</p>
                        <p className={`text-sm ${theme.textSecondary}`}>{promo.artist} • {promo.genre}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{promo.budget} pts</p>
                        <p className={`text-sm ${theme.textSecondary}`}>{promo.targetPlaylists} playlists</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[promo.status]}`}>
                        {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress for active promotions */}
                  {promo.status === 'active' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={theme.textSecondary}>Playlist placements</span>
                        <span className={theme.accent}>12/{promo.targetPlaylists}</span>
                      </div>
                      <div className={`h-2 ${theme.bgSecondary} rounded-full overflow-hidden`}>
                        <div className={`h-full ${theme.accentBg} rounded-full`} style={{ width: `${(12 / promo.targetPlaylists) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className={theme.textSecondary}>Spins generated: 2.4K</span>
                        <span className={theme.success}>+180 followers</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Pricing Info */}
        <section className={`p-5 rounded-2xl ${theme.bgTertiary} ${theme.border} border`}>
          <h3 className="font-bold mb-3">💰 Pricing Guide</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Starter</p>
              <p className={theme.textSecondary}>50 pts • 5 playlists</p>
              <p className={theme.textSecondary}>~500 estimated spins</p>
            </div>
            <div>
              <p className="font-medium">Growth</p>
              <p className={theme.textSecondary}>250 pts • 25 playlists</p>
              <p className={theme.textSecondary}>~2,500 estimated spins</p>
            </div>
            <div>
              <p className="font-medium">Pro</p>
              <p className={theme.textSecondary}>1000 pts • 100 playlists</p>
              <p className={theme.textSecondary}>~10,000 estimated spins</p>
            </div>
          </div>
          <p className={`text-xs ${theme.textSecondary} mt-4`}>* Actual results may vary based on track quality and curator selection</p>
        </section>
      </div>
    </div>
  );
}
