import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { BookOpen, Users, CheckSquare, AlertTriangle, ArrowRight, Calendar, Clock } from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/teacher/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading teacher dashboard...</div>;
  }

  if (!data) return null;

  const { teacher, assignedSubjects, totalStudents, assessmentsCount, classAverage, atRiskStudents, todayClasses } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl border border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Subject Faculty Portal
          </span>
          <h1 className="text-2xl font-extrabold mt-1">Welcome, {teacher?.fullName || 'Faculty Instructor'}</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Department of CSE (AIML) • 5th Semester • Dr. T. Thimmaiah Institute of Technology
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('marks')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all"
          >
            Enter Marks
          </button>
          <button
            onClick={() => onNavigate('assessments')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition-all"
          >
            Upload Answer Script
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Subjects"
          value={assignedSubjects.length}
          subtitle="Active theory & lab courses"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle="Batch strength in Sem 5"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Class Score Average"
          value={`${classAverage}%`}
          subtitle="Across evaluated units"
          icon={CheckSquare}
          color="emerald"
        />
        <StatCard
          title="Attention Needed"
          value={`${atRiskStudents.length} Students`}
          subtitle="Score < 50% on assessments"
          icon={AlertTriangle}
          color={atRiskStudents.length > 0 ? 'rose' : 'emerald'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assigned Subjects Overview (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">My Assigned Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assignedSubjects.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200">
                      {sub.courseCode}
                    </span>
                    {sub.isLab && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Lab Course
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{sub.subjectName}</h3>
                  <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onNavigate('marks')}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Enter Assessment Marks →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Students Requiring Academic Attention */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Students Requiring Support</h2>
                <p className="text-xs text-slate-500">Students scoring under 50% in your subjects</p>
              </div>
            </div>

            {atRiskStudents.length > 0 ? (
              <div className="space-y-3">
                {atRiskStudents.map((st: any) => (
                  <div key={st.studentId} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{st.fullName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">USN: {st.usn} • {st.subjectTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                        {st.percentage}% ({st.score}/{st.maxMarks})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No students currently flagged as at-risk in your subjects!</p>
            )}
          </div>
        </div>

        {/* Right Sidebar: Teaching Schedule */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Teaching Schedule</span>
              </h3>
              <button onClick={() => onNavigate('timetable')} className="text-xs font-semibold text-indigo-600">
                Full Week
              </button>
            </div>

            <div className="space-y-3">
              {todayClasses && todayClasses.length > 0 ? (
                todayClasses.map((c: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-600 font-mono">Period {c.period}</span>
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{c.time}</span>
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{c.subject}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.room}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No scheduled lectures for today.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
