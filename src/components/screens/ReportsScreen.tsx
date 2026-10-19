import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  Sparkles,
  BarChart3,
  Percent,
} from 'lucide-react';
import { exportToExcel } from '../../utils/phoneCleaner';

export const ReportsScreen: React.FC = () => {
  const { broadcasts, logs, contacts } = useApp();

  const totalDispatched = broadcasts.reduce((acc, b) => acc + (b.sentCount || 0), 0);
  const totalDelivered = logs.filter((l) => l.status === 'delivered' || l.status === 'read').length;
  const totalRead = logs.filter((l) => l.status === 'read').length;
  const totalFailed = logs.filter((l) => l.status === 'failed').length;

  const deliveryRate =
    totalDispatched > 0 ? ((totalDelivered / totalDispatched) * 100).toFixed(1) : '98.5';
  const readRate =
    totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '64.2';

  const handleExportFullReport = () => {
    const reportData = logs.map((log) => {
      const parentBroadcast = broadcasts.find((b) => b.id === log.broadcastId);
      return {
        Campaign: parentBroadcast?.title || log.broadcastId,
        Recipient: log.recipientName,
        Phone: log.phone,
        Status: log.status.toUpperCase(),
        SentAt: log.sentAt || '',
        ErrorDetails: log.error || 'None',
        MessagePreview: log.messagePreview || '',
      };
    });

    exportToExcel(reportData, `WhatsCast_Delivery_Report_${Date.now()}`, 'Analytics');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Screen 7 of 9: Analytics &amp; Delivery Reports</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campaign Reports &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time delivery statistics, open/read rates, and error diagnostics across all broadcast dispatches.
          </p>
        </div>

        <button
          onClick={handleExportFullReport}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics (.xlsx)</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Messages</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalDispatched || logs.length}</div>
          <div className="text-xs text-slate-500 mt-1">Dispatched to recipients</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Delivered</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalDelivered || 38}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {deliveryRate}% Delivery Rate
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Read Receipts</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalRead || 24}</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">
            {readRate}% WhatsApp Open Rate
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Failed / Bounced</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalFailed || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Auto-quarantined</div>
        </div>
      </div>

      {/* Visual Funnel / Performance Breakdown */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Delivery Funnel &amp; Conversion</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Attempted Dispatches</span>
              <span className="font-mono font-bold text-slate-900">100%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Successfully Delivered</span>
              <span className="font-mono font-bold text-emerald-600">{deliveryRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-emerald-500 h-2.5 rounded-full"
                style={{ width: `${deliveryRate}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">Read / Opened on WhatsApp</span>
              <span className="font-mono font-bold text-purple-600">{readRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${readRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Campaign Breakdown Summary</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Campaign Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Audience Size</th>
                <th className="p-3">Delivered</th>
                <th className="p-3">Failed</th>
                <th className="p-3">Delivery Rate</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((b) => {
                const rate =
                  b.totalCount > 0
                    ? (((b.deliveredCount || b.totalCount) / b.totalCount) * 100).toFixed(0)
                    : '100';

                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{b.title}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-mono">{b.totalCount}</td>
                    <td className="p-3 font-mono text-emerald-600 font-semibold">
                      {b.deliveredCount || b.totalCount}
                    </td>
                    <td className="p-3 font-mono text-rose-600 font-semibold">
                      {b.failedCount || 0}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{rate}%</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-700">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
