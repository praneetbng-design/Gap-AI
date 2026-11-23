import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { TrendingUp, CheckCircle2, AlertTriangle, BookOpen, Award, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const StudentProgress: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/student/progress')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading your personal growth analytics...</div>;
  }

  if (!data) return null;

  const { student, topicBreakdown, weeklyData, topics } = data;

  const pieData = [
    { name: 'Mastered', value: topicBreakdown.mastered, color: '#10B981' },
    { name: 'Average', value: topicBreakdown.average, color: '#F59E0B' },
    { name: 'Needs Revision', value: topicBreakdown.needsImprovement, color: '#EF4444' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Growth & Skill Tracker</h1>
        <p className="text-xs text-slate-500 mt-1">
          Individual topic mastery and long-term learning consistency tracking
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Overall Mastery Rate</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-indigo-600">{topicBreakdown.masteryRate}%</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12% this month
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${topicBreakdown.masteryRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Mastered Topics</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600">{topicBreakdown.mastered}</span>
            <span className="text-xs text-slate-500 font-medium">Out of {topicBreakdown.total} topics</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">High confidence and consistent assessment scoring</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Revision Focus</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600">{topicBreakdown.needsImprovement}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">Action Required</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Priority concepts assigned for personalized daily tasks</p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Four-Week Growth & Practice Trajectory</h3>
          <p className="text-xs text-slate-500 mb-4">Assessment scores progression vs completed study tasks</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="score" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Avg Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Topic Mastery Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown of assessed curriculum topics</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Topics Status List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Individual Topic Breakdown</h3>
        <div className="space-y-3">
          {topics.map((t: any) => (
            <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {t.courseCode}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.topicName}</h4>
                  <p className="text-[11px] text-slate-500">{t.assessmentTitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{t.marksObtained} / {t.maxMarks}</span>
                  <p className="text-[10px] text-slate-500 font-medium">{t.percentage}%</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                  t.status === 'Excellent' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  t.status === 'Good' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  t.status === 'Average' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-rose-100 text-rose-800 border-rose-200'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
