import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Users, BookOpen, ShieldCheck, ArrowRight, Lock, User, AlertCircle, Info } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [portal, setPortal] = useState<'student' | 'teacher' | 'mentor' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('ALLEN MELVIN A');
  const [password, setPassword] = useState('1GV24C1001');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePortalSwitch = (p: 'student' | 'teacher' | 'mentor' | 'admin') => {
    setPortal(p);
    setError(null);
    if (p === 'student') {
      setIdentifier('ALLEN MELVIN A');
      setPassword('1GV24C1001');
    } else if (p === 'teacher') {
      setIdentifier('prof.sheryl.betsy@gapai.dttit.edu');
      setPassword('Teacher@2026');
    } else if (p === 'mentor') {
      setIdentifier('dr.ezhilan.r.mentor@gapai.dttit.edu');
      setPassword('Mentor@2026');
    } else if (p === 'admin') {
      setIdentifier('admin@gapai.dttit.edu');
      setPassword('Admin@2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(portal, identifier.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Institution Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 mb-6">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-500/20 mb-4 font-bold text-2xl">
          G
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">GAP AI</h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Academic Growth & Performance Intelligence
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Dr. T. Thimmaiah Institute of Technology • Dept of CSE (AIML)
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Portal Tabs */}
          <div className="grid grid-cols-4 bg-slate-100/80 p-1.5 border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handlePortalSwitch('student')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
                portal === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('mentor')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
                portal === 'mentor'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Mentor</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('teacher')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
                portal === 'teacher'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl transition-all ${
                portal === 'admin'
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </button>
          </div>

          <div className="p-8">
            {/* Context Info Box */}
            <div className="mb-6 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start space-x-2.5">
              <Info className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                {portal === 'student' && (
                  <p>
                    <strong>Student Authentication:</strong> Enter your exact registered name as username and your <strong>USN</strong> as initial password.
                  </p>
                )}
                {portal === 'mentor' && (
                  <p>
                    <strong>Mentor Portal:</strong> Access assigned batches (Batches 1–4) and track individual student academic progress.
                  </p>
                )}
                {portal === 'teacher' && (
                  <p>
                    <strong>Teacher Portal:</strong> Enter topic-wise assessment scores, upload answer scripts for OCR analysis, and manage materials.
                  </p>
                )}
                {portal === 'admin' && (
                  <p>
                    <strong>Institutional Admin:</strong> Academic setup, discrepancy reconciliation, user management, and timetable editing.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {portal === 'student' ? "Student's Exact Name" : (portal === 'admin' ? 'Admin Email / Username' : 'Registered Email / Username')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={portal === 'student' ? 'e.g. ALLEN MELVIN A' : 'e.g. faculty@gapai.dttit.edu'}
                    className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                    required
                  />
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {portal === 'student' ? "Password (Student's USN)" : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={portal === 'student' ? 'e.g. 1GV24C1001' : '••••••••'}
                    className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                    required
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign in to ${portal.charAt(0).toUpperCase() + portal.slice(1)} Portal`}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Demo Fillers for Fast Evaluation */}
            <div className="mt-8 pt-5 border-t border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Quick Evaluation Accounts (Click to Fill)
              </p>
              <div className="flex flex-wrap gap-2">
                {portal === 'student' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('ALLEN MELVIN A'); setPassword('1GV24C1001'); }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                    >
                      Allen Melvin (Batch 1 - Weak in Waterfall)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('ANJANA HANAMANT PUJERI'); setPassword('1GV24C1002'); }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                    >
                      Anjana (Batch 1 - Weak in Subnetting)
                    </button>
                  </>
                )}
                {portal === 'mentor' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('dr.ezhilan.r.mentor@gapai.dttit.edu'); setPassword('Mentor@2026'); }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                    >
                      Dr. Ezhilan R (Batch 1 - 17 students)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('prof.inbalatha.k.mentor@gapai.dttit.edu'); setPassword('Mentor@2026'); }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                    >
                      Prof. Inbalatha K (Batch 2 - 17 students)
                    </button>
                  </>
                )}
                {portal === 'teacher' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('prof.sheryl.betsy@gapai.dttit.edu'); setPassword('Teacher@2026'); }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                    >
                      Prof. Sheryl Betsy (Software Eng & Music)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('mrs.malini.p@gapai.dttit.edu'); setPassword('Teacher@2026'); }}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                    >
                      Mrs. Malini P (Computer Networks & Lab)
                    </button>
                  </>
                )}
                {portal === 'admin' && (
                  <button
                    type="button"
                    onClick={() => { setIdentifier('admin@gapai.dttit.edu'); setPassword('Admin@2026'); }}
                    className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 font-medium"
                  >
                    Institutional Admin (Full System Access)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
