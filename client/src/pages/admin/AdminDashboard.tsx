import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Users, BookOpen, Database, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/admin/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading administrator dashboard...</div>;
  }

  if (!data) return null;

  const { institution, counts, reconciliationIssues, recentAuditLogs } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Institutional Administration
          </span>
          <h1 className="text-2xl font-extrabold mt-1">{institution.name}</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Department: {institution.department} ({institution.code}) • Semester {institution.semester} ({institution.academicYear})
          </p>
        </div>

        <button
          onClick={() => onNavigate('reconciliation')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
        >
          <Database className="h-4 w-4" />
          <span>Excel Reconciliation</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={counts.students}
          subtitle={`${counts.activeStudents} Active • ${counts.provisionalStudents} Provisional`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Teaching Faculty"
          value={`${counts.teachers} Teachers`}
          subtitle="Assigned across 10 courses"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Mentor Cohorts"
          value={`${counts.mentors} Batches`}
          subtitle="Batches 1–4 preloaded"
          icon={ShieldCheck}
          color="blue"
        />
        <StatCard
          title="Discrepancies"
          value={`${counts.reconciliationPending} Flagged`}
          subtitle="Roster vs Mentor mapping"
          icon={AlertCircle}
          color={counts.reconciliationPending > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Discrepancy Alert */}
      {reconciliationIssues.length > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Institutional Data Reconciliation Notice
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                The student roster reports 65 students, while the mentor workbook reports 66 assignments.
                USN <strong>{reconciliationIssues[0].usn}</strong> ({reconciliationIssues[0].studentName}) is in {reconciliationIssues[0].batch} ({reconciliationIssues[0].mentorName}) but absent from the active roster.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="flex-shrink-0 px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            Resolve Discrepancy →
          </button>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">System Activity & Audit Ledger</h2>
          <button onClick={() => onNavigate('audit')} className="text-xs font-semibold text-indigo-600">
            View All Logs
          </button>
        </div>

        <div className="space-y-2">
          {recentAuditLogs.map((log: any) => (
            <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-indigo-600 uppercase px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px]">
                  {log.action}
                </span>
                <span className="font-medium text-slate-800">{log.entityType} ({log.entityId || 'System'})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
