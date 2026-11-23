import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { CheckSquare, Clock, Award, Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentTasks: React.FC = () => {
  const { student, refreshMe } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [solutionAnswer, setSolutionAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await apiRequest('/student/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStartTask = (task: any) => {
    setActiveTask(task);
    setSolutionAnswer('');
    setCompletionNotice(null);
  };

  const handleCompleteTask = async () => {
    if (!activeTask) return;
    setSubmitting(true);
    try {
      const res = await apiRequest(`/student/tasks/${activeTask.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ answers: solutionAnswer })
      });
      setCompletionNotice(`Congratulations! +${res.task.xpReward} XP awarded!`);
      await fetchTasks();
      await refreshMe();
      setTimeout(() => {
        setActiveTask(null);
        setCompletionNotice(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to complete task.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading daily AI learning tasks...</div>;
  }

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personalized Daily Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">
            AI-generated practice activities customized to your diagnostic topic weaknesses
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl text-xs text-indigo-700 font-semibold">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>{pendingTasks.length} Pending Tasks • {completedTasks.length} Completed</span>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tasks.map((task) => {
          const isDone = task.status === 'Completed';
          return (
            <div
              key={task.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isDone
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {task.courseCode} • {task.topic}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center space-x-1">
                    <Award className="h-3 w-3" />
                    <span>+{task.xpReward} XP</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{task.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{task.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{task.estimatedDurationMins} mins</span>
                </div>

                {isDone ? (
                  <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Completed</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleStartTask(task)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 transition-all"
                  >
                    <span>Start Activity</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Practice Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {activeTask.courseCode} • {activeTask.topic}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeTask.title}</h3>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <strong>Activity Prompt:</strong> {activeTask.description}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Conceptual Explanation or Solution Steps:
                </label>
                <textarea
                  value={solutionAnswer}
                  onChange={(e) => setSolutionAnswer(e.target.value)}
                  placeholder="Summarize the core concepts, workflow steps, or numerical solution..."
                  rows={5}
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                />
              </div>

              {completionNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{completionNotice}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Reward: +{activeTask.xpReward} XP</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteTask}
                  disabled={submitting || !solutionAnswer.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer & Claim XP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
