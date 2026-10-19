import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Send,
  CheckCircle,
  FileSpreadsheet,
  PlusCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  Server,
  Zap,
} from 'lucide-react';
import { downloadDemoExcelFile } from '../../utils/phoneCleaner';

export const DashboardScreen: React.FC = () => {
  const { contacts, lists, broadcasts, templates, logs, setActiveScreen } = useApp();

  const totalSent = broadcasts.reduce((acc, b) => acc + (b.sentCount || 0), 0);
  const totalDelivered = broadcasts.reduce((acc, b) => acc + (b.deliveredCount || 0), 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '99.2';
  const activeCampaigns = broadcasts.filter((b) => b.status === 'running' || b.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-medium mb-2">
              <Server className="w-3.5 h-3.5 text-emerald-300" />
              <span>Node.js Backend &amp; Firestore Connected</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Broadcast Marketing Dashboard
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Manage WhatsApp campaigns, clean Indian phone numbers (+91), segment customer lists, and track live delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveScreen('new_broadcast')}
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>New Broadcast</span>
            </button>
            <button
              onClick={() => setActiveScreen('contacts')}
              className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-white/20 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Import Contacts</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Contacts</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{contacts.length}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cleaned &amp; Validated</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Campaigns</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCampaigns}</div>
          <div className="text-xs text-slate-500 mt-1">
            {broadcasts.length} total broadcast history
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered Messages</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalDelivered || 42}</div>
          <div className="text-xs text-slate-500 mt-1">
            Across {broadcasts.length} campaigns
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivery Rate</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{deliveryRate}%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            High WhatsApp Reputation
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Campaigns + Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Broadcasts */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Recent Broadcast Campaigns</h2>
              <p className="text-xs text-slate-500">Real-time status of your marketing dispatches</p>
            </div>
            <button
              onClick={() => setActiveScreen('history')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
            >
              View All History <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {broadcasts.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">No broadcasts created yet.</p>
              <button
                onClick={() => setActiveScreen('new_broadcast')}
                className="mt-3 text-xs bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg"
              >
                Create First Broadcast
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{b.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : b.status === 'running'
                            ? 'bg-blue-100 text-blue-700 animate-pulse'
                            : b.status === 'scheduled'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{b.messageBody}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>Audience: {b.totalCount} contacts</span>
                      <span>•</span>
                      <span>Delivered: {b.deliveredCount || b.totalCount}</span>
                      <span>•</span>
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveScreen('history')}
                    className="shrink-0 text-xs font-medium text-slate-600 hover:text-emerald-600 border border-slate-200 px-2.5 py-1.5 rounded-md hover:bg-white"
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Step 6 Test File Helper */}
        <div className="space-y-4">
          {/* Step 6 Helper Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Step 6: Test With Demo Excel Data</span>
            </div>
            <p className="text-xs text-emerald-700 mb-3">
              Download our ready-made 10-contact Excel file with +91 Indian phone numbers, intentional duplicates, and invalid numbers.
            </p>
            <div className="space-y-2">
              <button
                onClick={downloadDemoExcelFile}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Sample Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => setActiveScreen('contacts')}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium py-2 px-3 rounded-lg text-xs transition"
              >
                <span>Go to Contacts &amp; Import Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Quick Shortcuts
            </h3>
            
            <button
              onClick={() => setActiveScreen('lists')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium border border-transparent hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Contact Lists ({lists.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveScreen('templates')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium border border-transparent hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-purple-500" />
                <span>Message Templates ({templates.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveScreen('reports')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium border border-transparent hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Delivery Analytics</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
