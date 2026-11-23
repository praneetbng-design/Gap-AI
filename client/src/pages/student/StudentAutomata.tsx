import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Cpu, ExternalLink, Award, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentAutomata: React.FC = () => {
  const { refreshMe } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedEx, setSelectedEx] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchExercises = async () => {
    try {
      const data = await apiRequest('/automata/exercises');
      setExercises(data);
      if (data.length > 0 && !selectedEx) {
        setSelectedEx(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEx || !reflection.trim()) return;

    setSubmitting(true);
    try {
      const res = await apiRequest(`/automata/exercises/${selectedEx.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ reflection: reflection.trim() })
      });
      setFeedback(`Lab submission verified! +${res.submission.xpAwarded} XP awarded!`);
      await fetchExercises();
      await refreshMe();
      setReflection('');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading AutomataVerse Learning Lab...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-indigo-950 to-navy-900 rounded-2xl p-6 text-white border border-indigo-900/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Cpu className="h-4 w-4" />
            <span>Interactive Learning Lab</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AutomataVerse Integration</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simulate Deterministic Finite Automata (DFA), Non-deterministic Finite Automata (NFA), and Pushdown Automata (PDA) for Theory of Computation (BCS503).
          </p>
        </div>

        <a
          href="https://www.automataverse.com/simulator"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
        >
          <span>Open Full Simulator</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Exercise List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Assigned Automata Exercises
          </h2>

          {exercises.map((ex) => {
            const isSelected = selectedEx?.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => { setSelectedEx(ex); setFeedback(null); }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/90 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ex.machineType}
                  </span>
                  {ex.completed ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center space-x-1 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified (+{ex.maxXP} XP)</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      +{ex.maxXP} XP
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-900 mt-2">{ex.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ex.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Embedded Simulator & Submission */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEx ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                    {selectedEx.machineType} Module
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{selectedEx.title}</h2>
                </div>
                <a
                  href={selectedEx.sharedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Launch in New Tab</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                <strong>Exercise Rubric & Steps:</strong>
                {'\n' + selectedEx.instructions}
              </div>

              {/* Hybrid Embedded Simulation Frame */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner">
                <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono ml-2">automataverse.com/simulator</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    Hybrid Sandbox Container
                  </span>
                </div>

                <div className="relative h-80 w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                  <Cpu className="h-12 w-12 text-indigo-400 mb-3 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">AutomataVerse Official Simulator</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
                    Interactive state-transition graph design. Due to modern browser Cross-Origin Embedder Policies, launch the live simulator in a dedicated tab to configure states and simulate input strings.
                  </p>
                  <a
                    href={selectedEx.sharedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all"
                  >
                    <span>Open & Design Machine</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Submission & Reflection Form */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Lab Reflection & Verification Submission
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Document your transition states, test string results, and state invariants to claim +{selectedEx.maxXP} XP.
                </p>

                {feedback && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{feedback}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Describe your states (e.g. q0 start state, q1 accept state), alphabet transitions, and test results for accepted/rejected strings..."
                    rows={4}
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !reflection.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <span>{submitting ? 'Verifying...' : 'Submit Lab & Earn XP'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select an exercise to begin simulation</div>
          )}
        </div>
      </div>
    </div>
  );
};
