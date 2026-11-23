import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { BookOpen, Plus, CheckCircle2 } from 'lucide-react';

export const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLab, setIsLab] = useState(false);
  const [teacher, setTeacher] = useState('');

  const fetchSubjects = async () => {
    try {
      const data = await apiRequest('/admin/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/admin/subjects', {
        method: 'POST',
        body: JSON.stringify({
          subjectName: name,
          courseCode: code,
          isLab,
          teacherName: teacher
        })
      });
      setShowModal(false);
      setName('');
      setCode('');
      setTeacher('');
      await fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Failed to add subject.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading subjects list...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum & Subject Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            CSE-AIML 5th Semester • 10 Core Theory & Laboratory Courses
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Course Code</th>
              <th className="px-5 py-3.5">Subject Name</th>
              <th className="px-5 py-3.5">Course Type</th>
              <th className="px-5 py-3.5">Assigned Faculty</th>
              <th className="px-5 py-3.5">Department</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 font-mono font-bold text-indigo-700">{sub.courseCode}</td>
                <td className="px-5 py-3.5 font-bold text-slate-900">{sub.subjectName}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sub.isLab ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {sub.isLab ? 'Laboratory / Project' : 'Theory'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-700 font-medium">{sub.teacherName || 'Not specified'}</td>
                <td className="px-5 py-3.5 text-slate-500">{sub.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h2 className="text-base font-bold text-slate-900 mb-4">Add Curriculum Subject</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deep Learning & Neural Networks"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BCS504"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="e.g. Dr. R. Ezhilan"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="labCheck"
                  checked={isLab}
                  onChange={(e) => setIsLab(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="labCheck" className="text-xs font-semibold text-slate-700">Laboratory / Practical Course</label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
