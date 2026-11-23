import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { ShieldCheck, Search } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiRequest('/admin/audit-logs')
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading system audit trail...</div>;
  }

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Security & Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable transaction log of user logins, password modifications, mark entries, and administrative changes
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter actions or entities..."
          className="px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Timestamp</th>
              <th className="px-5 py-3.5">Action</th>
              <th className="px-5 py-3.5">Entity</th>
              <th className="px-5 py-3.5">User ID</th>
              <th className="px-5 py-3.5">Audit Payload Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[10px]">
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">{log.entityType}</td>
                <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                  {log.userId ? log.userId.substring(0, 8) + '...' : 'System'}
                </td>
                <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px] max-w-xs truncate">
                  {log.details ? JSON.stringify(log.details) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
