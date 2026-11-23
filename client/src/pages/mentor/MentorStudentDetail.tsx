import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  User, Award, AlertTriangle, CheckCircle2, ShieldCheck,
  FileText, Plus, ArrowLeft, Calendar, Send
} from 'lucide-react';

interface MentorStudentDetailProps {
  studentId: string;
  onBack: () => void;
}

export const MentorStudentDetail: React.FC<MentorStudentDetailProps> = ({ studentId, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Private note input
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Intervention modal
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [intType, setIntType] = useState('Skill Remediation');
  const [intGoal, setIntGoal] = useState('');
  const [intDate, setIntDate] = useState('');
  const [intNotes, setIntNotes] = useState('');
  const [savingInt, setSavingInt] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await apiRequest(`/mentor/students/${studentId}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [studentId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      await apiRequest(`/mentor/students/${studentId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note: newNote.trim(), isPrivate: true })
      });
      setNewNote('');
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInt(true);
    try {
      await apiRequest('/mentor/interventions', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          interventionType: intType,
          goal: intGoal,
          scheduledFollowup: intDate,
          notes: intNotes,
          initialScore: 40
        })
      });
      setShowInterventionModal(false);
      setIntGoal('');
      setIntNotes('');
      await fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule intervention.');
    } finally {
      setSavingInt(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading student profile...</div>;
  }

  if (!data) return null;

  const { student, marks, topicPerformance, tasks, notes, interventions, aiReport } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{student.fullName}</h1>
          <p className="text-xs text-slate-500 font-mono">
            USN: {student.usn} • {student.department} • 5th Semester • {student.enrollmentStatus}
          </p>
        </div>
      </div>

      {/* AI Diagnostic Highlights */}
      {aiReport && aiReport.weakTopics && aiReport.weakTopics.length > 0 && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-900">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Mentor Diagnostic Alert: Identified Weak Topics
            </h3>
            <p className="text-sm font-bold text-rose-950 mt-1">
              {aiReport.weakTopics.map((w: any) => `${w.topicName} in ${w.courseCode} (${w.percentage}%)`).join(', ')}
            </p>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">{aiReport.suggestedActionPlan}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topic Marks & Assessments (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic-Wise Mastery Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Topic Evaluation Matrix</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Topic Name</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {topicPerformance.map((t: any) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{t.courseCode}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{t.topicName}</td>
                      <td className="px-4 py-3 text-slate-600">{t.marksObtained}/{t.maxMarks}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{t.percentage}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'Needs Improvement' ? 'bg-rose-100 text-rose-800' :
                          t.status === 'Average' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Intervention Tracking Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Academic Interventions & Follow-ups</h2>
                <p className="text-xs text-slate-500">Scheduled counseling and target remediation plans</p>
              </div>
              <button
                onClick={() => setShowInterventionModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>New Intervention</span>
              </button>
            </div>

            {interventions.length > 0 ? (
              <div className="space-y-3">
                {interventions.map((i: any) => (
                  <div key={i.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{i.interventionType}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {i.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700"><strong>Goal:</strong> {i.goal}</p>
                    {i.notes && <p className="text-[11px] text-slate-500"><strong>Notes:</strong> {i.notes}</p>}
                    <p className="text-[10px] text-slate-400">Scheduled Follow-up: {i.scheduledFollowup}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No formal interventions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Private Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span>Private Mentor Notes</span>
            </h3>
            <p className="text-xs text-slate-500">
              Confidential faculty notes. Not visible to the student.
            </p>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add confidential observations, consultation summary..."
                rows={3}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
                required
              />
              <button
                type="submit"
                disabled={savingNote || !newNote.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{savingNote ? 'Saving...' : 'Add Private Note'}</span>
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              {notes.map((n: any) => (
                <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <p>{n.note}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Intervention Modal */}
      {showInterventionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h2 className="text-base font-bold text-slate-900 mb-1">Schedule Academic Intervention</h2>
            <p className="text-xs text-slate-500 mb-4">Set remediation goals and scheduled check-in date</p>

            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intervention Type</label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                >
                  <option value="Skill Remediation">Skill Remediation (Weak Topics)</option>
                  <option value="Academic Counseling">Academic Counseling</option>
                  <option value="Attendance Warning">Attendance Review</option>
                  <option value="Personal Guidance">Personal Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specific Goal</label>
                <input
                  type="text"
                  value={intGoal}
                  onChange={(e) => setIntGoal(e.target.value)}
                  placeholder="e.g. Elevate Waterfall topic score from 35% to > 70% before IA2"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={intDate}
                  onChange={(e) => setIntDate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Action Items & Notes</label>
                <textarea
                  value={intNotes}
                  onChange={(e) => setIntNotes(e.target.value)}
                  placeholder="Recommended study materials, practice schedule..."
                  rows={3}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInterventionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInt}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  {savingInt ? 'Saving...' : 'Record Intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
