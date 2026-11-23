import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { BookOpen, CheckCircle, AlertCircle, Award, FileText } from 'lucide-react';

export const StudentSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);

  useEffect(() => {
    apiRequest('/student/subjects')
      .then((data) => {
        setSubjects(data);
        if (data.length > 0) setSelectedSubject(data[0]);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold">
        Loading subjects & topic assessments...
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Average': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Needs Improvement': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Academic Subjects</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed topic-level performance analysis for 5th Semester CSE-AIML
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subject List */}
        <div className="space-y-3">
          {subjects.map((sub) => {
            const isSelected = selectedSubject?.id === sub.id;
            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubject(sub)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 shadow-xs">
                    {sub.courseCode}
                  </span>
                  {sub.isLab && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Lab
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{sub.subjectName}</h3>
                <p className="text-xs text-slate-500 mt-1">Faculty: {sub.teacherName || 'Assigned'}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>{sub.topics ? sub.topics.length : 0} Assessed Topics</span>
                  <span className="font-semibold text-indigo-600">View Breakdown →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Topic Breakdown */}
        <div className="lg:col-span-2">
          {selectedSubject ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                      {selectedSubject.courseCode}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">{selectedSubject.subjectName}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Faculty Instructor: {selectedSubject.teacherName}</p>
                </div>
              </div>

              {/* Topic Evaluation Matrix Table */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  <span>Topic-Wise Mastery Matrix</span>
                </h3>

                {selectedSubject.topics && selectedSubject.topics.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Topic Name</th>
                          <th className="px-4 py-3">Marks Obtained</th>
                          <th className="px-4 py-3">Max Marks</th>
                          <th className="px-4 py-3">Percentage</th>
                          <th className="px-4 py-3">Diagnostic Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedSubject.topics.map((t: any) => (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">{t.topicName}</td>
                            <td className="px-4 py-3 font-mono text-slate-700">{t.marksObtained}</td>
                            <td className="px-4 py-3 font-mono text-slate-500">{t.maxMarks}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">{t.percentage}%</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${getStatusBadge(t.status)}`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No topic-level evaluation records entered yet for this course.
                  </div>
                )}
              </div>

              {/* Assessment Records */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span>Assessment Submissions & IA Marks</span>
                </h3>

                {selectedSubject.assessments && selectedSubject.assessments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSubject.assessments.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{a.assessmentTitle}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Type: {a.assessmentType} • Remarks: {a.remarks || 'Evaluated'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{a.marksObtained} / {a.maxMarks}</p>
                          <p className="text-[10px] font-semibold text-indigo-600">{a.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No formal IA tests uploaded yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Select a subject on the left to view breakdown</div>
          )}
        </div>
      </div>
    </div>
  );
};
