import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Users, AlertTriangle, TrendingUp, ShieldCheck, ArrowRight, Clock } from 'lucide-react';

interface MentorDashboardProps {
  onNavigate: (tab: string, studentId?: string) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/mentor/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading mentor batch dashboard...</div>;
  }

  if (!data) return null;

  const { mentor, batchName, totalStudents, batchAverage, strugglingStudents, improvingStudents, pendingFollowups } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
            Faculty Mentorship Portal • {batchName}
          </span>
          <h1 className="text-2xl font-extrabold mt-1">Mentor: {mentor?.fullName || 'Faculty Mentor'}</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Dr. T. Thimmaiah Institute of Technology • CSE-AIML 5th Semester • {totalStudents} Assigned Mentees
          </p>
        </div>

        <button
          onClick={() => onNavigate('interventions')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Intervention Tracker</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Mentees"
          value={`${totalStudents} Students`}
          subtitle={`Exclusive to ${batchName}`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Batch Avg Score"
          value={`${batchAverage}%`}
          subtitle="Across assessed subjects"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Struggling Students"
          value={`${strugglingStudents.length} Students`}
          subtitle="Require academic counseling"
          icon={AlertTriangle}
          color={strugglingStudents.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Pending Follow-ups"
          value={`${pendingFollowups.length} Scheduled`}
          subtitle="Interventions in progress"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Struggling Students Requiring Immediate Attention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Mentees Requiring Support</h2>
              <p className="text-xs text-slate-500">Students with identified topic weaknesses</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-indigo-600"
            >
              View Batch
            </button>
          </div>

          <div className="space-y-3">
            {strugglingStudents.map((st: any) => (
              <div
                key={st.id}
                onClick={() => onNavigate('students', st.id)}
                className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{st.fullName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">USN: {st.usn}</p>
                  {st.weakTopics && st.weakTopics.length > 0 && (
                    <p className="text-[10px] text-rose-700 font-medium mt-1">
                      Weakness: {st.weakTopics.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right flex items-center space-x-2">
                  <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                    {st.averageMarks}%
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improving Students & Scheduled Follow-ups */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">Scheduled Mentorship Follow-ups</h2>
            {pendingFollowups.length > 0 ? (
              <div className="space-y-3">
                {pendingFollowups.map((f: any) => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{f.studentName} ({f.usn})</h4>
                      <p className="text-[11px] text-slate-500">{f.interventionType} • Goal: {f.goal}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {f.scheduledFollowup}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No follow-ups pending.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">High Progress Mentees</h2>
            <div className="space-y-2">
              {improvingStudents.slice(0, 4).map((st: any) => (
                <div key={st.id} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{st.fullName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">{st.usn}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {st.averageMarks}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
