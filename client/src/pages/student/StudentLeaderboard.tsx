import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Trophy, Flame, Award, TrendingUp, CheckCircle, Medal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentLeaderboard: React.FC = () => {
  const { student } = useAuth();
  const [boardType, setBoardType] = useState<string>('overall');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async (type: string) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/gamification/leaderboard?type=${type}`);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(boardType);
  }, [boardType]);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="font-mono font-bold text-slate-500 text-xs">#{rank}</span>;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
      case 'Platinum': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'Gold': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Silver': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-amber-800 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <span>Academic Growth Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Celebrating learning consistency, task completion, and academic improvement in CSE-AIML
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setBoardType('overall')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              boardType === 'overall' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overall XP
          </button>
          <button
            onClick={() => setBoardType('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              boardType === 'weekly' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Tasks
          </button>
          <button
            onClick={() => setBoardType('improved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              boardType === 'improved' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Most Improved
          </button>
          <button
            onClick={() => setBoardType('consistency')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              boardType === 'consistency' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consistency Streak
          </button>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold">Loading leaderboard rankings...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 w-16 text-center">Rank</th>
                <th className="px-5 py-3.5">Student Details</th>
                <th className="px-5 py-3.5">Rank Tier</th>
                <th className="px-5 py-3.5">Total XP</th>
                <th className="px-5 py-3.5">Streak</th>
                <th className="px-5 py-3.5">Tasks Completed</th>
                <th className="px-5 py-3.5">Improvement Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {entries.map((item) => {
                const isCurrentStudent = student && item.studentId === student.id;
                return (
                  <tr
                    key={item.studentId}
                    className={`transition-colors ${
                      isCurrentStudent
                        ? 'bg-indigo-50/80 font-semibold'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-center">
                      {getRankMedal(item.rank)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{item.studentName}</span>
                        {isCurrentStudent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{item.usn}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(item.rankTier)}`}>
                        {item.rankTier}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {item.xpPoints} XP
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center space-x-1 text-orange-600 font-semibold">
                        <Flame className="h-3.5 w-3.5 fill-orange-500" />
                        <span>{item.streakDays}d</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {item.completedTasks} tasks
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${item.improvementPercentage}%` }}
                          />
                        </div>
                        <span className="text-slate-900 font-bold">{item.improvementPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
