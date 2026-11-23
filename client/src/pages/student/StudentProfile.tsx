import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, student, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setUpdating(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMsg({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setUpdating(false);
    }
  };

  if (!user || !student) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Official institutional student registration and account security</p>
      </div>

      {/* Official Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {student.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{student.fullName}</h2>
            <p className="text-xs text-slate-500 font-mono font-medium">USN: {student.usn}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {student.enrollmentStatus} Student
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500">Institution:</span>
            <p className="font-bold text-slate-900 mt-0.5">Dr. T. Thimmaiah Institute of Technology</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Department:</span>
            <p className="font-bold text-slate-900 mt-0.5">Computer Science & Engineering (AIML)</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Current Semester & Year:</span>
            <p className="font-bold text-slate-900 mt-0.5">Semester 5 • Academic Year 2026–27</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Assigned Mentor & Batch:</span>
            <p className="font-bold text-slate-900 mt-0.5">{student.mentorName || 'Dr. Ezhilan R'} ({student.mentorBatch || 'BATCH 1'})</p>
          </div>
        </div>
      </div>

      {/* Security: Update Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2.5 mb-4">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Security Credentials</h3>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl text-xs mb-4 flex items-center space-x-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
