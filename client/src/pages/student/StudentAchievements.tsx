import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Award, Zap, Flame, CheckCircle2, TrendingUp, Trophy, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentAchievements: React.FC = () => {
  const { student } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [xpHistory, setXpHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest('/gamification/achievements'),
      apiRequest('/gamification/xp-history')
    ])
      .then(([achs, hist]) => {
        setAchievements(achs);
        setXpHistory(hist);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading achievements & badges...</div>;
  }

  const iconMap: Record<string, any> = {
    Zap, Flame, Award, CheckCircle2, TrendingUp, Trophy
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Achievements & Learning Rewards</h1>
        <p className="text-xs text-slate-500 mt-1">
          Earn recognition for academic effort, topic mastery, and consistent practice habits
        </p>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((ach) => {
          const isUnlocked = Boolean(ach.unlockedAt);
          const IconComponent = iconMap[ach.badgeIcon] || Award;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all ${
                isUnlocked
                  ? 'bg-white border-amber-200/90 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-xl border ${
                    isUnlocked
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-200 text-slate-400 border-slate-300'
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                {isUnlocked ? (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 flex items-center space-x-1">
                    <Lock className="h-3 w-3 mr-0.5" /> Locked
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-3">{ach.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.description}</p>

              {isUnlocked && (
                <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 font-medium">
                  Earned on: {new Date(ach.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* XP Transaction History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">XP Points Transaction Ledger</h3>
        <div className="space-y-2">
          {xpHistory.length > 0 ? (
            xpHistory.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">{tx.reason}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  +{tx.amount} XP
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No XP transactions logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
