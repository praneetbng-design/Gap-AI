import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { BarChart3, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const TeacherAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/teacher/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading class performance analytics...</div>;
  }

  if (!data) return null;

  const { assignedSubjects, atRiskStudents, classAverage } = data;

  const topicDistributionData = [
    { topic: 'Waterfall Model', average: 52, difficulty: 'High' },
    { topic: 'Agile Model', average: 84, difficulty: 'Low' },
    { topic: 'Software Testing', average: 71, difficulty: 'Medium' },
    { topic: 'Requirements Eng', average: 78, difficulty: 'Medium' },
    { topic: 'IP Addressing', average: 56, difficulty: 'High' },
    { topic: 'Subnetting/VLSM', average: 48, difficulty: 'High' },
    { topic: 'Network Topologies', average: 88, difficulty: 'Low' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Performance Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed diagnostic trends and topic difficulty distributions for CSE-AIML 5th Semester
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Score Averages Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Topic Performance Averages</h2>
          <p className="text-xs text-slate-500 mb-4">Class-wide average percentage per curriculum concept</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="topic" type="category" width={110} tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="average" fill="#4F46E5" radius={[0, 4, 4, 0]} name="Class Avg %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High Difficulty Diagnostic Alert Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Diagnostic Topic Difficulty Analysis</h2>
            <p className="text-xs text-slate-500 mb-4">Concepts with score averages falling below 60% threshold</p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-900">Subnetting & VLSM (BCS502)</span>
                  <span className="font-bold text-rose-700">48% Class Avg</span>
                </div>
                <p className="text-[11px] text-rose-800 mt-1">
                  Students struggle with CIDR prefix bit conversions and usable host calculations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">Waterfall Model (BCS501)</span>
                  <span className="font-bold text-amber-700">52% Class Avg</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Confusion regarding phase verification vs validation deliverables.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900">IP Addressing (BCS502)</span>
                  <span className="font-bold text-amber-700">56% Class Avg</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Classful addressing boundaries vs Classless routing distinction.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            💡 <strong>AI Recommendation:</strong> Target remedial review sessions for Subnetting and Waterfall models prior to IA2.
          </div>
        </div>
      </div>
    </div>
  );
};
