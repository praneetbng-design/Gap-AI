import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Flame, Calendar, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, student, teacher, mentor } = useAuth();

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Diamond': return 'from-cyan-500 to-blue-600 text-white';
      case 'Platinum': return 'from-slate-300 to-indigo-400 text-slate-900';
      case 'Gold': return 'from-amber-400 to-yellow-600 text-slate-950 font-bold';
      case 'Silver': return 'from-slate-200 to-slate-400 text-slate-800';
      default: return 'from-amber-700 to-amber-900 text-amber-100'; // Bronze / Iron
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {/* Academic context badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>CSE-AIML | 5th Sem (2026–27)</span>
        </div>

        {/* Student Specific Badges */}
        {student && (
          <>
            {/* Streak */}
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold border border-orange-200 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{student.streakDays} Day Streak</span>
            </div>

            {/* XP & Rank */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r ${getRankBadgeColor(student.currentRank)} rounded-full text-xs font-semibold shadow-sm`}>
              <Award className="h-3.5 w-3.5" />
              <span>{student.currentRank} • {student.xpPoints} XP</span>
            </div>
          </>
        )}

        {/* Mentor Specific Badge */}
        {mentor && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold border border-amber-200">
            <span>{mentor.batchName}</span>
          </div>
        )}

        {/* Teacher Specific Badge */}
        {teacher && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold border border-emerald-200">
            <span>Subject Faculty</span>
          </div>
        )}
      </div>
    </header>
  );
};
