import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import {
  Award, Flame, BookOpen, CheckSquare, AlertTriangle,
  ArrowRight, Sparkles, TrendingUp, CheckCircle2, Clock
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await apiRequest('/student/dashboard');
      setData(res);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading your academic intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Failed to load academic data. Please refresh the page.
      </div>
    );
  }

  const { student, mentor, stats, aiReport, subjectSummaries, dailyTasks, recentAchievements } = data;

  const weeklyChartData = [
    { day: 'Mon', completed: 2, hours: 2.5 },
    { day: 'Tue', completed: 3, hours: 3.0 },
    { day: 'Wed', completed: 1, hours: 1.5 },
    { day: 'Thu', completed: 4, hours: 3.5 },
    { day: 'Fri', completed: 2, hours: 2.0 },
    { day: 'Sat', completed: 3, hours: 3.0 },
    { day: 'Sun', completed: 2, hours: 2.0 }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 text-white p-6 shadow-xl border border-navy-700">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Growth Profile Active</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Welcome back, {student.fullName}!
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              USN: <span className="font-mono font-bold text-white">{student.usn}</span> • Department of CSE (AI & ML) • 5th Semester (2026–27)
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
              {mentor.name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">Assigned Faculty Mentor</p>
              <p className="text-sm font-bold text-white">{mentor.name}</p>
              <p className="text-[11px] text-slate-300">{mentor.batch}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Current Rank Tier"
          value={student.currentRank}
          subtitle={`Tier progression at ${student.xpPoints} XP`}
          icon={Award}
          color="indigo"
          trend="Top 15%"
          trendType="positive"
        />
        <StatCard
          title="Learning Streak"
          value={`${student.streakDays} Days`}
          subtitle="Continuous study consistency"
          icon={Flame}
          color="amber"
          trend="Active"
          trendType="positive"
        />
        <StatCard
          title="Topics Mastered"
          value={`${stats.topicsMastered} Topics`}
          subtitle={`Across ${stats.totalSubjects} assigned subjects`}
          icon={CheckCircle2}
          color="emerald"
          trend={`${stats.topicsNeedingImprovement} Need Revision`}
          trendType={stats.topicsNeedingImprovement > 0 ? 'negative' : 'positive'}
        />
        <StatCard
          title="Daily AI Tasks"
          value={`${stats.pendingTasksCount} Pending`}
          subtitle={`${stats.completedTasksCount} completed activities`}
          icon={CheckSquare}
          color="blue"
          trend="Daily Quota"
          trendType="neutral"
        />
      </div>

      {/* AI Performance Engine Alert Banner */}
      {aiReport && aiReport.weakTopics && aiReport.weakTopics.length > 0 && (
        <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl border border-amber-300 flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Gap AI Performance Engine
                </span>
                <span className="text-xs text-amber-700 font-semibold">Individual Diagnostic Insight</span>
              </div>
              <h3 className="text-base font-bold text-amber-950 mt-1">
                Identified Weak Topic: {aiReport.weakTopics.map((w: any) => `${w.topicName} (${w.percentage}%)`).join(', ')}
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-3xl">
                {aiReport.suggestedActionPlan}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="flex-shrink-0 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition-all"
          >
            <span>Start Practice Tasks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Subjects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Performance Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Subject Performance & Topic Breakdown</h2>
              <p className="text-xs text-slate-500">Real-time marks and topic mastery status for 5th Semester</p>
            </div>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              <span>View All Subjects</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectSummaries.map((sub: any) => {
              const getBadgeColor = (status: string) => {
                switch (status) {
                  case 'Excellent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
                  case 'Average': return 'bg-amber-100 text-amber-800 border-amber-200';
                  case 'Needs Improvement': return 'bg-rose-100 text-rose-800 border-rose-200';
                  default: return 'bg-slate-100 text-slate-700 border-slate-200';
                }
              };

              return (
                <div key={sub.subjectId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {sub.courseCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">{sub.subjectName}</h4>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getBadgeColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Evaluation Score</span>
                      <span className="font-bold text-slate-900">
                        {sub.marksObtained} / {sub.maxMarks} {sub.percentage !== null ? `(${sub.percentage}%)` : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (sub.percentage || 0) >= 80 ? 'bg-emerald-500' :
                          (sub.percentage || 0) >= 65 ? 'bg-blue-500' :
                          (sub.percentage || 0) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage || 0)}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics List */}
                  {sub.weakTopics && sub.weakTopics.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-rose-600 mb-1">Requires Improvement:</p>
                      <div className="flex flex-wrap gap-1">
                        {sub.weakTopics.map((topic: string) => (
                          <span key={topic} className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sub.masteredTopics && sub.masteredTopics.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Mastered:</p>
                      <div className="flex flex-wrap gap-1">
                        {sub.masteredTopics.map((topic: string) => (
                          <span key={topic} className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Weekly Task & Study Consistency</h3>
            <p className="text-xs text-slate-500 mb-4">Daily tasks completed and dedicated study hours</p>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" name="Study Hours" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Daily Tasks & Achievements */}
        <div className="space-y-6">
          {/* Daily Tasks Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Personalized Daily Tasks</h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                All Tasks
              </button>
            </div>

            <div className="space-y-3">
              {dailyTasks && dailyTasks.length > 0 ? (
                dailyTasks.slice(0, 4).map((task: any) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition-all ${
                      task.status === 'Completed'
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                        {task.courseCode}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        +{task.xpReward} XP
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{task.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>

                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedDurationMins}m</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No tasks pending for today!</p>
              )}
            </div>
          </div>

          {/* Quick AI Tutor Prompt Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-navy-900 rounded-xl p-5 text-white shadow-md border border-indigo-800">
            <div className="flex items-center space-x-2 text-indigo-300 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Gap AI Tutor</span>
            </div>
            <h4 className="text-sm font-bold text-white">Need help on weak topics?</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Ask your AI academic tutor for step-by-step solutions and concept explanations.
            </p>
            <button
              onClick={() => onNavigate('tutor')}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow"
            >
              Open AI Tutor Chat
            </button>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Earned Achievements</h3>
            <div className="space-y-2.5">
              {recentAchievements && recentAchievements.length > 0 ? (
                recentAchievements.map((ach: any) => (
                  <div key={ach.id} className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ach.title}</p>
                      <p className="text-[11px] text-slate-500">{ach.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-2">Complete tasks to unlock badges!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
