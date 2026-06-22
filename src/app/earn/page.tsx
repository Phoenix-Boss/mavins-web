"use client";

import { useState } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { dailyTasks, earningRules, currentUser } from '@/app/lib/dummy-data';

export default function EarnPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'rules'>('tasks');
  const [points, setPoints] = useState(currentUser.balance);
  const [streak, setStreak] = useState(currentUser.streak);
  const [completedTasks, setCompletedTasks] = useState<number[]>(
    dailyTasks.filter((task: any) => task.completed).map((task: any) => task.id)
  );

  const handleCompleteTask = (taskId: number, reward: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      setPoints(points + reward);
    }
  };

  const getTaskStatus = (taskId: number) => {
    if (completedTasks.includes(taskId)) return 'completed';
    return 'pending';
  };

  // Calculate total points earned today from completed tasks
  const todayEarnings = dailyTasks
    .filter((task: any) => completedTasks.includes(task.id))
    .reduce((sum: number, task: any) => sum + task.reward, 0);

  // Calculate weekly earnings (approximate)
  const weeklyEarnings = Math.round(todayEarnings * 3.5);

  // Calculate next reward threshold
  const nextReward = 5000 - points;

  return (
    <div className={`flex-1 ${theme.bg} ${theme.text} overflow-y-auto pb-24 md:pb-20 p-4 md:p-6`}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">💰 Earn Points</h1>
            <p className={`${theme.textSecondary} mt-1`}>Complete tasks and earn rewards</p>
          </div>
          <div className={`flex items-center gap-4 px-4 py-2 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <div className="text-center">
              <p className={`text-xs ${theme.textSecondary}`}>Your Points</p>
              <p className="text-2xl font-bold text-amber-400">{points.toLocaleString()}</p>
            </div>
            <div className="w-px h-10 bg-zinc-700"></div>
            <div className="text-center">
              <p className={`text-xs ${theme.textSecondary}`}>Day Streak</p>
              <p className="text-2xl font-bold text-emerald-400">🔥 {streak}</p>
            </div>
          </div>
        </div>

        {/* Earning Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Today's Earnings</p>
            <p className="text-xl font-bold mt-1 text-emerald-400">+{todayEarnings} pts</p>
          </div>
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>This Week</p>
            <p className="text-xl font-bold mt-1 text-emerald-400">+{weeklyEarnings} pts</p>
          </div>
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Tasks Completed</p>
            <p className="text-xl font-bold mt-1">{completedTasks.length}/{dailyTasks.length}</p>
          </div>
          <div className={`p-4 rounded-xl ${theme.bgCard} ${theme.border} border`}>
            <p className={`text-sm ${theme.textSecondary}`}>Next Reward</p>
            <p className="text-xl font-bold mt-1 text-amber-400">{nextReward > 0 ? nextReward : 'Maxed!'} pts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
          {(['tasks', 'history', 'rules'] as const).map((tab: any) => (
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

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <section>
            <h2 className="text-xl font-bold mb-4">📋 Daily Tasks</h2>
            <div className="space-y-4">
              {dailyTasks.map((task: any) => {
                const status = getTaskStatus(task.id);
                const progressPercent = Math.round((task.progress / task.max) * 100);
                const isCompleted = status === 'completed';
                
                return (
                  <div
                    key={task.id}
                    className={`p-4 md:p-5 rounded-2xl ${theme.bgCard} ${theme.border} border ${
                      isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${theme.bgTertiary} flex items-center justify-center text-2xl flex-shrink-0`}>
                            {task.type === 'daily' && '📅'}
                            {task.type === 'weekly' && '📊'}
                            {task.type === 'streak' && '🔥'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{task.title}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${theme.bgTertiary} ${theme.textSecondary}`}>
                                {task.type}
                              </span>
                            </div>
                            <p className={`text-sm ${theme.textSecondary}`}>{task.description}</p>
                            <p className={`text-xs ${theme.textSecondary} mt-1`}>+{task.reward} pts</p>
                          </div>
                        </div>
                        {isCompleted ? (
                          <span className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium whitespace-nowrap">
                            ✓ Completed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCompleteTask(task.id, task.reward)}
                            className={`px-4 py-2 rounded-lg font-medium ${theme.accentBg} text-white hover:opacity-90 transition-opacity whitespace-nowrap`}
                          >
                            Complete Task
                          </button>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {task.progress < task.max && (
                        <div className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={theme.textSecondary}>Progress</span>
                            <span className={theme.textSecondary}>{task.progress}/{task.max}</span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${theme.bgTertiary} overflow-hidden`}>
                            <div 
                              className="h-full rounded-full bg-amber-500 transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <section className={`p-5 md:p-6 rounded-2xl ${theme.bgCard} ${theme.border} border`}>
            <h3 className="font-bold text-lg mb-6">📊 Earnings History</h3>
            <div className="space-y-4">
              {dailyTasks.map((task, index) => {
                const isCompleted = completedTasks.includes(task.id);
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between py-3 border-b ${theme.border} last:border-0`}
                  >
                    <div>
                      <p className="font-medium">{isCompleted ? '✅' : '⏳'} {task.title}</p>
                      <p className={`text-sm ${theme.textSecondary}`}>
                        {isCompleted ? 'Completed' : 'Pending'} • {task.type}
                      </p>
                    </div>
                    <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {isCompleted ? `+${task.reward}` : '0'} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <section className={`p-5 md:p-6 rounded-2xl ${theme.bgCard} ${theme.border} border`}>
            <h3 className="font-bold text-lg mb-6">📖 Earning Rules</h3>
            <div className="grid md:grid-cols-2 gap-6">
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
              
              <div>
                <label className="block text-sm font-medium mb-2">Daily Earning Cap per User</label>
                <input
                  type="number"
                  value={earningRules.dailyCap}
                  readOnly
                  className={`w-full px-4 py-3 rounded-xl ${theme.bgTertiary} ${theme.border} border ${theme.text}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Points per Curator Review</label>
                <input
                  type="number"
                  value={earningRules.curatorReviewReward}
                  readOnly
                  className={`w-full px-4 py-3 rounded-xl ${theme.bgTertiary} ${theme.border} border ${theme.text}`}
                />
              </div>
            </div>

            {/* Streak Bonuses */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h4 className="font-medium mb-3">🔥 Streak Bonuses</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(earningRules.streakBonus).map(([days, bonus]) => (
                  <div key={days} className={`p-3 rounded-xl ${theme.bgTertiary} text-center`}>
                    <p className="text-sm font-medium">{days} Days</p>
                    <p className="text-lg font-bold text-amber-400">+{bonus} pts</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h4 className="font-medium mb-3">💡 Tips to Maximize Earnings</h4>
              <ul className={`space-y-2 text-sm ${theme.textSecondary}`}>
                <li>• Complete daily tasks to build your streak bonus</li>
                <li>• Listen to full tracks for bonus points</li>
                <li>• Review tracks as a curator for higher rewards</li>
                <li>• Share tracks with your network for referral bonuses</li>
                <li>• Maintain your streak for bonus multipliers</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}




