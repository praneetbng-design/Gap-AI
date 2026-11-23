import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Users, Search, ArrowRight, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MentorStudentsProps {
  onSelectStudent: (studentId: string) => void;
}

export const MentorStudents: React.FC<MentorStudentsProps> = ({ onSelectStudent }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/mentor/students')
      .then((data) => setStudents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading your assigned mentor batch students...</div>;
  }

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.usn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Mentee Batch Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Students assigned to your mentorship cohort • Click any student to inspect detailed AI growth profile
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or USN..."
            className="w-64 px-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <Search className="h-4 w-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Student Details</th>
              <th className="px-5 py-3.5">USN</th>
              <th className="px-5 py-3.5">Rank Tier</th>
              <th className="px-5 py-3.5">Weak Topics</th>
              <th className="px-5 py-3.5">Tasks Completed</th>
              <th className="px-5 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((st) => (
              <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">{st.fullName}</td>
                <td className="px-5 py-3.5 font-mono text-slate-600">{st.usn}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[10px]">
                    {st.currentRank} ({st.xpPoints} XP)
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {st.weakTopicsCount > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] flex items-center w-max space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{st.weakTopicsCount} Topics Flagged</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium text-[11px] flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>On Track</span>
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  {st.tasksCompleted} / {st.tasksCompleted + st.tasksPending} tasks
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onSelectStudent(st.id)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>Profile & Interventions</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
