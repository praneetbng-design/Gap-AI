import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { FileText, Upload, Trash2, Plus, Download } from 'lucide-react';

export const TeacherMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('1');
  const [materialType, setMaterialType] = useState('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    try {
      const [mats, subs] = await Promise.all([
        apiRequest('/teacher/materials'),
        apiRequest('/teacher/subjects')
      ]);
      setMaterials(mats);
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedSubjectId || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectId', selectedSubjectId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('unit', unit);
    formData.append('materialType', materialType);

    try {
      await apiRequest('/teacher/materials', {
        method: 'POST',
        body: formData
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setFile(null);
      await fetchMaterials();
    } catch (err: any) {
      alert(err.message || 'Failed to upload material.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await apiRequest(`/teacher/materials/${id}`, { method: 'DELETE' });
      await fetchMaterials();
    } catch (err: any) {
      alert(err.message || 'Failed to delete material.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading course learning materials...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Learning Materials</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide lecture slides, VTU model question solutions, and study guides for your enrolled students
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {m.courseCode} • Unit {m.unit}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {m.materialType}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2">{m.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{m.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">By {m.teacherName}</span>
              <div className="flex items-center space-x-2">
                <a
                  href={m.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Download / View"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <h2 className="text-base font-bold text-slate-900 mb-1">Upload Learning Resource</h2>
            <p className="text-xs text-slate-500 mb-4">Add PDF notes, question banks, or slides</p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.courseCode} - {s.subjectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 2 Subnetting Problem Set & Solutions"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum Unit</label>
                  <input
                    type="number"
                    value={unit}
                    min="1"
                    max="5"
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">Presentation (PPT)</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="questions">Question Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of learning concepts covered..."
                  rows={3}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-xl"
                  required
                />
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
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  {uploading ? 'Uploading...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
