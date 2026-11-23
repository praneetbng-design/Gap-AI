import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Users, Search, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      let query = `?search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (batchFilter) query += `&batch=${batchFilter}`;
      const data = await apiRequest(`/admin/students${query}`);
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter, batchFilter]);

  const handleResetPassword = async (studentId: string, usn: string) => {
    if (!confirm(`Reset password for student ${usn} back to temporary USN?`)) return;
    try {
      const res = await apiRequest(`/admin/students/${studentId}/reset-password`, {
        method: 'POST'
      });
      setActionNotice(res.message);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Enrollment Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            CSE-AIML 5th Semester • {students.length} Registered Students
          </p>
        </div>

        {actionNotice && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or USN..."
            className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <Search className="h-4 w-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Provisional">Provisional</option>
        </select>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Batches</option>
          <option value="BATCH 1">Batch 1 (Dr. Ezhilan R)</option>
          <option value="BATCH 2">Batch 2 (Prof. Inbalatha K)</option>
          <option value="BATCH 3">Batch 3 (Prof. Prathyusha)</option>
          <option value="BATCH 4">Batch 4 (Prof. Malini)</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-semibold">Loading student roster...</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">USN</th>
                <th className="px-5 py-3.5">Student Name</th>
                <th className="px-5 py-3.5">Batch & Mentor</th>
                <th className="px-5 py-3.5">Rank & XP</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-indigo-700">{st.usn}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{st.fullName}</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="font-semibold text-slate-800">{st.mentorBatch}</span> • {st.mentorName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-700">{st.currentRank}</span> ({st.xpPoints} XP)
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      st.enrollmentStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {st.enrollmentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleResetPassword(st.id, st.usn)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 rounded-lg border border-slate-200 flex items-center space-x-1 ml-auto"
                      title="Reset password back to temporary USN"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Reset Password</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
