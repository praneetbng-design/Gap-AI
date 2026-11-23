import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Database, AlertTriangle, CheckCircle2, UploadCloud, FileSpreadsheet, Eye, Check } from 'lucide-react';

export const AdminReconciliation: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // File preview
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      const data = await apiRequest('/admin/reconciliation');
      setIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleResolve = async (issueId: string, status: 'Resolved' | 'Provisional') => {
    try {
      await apiRequest('/admin/reconciliation/resolve', {
        method: 'POST',
        body: JSON.stringify({
          id: issueId,
          status,
          resolutionNote: resolutionNote || 'Resolved by Administrator via Gap AI Reconciliation Console'
        })
      });
      setSelectedIssueId(null);
      setResolutionNote('');
      await fetchIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to update reconciliation status.');
    }
  };

  const handlePreviewUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiRequest('/admin/import/preview', {
        method: 'POST',
        body: formData
      });
      setPreviewData(res);
    } catch (err: any) {
      alert(err.message || 'Failed to preview spreadsheet.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading reconciliation engine...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Database className="h-6 w-6 text-indigo-600" />
          <span>Excel Import & Institutional Reconciliation Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Investigate roster vs mentor discrepancies, detect duplicate records, and manage academic data integrity
        </p>
      </div>

      {/* Discrepancy Investigation Panel */}
      <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-amber-100">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-950">Preloaded Discrepancy Reconciliation Report</h2>
            <p className="text-xs text-amber-800">
              Discrepancy: Student Roster has 65 records vs Mentor Mapping has 66 records
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                      USN: {issue.usn}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{issue.studentName}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Assigned in: <strong>{issue.batch}</strong> under <strong>{issue.mentorName}</strong>
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    <strong>Issue:</strong> Student was present in Mentor Mapping workbook but absent from active Roster.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              </div>

              {issue.resolutionNote && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                  <strong>Resolution Audit Note:</strong> {issue.resolutionNote}
                </div>
              )}

              {issue.status !== 'Resolved' && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Administrator Resolution Actions:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolve(issue.id, 'Provisional')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Keep as Provisional
                    </button>
                    <button
                      onClick={() => handleResolve(issue.id, 'Resolved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve & Validate Full Enrollment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Spreadsheet Upload & Validation Engine */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">New Spreadsheet Upload & Column Validation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Preview Excel/CSV roster or marks spreadsheets with automatic duplicate detection and column validation
          </p>
        </div>

        <form onSubmit={handlePreviewUpload} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full sm:w-auto flex-1 p-2 text-xs border border-slate-300 rounded-xl"
            required
          />
          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" />
            <span>{uploading ? 'Analyzing...' : 'Preview & Validate'}</span>
          </button>
        </form>

        {/* Validation Results & Preview Table */}
        {previewData && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">File Name:</span>
                <p className="font-bold text-slate-900 truncate">{previewData.fileName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Total Rows:</span>
                <p className="font-bold text-slate-900">{previewData.totalRecords}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">USN Column:</span>
                <p className={`font-bold ${previewData.validation.hasUsnColumn ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {previewData.validation.hasUsnColumn ? 'Validated' : 'Missing'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500">Duplicates:</span>
                <p className={`font-bold ${previewData.validation.duplicateCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {previewData.validation.duplicateCount} detected
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700 border-b border-slate-200">
                Data Preview (First 10 Rows)
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-100/60 font-semibold text-slate-700">
                    <tr>
                      {previewData.headers.map((h: string) => (
                        <th key={h} className="px-4 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewData.previewRows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {previewData.headers.map((h: string) => (
                          <td key={h} className="px-4 py-2 font-mono text-[11px] text-slate-700">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
