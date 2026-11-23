import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { UploadCloud, Plus, CheckCircle2, AlertCircle, FileText, Eye, Check } from 'lucide-react';

export const TeacherAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New assessment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');
  const [newType, setNewType] = useState('IA1');
  const [newMaxMarks, setNewMaxMarks] = useState('40');
  const [topicsInput, setTopicsInput] = useState('Waterfall Model:10, Agile Model:10, Software Testing:10, Requirements:10');

  // OCR Upload Modal
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrAssessmentId, setOcrAssessmentId] = useState('');
  const [ocrStudentId, setOcrStudentId] = useState('');
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrUploading, setOcrUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  const fetchAssessments = async () => {
    try {
      const [asses, subs, studs] = await Promise.all([
        apiRequest('/teacher/assessments'),
        apiRequest('/teacher/subjects'),
        apiRequest('/teacher/students')
      ]);
      setAssessments(asses);
      setSubjects(subs);
      setStudents(studs);
      if (subs.length > 0) setNewSubjectId(subs[0].id);
      if (asses.length > 0) setOcrAssessmentId(asses[0].id);
      if (studs.length > 0) setOcrStudentId(studs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedTopics = topicsInput.split(',').map((t) => {
        const parts = t.split(':');
        return {
          topicName: parts[0].trim(),
          maxMarks: parseFloat(parts[1] || '10') || 10
        };
      });

      await apiRequest('/teacher/assessments', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: newSubjectId,
          title: newTitle,
          assessmentType: newType,
          maxMarks: parseFloat(newMaxMarks),
          topics: parsedTopics
        })
      });

      setShowCreateModal(false);
      setNewTitle('');
      await fetchAssessments();
    } catch (err: any) {
      alert(err.message || 'Failed to create assessment.');
    }
  };

  const handleOcrUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrFile || !ocrAssessmentId) return;

    setOcrUploading(true);
    setOcrResult(null);

    const formData = new FormData();
    formData.append('document', ocrFile);
    if (ocrStudentId) formData.append('studentId', ocrStudentId);

    try {
      const res = await apiRequest(`/teacher/assessments/${ocrAssessmentId}/upload-sheet`, {
        method: 'POST',
        body: formData
      });
      setOcrResult(res);
    } catch (err: any) {
      alert(err.message || 'OCR document upload failed.');
    } finally {
      setOcrUploading(false);
    }
  };

  const handleConfirmOcrMarks = async () => {
    if (!ocrResult || !ocrAssessmentId || !ocrStudentId) return;
    try {
      const topicMarks = (ocrResult.extractedData.topicBreakdown || []).map((t: any) => ({
        topicId: t.topicId,
        marksObtained: t.suggestedMarks
      }));

      await apiRequest(`/teacher/assessments/${ocrAssessmentId}/marks`, {
        method: 'POST',
        body: JSON.stringify({
          marks: [
            {
              studentId: ocrStudentId,
              marksObtained: ocrResult.extractedData.detectedScore,
              remarks: 'Verified via OCR Answer Script Analysis',
              topicMarks
            }
          ]
        })
      });

      alert('OCR Evaluated Marks Verified and Committed to Database!');
      setShowOcrModal(false);
      setOcrResult(null);
      setOcrFile(null);
    } catch (err: any) {
      alert(err.message || 'Failed to commit marks.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading assessments & OCR workspace...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assessments & OCR Script Upload</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure unit assessments, topic mark weights, and scan evaluated answer sheets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Assessment</span>
          </button>
          <button
            onClick={() => setShowOcrModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Scan Answer Sheet (OCR)</span>
          </button>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assessments.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {a.courseCode || 'ASSESSMENT'}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Max: {a.maxMarks} marks
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Type: {a.assessmentType} • Date: {a.assessmentDate}</p>
            </div>

            {a.topics && a.topics.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">Topic Weight Breakdown:</p>
                <div className="space-y-1">
                  {a.topics.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate">{t.topicName}</span>
                      <span className="font-mono font-semibold text-slate-800">{t.maxMarks}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Create Assessment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h2 className="text-base font-bold text-slate-900 mb-1">Create Unit Assessment</h2>
            <p className="text-xs text-slate-500 mb-4">Define topic rubrics to track student growth accurately</p>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Internal Assessment 2 - Unit 3 & 4"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="IA1">Internal Assessment 1</option>
                    <option value="IA2">Internal Assessment 2</option>
                    <option value="Lab">Lab Test</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Max Marks</label>
                  <input
                    type="number"
                    value={newMaxMarks}
                    onChange={(e) => setNewMaxMarks(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic Breakdown (Format: TopicName:MaxMarks, comma-separated)
                </label>
                <textarea
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: OCR Answer Sheet Scan & Verification */}
      {showOcrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-slate-900 mb-1">Scan Evaluated Answer Script (OCR)</h2>
            <p className="text-xs text-slate-500 mb-4">
              Upload photographed or scanned answer sheet (JPG, PNG, PDF) to extract and verify student marks.
            </p>

            <form onSubmit={handleOcrUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assessment</label>
                  <select
                    value={ocrAssessmentId}
                    onChange={(e) => setOcrAssessmentId(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {assessments.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student</label>
                  <select
                    value={ocrStudentId}
                    onChange={(e) => setOcrStudentId(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.usn} - {s.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Document (JPG, PNG, or PDF)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setOcrFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowOcrModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={ocrUploading || !ocrFile}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{ocrUploading ? 'Analyzing OCR...' : 'Upload & Extract Marks'}</span>
                </button>
              </div>
            </form>

            {/* OCR Verification Panel */}
            {ocrResult && (
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>OCR Analysis Completed. Review the extracted marks below before confirming.</span>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  {ocrResult.document.ocrExtractedText}
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Detected Total Score:</span>
                    <p className="text-lg font-extrabold text-slate-900">{ocrResult.extractedData.detectedScore} / {ocrResult.extractedData.maxMarks}</p>
                  </div>
                  <button
                    onClick={handleConfirmOcrMarks}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Verify & Commit Marks to Database</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
