import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  History,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Broadcast, BroadcastLog } from '../../types';

export const HistoryScreen: React.FC = () => {
  const { broadcasts, logs, retryFailedLogs, deleteBroadcast } = useApp();

  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const campaignLogs = selectedBroadcast
    ? logs.filter((l) => l.broadcastId === selectedBroadcast.id)
    : [];

  const handleRetry = async (broadcastId: string) => {
    await retryFailedLogs(broadcastId);
    alert('Retrying failed dispatches with safe anti-ban intervals...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <History className="w-3.5 h-3.5" />
            <span>Screen 8 of 9: Campaign Audit &amp; Logs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Broadcast History &amp; Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect all past broadcasts, review delivery outcomes for each recipient, and re-attempt any failed numbers.
          </p>
        </div>
      </div>

      {/* Broadcasts List */}
      <div className="space-y-4">
        {broadcasts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">No Broadcast History</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your launched campaigns will appear here along with recipient logs.
            </p>
          </div>
        ) : (
          broadcasts.map((b) => {
            const bLogs = logs.filter((l) => l.broadcastId === b.id);
            const hasFailed = b.failedCount > 0;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'running'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{new Date(b.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Delay: {b.delaySeconds}s</span>
                      <span>•</span>
                      <span>Channel: WhatsApp Cloud / Node.js Engine</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasFailed && (
                      <button
                        onClick={() => handleRetry(b.id)}
                        className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Failed ({b.failedCount})</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedBroadcast(b)}
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Recipient Logs ({bLogs.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this broadcast from history?')) {
                          deleteBroadcast(b.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Broadcast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-sans line-clamp-2">
                  {b.messageBody}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Recipients</span>
                    <span className="font-bold text-slate-900 font-mono">{b.totalCount}</span>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="text-emerald-700 block text-[10px] uppercase">Delivered</span>
                    <span className="font-bold text-emerald-900 font-mono">
                      {b.deliveredCount || b.totalCount}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Failed</span>
                    <span className="font-bold text-rose-600 font-mono">{b.failedCount || 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recipient Details Drill-down Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {selectedBroadcast.title} - Recipient Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Total recipients: {selectedBroadcast.totalCount}
                </p>
              </div>

              <button
                onClick={() => setSelectedBroadcast(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 border border-slate-200 rounded-xl text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Recipient</th>
                    <th className="p-2.5">Phone Number</th>
                    <th className="p-2.5">Delivery Status</th>
                    <th className="p-2.5">Sent Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaignLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        No recipient logs recorded for this campaign yet.
                      </td>
                    </tr>
                  ) : (
                    campaignLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-800">{log.recipientName}</td>
                        <td className="p-2.5 font-mono text-slate-600">{log.phone}</td>
                        <td className="p-2.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              log.status === 'delivered' || log.status === 'read'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {log.status === 'delivered' || log.status === 'read' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            )}
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">
                          {log.sentAt ? new Date(log.sentAt).toLocaleTimeString() : 'Pending'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBroadcast(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
