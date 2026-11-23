import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const TeacherMarksEntry: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [topicScores, setTopicScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest('/teacher/subjects'),
      apiRequest('/teacher/assessments'),
      apiRequest('/teacher/students')
    ])
      .then(([subs, asses, studs]) => {
        setSubjects(subs);
        if (subs.length > 0) setSelectedSubjectId(subs[0].id);
        setAssessments(asses);
        if (asses.length > 0) setSelectedAssessmentId(asses[0].id);
        setStudents(studs);
        if (studs.length > 0) setSelectedStudentId(studs[0].id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeAssessment = assessments.find((a) => a.id === selectedAssessmentId);
  const assessmentTopics = activeAssessment?.topics || [];

  const handleScoreChange = (topicId: string, val: number) => {
    setTopicScores((prev) => ({ ...prev, [topicId]: val }));
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentId || !selectedStudentId) return;

    setSaving(true);
    setMsg(null);

    try {
      const topicMarksArray = assessmentTopics.map((t: any) => ({
        topicId: t.id,
        marksObtained: Number(topicScores[t.id] || 0)
      }));

      const totalObtained = topicMarksArray.reduce((acc: number, item: any) => acc + item.marksObtained, 0);

      await apiRequest(`/teacher/assessments/${selectedAssessmentId}/marks`, {
        method: 'POST',
        body: JSON.stringify({
          marks: [
            {
              studentId: selectedStudentId,
              marksObtained: totalObtained,
              remarks,
              topicMarks: topicMarksArray
            }
          ]
        })
      });

      setMsg({ type: 'success', text: `Marks saved successfully! Total: ${totalObtained}/${activeAssessment?.maxMarks || 100}` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save marks.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading marks entry console...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Marks & Topic Entry</h1>
        <p className="text-xs text-slate-500 mt-1">
          Record topic-level assessment scores to power individual AI performance analytics
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
          msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select Assessment</label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {assessments
                .filter((a) => !selectedSubjectId || a.subjectId === selectedSubjectId)
                .map((a) => (
                  <option key={a.id} value={a.id}>{a.title} ({a.assessmentType})</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.usn} - {s.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic-Wise Entry Table */}
        <form onSubmit={handleSaveMarks} className="space-y-6 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Topic-Wise Marks Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter individual marks for each assessed topic to detect weaknesses with deterministic precision.
            </p>

            {assessmentTopics.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Topic Name</th>
                      <th className="px-4 py-3 w-32">Max Marks</th>
                      <th className="px-4 py-3 w-44">Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {assessmentTopics.map((topic: any) => (
                      <tr key={topic.id}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{topic.topicName}</td>
                        <td className="px-4 py-3 text-slate-500">{topic.maxMarks}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={topic.maxMarks}
                            value={topicScores[topic.id] !== undefined ? topicScores[topic.id] : ''}
                            onChange={(e) => handleScoreChange(topic.id, parseFloat(e.target.value) || 0)}
                            placeholder={`0-${topic.maxMarks}`}
                            className="w-28 p-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 font-bold"
                            required
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                No topic divisions configured for this assessment yet.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Faculty Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Good analytical approach; revise Waterfall feasibility analysis."
              rows={3}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Assessment Marks'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
