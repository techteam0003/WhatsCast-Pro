import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, X, ArrowRight } from 'lucide-react';

export const ImportSummaryModal: React.FC = () => {
  const { importSummary, setImportSummary, setActiveScreen } = useApp();

  if (!importSummary) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Excel Import &amp; Cleaning Summary</h3>
              <p className="text-xs text-slate-500">Processed {importSummary.totalRows} contact entries</p>
            </div>
          </div>

          <button
            onClick={() => setImportSummary(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs text-emerald-800 font-medium">Valid Added</div>
              <div className="text-xl font-bold text-emerald-900">{importSummary.validAdded}</div>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs text-amber-800 font-medium">Duplicates Removed</div>
              <div className="text-xl font-bold text-amber-900">{importSummary.duplicatesRemoved}</div>
            </div>
          </div>

          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <div className="text-xs text-rose-800 font-medium">Invalid Numbers</div>
              <div className="text-xl font-bold text-rose-900">{importSummary.invalidSkipped}</div>
            </div>
          </div>
        </div>

        {/* Detailed Row List */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Raw Input</th>
                <th className="p-2.5">Formatted (+91)</th>
                <th className="p-2.5">Status &amp; Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importSummary.details.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-medium text-slate-800">{item.name}</td>
                  <td className="p-2.5 font-mono text-slate-500">{item.rawPhone || '—'}</td>
                  <td className="p-2.5 font-mono font-semibold text-slate-700">
                    {item.cleanedPhone}
                  </td>
                  <td className="p-2.5">
                    {item.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Valid Contact Added
                      </span>
                    )}
                    {item.status === 'duplicate' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Duplicate Skipped
                      </span>
                    )}
                    {item.status === 'invalid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200" title={item.reason}>
                        <XCircle className="w-3 h-3" /> {item.reason || 'Invalid format'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-100">
          <p className="text-xs text-slate-500">
            All valid contacts are saved and ready for broadcast campaigns.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setImportSummary(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => {
                setImportSummary(null);
                setActiveScreen('new_broadcast');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <span>Broadcast to Contacts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
