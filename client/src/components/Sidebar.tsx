import React from 'react';
import {
  LayoutDashboard, BookOpen, Calendar, TrendingUp, CheckSquare,
  Bot, Cpu, Trophy, Award, User, LogOut, Users, FileSpreadsheet,
  UploadCloud, BarChart3, ShieldCheck, Database, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, student, teacher, mentor, logout } = useAuth();

  if (!user) return null;

  // Student Navigation
  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'progress', label: 'My Progress', icon: TrendingUp },
    { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'automata', label: 'Learning Lab', icon: Cpu },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Teacher Navigation
  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'marks', label: 'Marks Entry', icon: FileSpreadsheet },
    { id: 'assessments', label: 'Assessments & OCR', icon: UploadCloud },
    { id: 'materials', label: 'Upload Materials', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
  ];

  // Mentor Navigation
  const mentorNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'My Batch Students', icon: Users },
    { id: 'interventions', label: 'Intervention Tracker', icon: ShieldCheck },
    { id: 'notes', label: 'Mentor Notes', icon: FileText },
    { id: 'timetable', label: 'Student Schedule', icon: Calendar },
  ];

  // Admin Navigation
  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'subjects', label: 'Subject Management', icon: BookOpen },
    { id: 'timetable', label: 'Timetable Setup', icon: Calendar },
    { id: 'reconciliation', label: 'Excel & Reconciliation', icon: Database },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  ];

  let navItems = studentNav;
  if (user.role === 'teacher') navItems = teacherNav;
  if (user.role === 'mentor') navItems = mentorNav;
  if (user.role === 'admin') navItems = adminNav;

  const getRoleBadge = () => {
    switch (user.role) {
      case 'student': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'teacher': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'mentor': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <aside className="w-64 bg-navy-900 text-white flex flex-col h-screen flex-shrink-0 select-none shadow-xl border-r border-navy-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800/80">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-bold text-lg text-white">
            G
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-white">GAP AI</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
              Dr. TTIT | CSE-AIML
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {user.role} workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-navy-800 bg-navy-900/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-indigo-400 flex-shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-100 truncate">{user.fullName}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {student ? student.usn : user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-navy-800/80">
          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getRoleBadge()}`}>
            {user.role}
          </span>
          <button
            onClick={logout}
            className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
            title="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
