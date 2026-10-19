import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Users,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';

export const NewBroadcastScreen: React.FC = () => {
  const {
    contacts,
    lists,
    templates,
    startBroadcast,
    isBroadcasting,
    broadcastProgress,
    cancelBroadcast,
    currentBroadcastId,
    setActiveScreen,
    settings,
  } = useApp();

  const [title, setTitle] = useState(`Broadcast - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
  const [targetType, setTargetType] = useState<'all' | 'list'>('all');
  const [targetListId, setTargetListId] = useState<string>(lists[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [customMessage, setCustomMessage] = useState(templates[0]?.body || 'Hello {{name}}! 👋 Greetings from WhatsCast.');
  const [delaySeconds, setDelaySeconds] = useState<number>(settings.delayBetweenMessages || 2);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate target contacts - strictly excluding opted-out contacts (Step 14)
  const rawAudience = targetType === 'all'
    ? contacts
    : contacts.filter((c) => c.listIds.includes(targetListId));

  const targetContacts = rawAudience.filter((c) => !c.isOptedOut);
  const optedOutCount = rawAudience.filter((c) => c.isOptedOut).length;

  // Step 14 Quick 2-3 Numbers test configuration
  const handleApplyStep14TestPreset = () => {
    setTitle('Step 14 Test - 3 Numbers Verification');
    setCustomMessage('Hello {{name}}! 👋 This is a test broadcast from WhatsCast Studio. Reply STOP to opt out.');
    setDelaySeconds(1.5);
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = templates.find((t) => t.id === tplId);
    if (found) {
      setCustomMessage(found.body);
    }
  };

  const handleLaunchBroadcast = async () => {
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage('Please give your campaign a title.');
      return;
    }
    if (targetContacts.length === 0) {
      setErrorMessage('Selected audience has 0 contacts. Please import contacts first.');
      return;
    }

    try {
      await startBroadcast({
        title: title.trim(),
        channel: 'whatsapp',
        targetType,
        targetListId: targetType === 'list' ? targetListId : undefined,
        templateId: selectedTemplateId || undefined,
        messageBody: customMessage,
        delaySeconds,
        scheduledAt: isScheduled && scheduledTime ? scheduledTime : undefined,
      });
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to start broadcast.');
    }
  };

  // Sample interpolated preview
  const sampleRecipient = targetContacts[0] || {
    name: 'Rajesh Kumar',
    fullPhone: '+91 98765 43210',
    company: 'Tech Solutions',
  };

  const previewRendered = customMessage
    .replace(/{{name}}/gi, sampleRecipient.name)
    .replace(/{{company}}/gi, sampleRecipient.company || 'Tech Solutions')
    .replace(/{{phone}}/gi, sampleRecipient.fullPhone);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Screen 6 of 9: Campaign Dispatcher</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            New Broadcast Campaign
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Launch high-volume WhatsApp messages with intelligent anti-ban rate limiting and real-time delivery logs.
          </p>
        </div>
      </div>

      {/* Broadcasting Active Bar */}
      {isBroadcasting && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-emerald-500/30 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
              <div>
                <h3 className="font-bold text-sm text-emerald-400">Dispatching Broadcast Live...</h3>
                <p className="text-xs text-slate-300">
                  Sending to {broadcastProgress.currentRecipient || 'recipient'}
                </p>
              </div>
            </div>

            <button
              onClick={cancelBroadcast}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
            >
              Pause / Stop
            </button>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${
                  broadcastProgress.total > 0
                    ? (broadcastProgress.sent / broadcastProgress.total) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 mt-2 font-mono">
            <span>Progress: {broadcastProgress.sent} / {broadcastProgress.total} contacts</span>
            <span>Anti-Ban Delay: {delaySeconds}s per message</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Configuration */}
        <div className="lg:col-span-7 space-y-5">
          {/* Campaign Details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>1. Campaign Identification</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>2. Select Target Audience</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`p-3 rounded-xl border text-left transition ${
                  targetType === 'all'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900">All Contacts</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Full list ({contacts.length} total contacts)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('list')}
                className={`p-3 rounded-xl border text-left transition ${
                  targetType === 'list'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900">Specific List / Segment</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Targeted audience filter
                </div>
              </button>
            </div>

            {targetType === 'list' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose List
                </label>
                <select
                  value={targetListId}
                  onChange={(e) => setTargetListId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {lists.map((l) => {
                    const count = contacts.filter((c) => c.listIds.includes(l.id)).length;
                    return (
                      <option key={l.id} value={l.id}>
                        {l.name} ({count} contacts)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs border border-slate-100">
                <span className="text-slate-600">Active Audience Size:</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {targetContacts.length} recipients
                </span>
              </div>

              {optedOutCount > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] flex items-center gap-1.5">
                  <span className="font-bold">Opt-Out Protection:</span>
                  <span>{optedOutCount} contact(s) who sent "STOP" are automatically excluded.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyStep14TestPreset}
                className="w-full inline-flex items-center justify-center gap-1.5 p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Step 14: Load 2–3 Number Test Campaign</span>
              </button>
            </div>
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>3. Message Content &amp; Template</span>
              </h3>

              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 font-medium text-slate-700"
              >
                <option value="">-- Choose Existing Template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <textarea
                rows={5}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Available placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded">{'{{name}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{{company}}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{'{{phone}}'}</code>
              </p>
            </div>
          </div>

          {/* Anti-Ban & Dispatch Interval */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Anti-Ban Protection &amp; Rate Limiter</span>
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Message Send Delay:</span>
                <span className="font-bold text-emerald-600 font-mono">{delaySeconds} seconds / message</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={0.5}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Fast (1s)</span>
                <span className="font-bold text-emerald-700">Recommended Safe (2.5s)</span>
                <span>Ultra-Safe (6s)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Schedule for later dispatch</span>
              </label>

              {isScheduled && (
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                />
              )}
            </div>
          </div>

          {/* Launch Button */}
          <div className="pt-2">
            <button
              onClick={handleLaunchBroadcast}
              disabled={isBroadcasting || targetContacts.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {isBroadcasting
                  ? 'Broadcast In Progress...'
                  : isScheduled
                  ? 'Confirm Scheduled Broadcast'
                  : `Launch Broadcast (${targetContacts.length} Contacts)`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Live Recipient Preview</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-3 space-y-1">
              <div className="text-slate-500">Sample recipient from audience:</div>
              <div className="font-bold text-slate-800">
                {sampleRecipient.name} ({sampleRecipient.fullPhone})
              </div>
            </div>

            {/* WhatsApp Speech Bubble */}
            <div className="bg-[#efeae2] p-4 rounded-2xl border border-slate-200 shadow-inner">
              <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-sm border border-slate-100 text-xs text-slate-800 space-y-2">
                <div className="whitespace-pre-wrap leading-relaxed">{previewRendered}</div>

                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-1">
                  <span>Just now</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Estimated Send Time:</span>
                <span className="font-mono font-bold text-slate-700">
                  {Math.round((targetContacts.length * delaySeconds) / 60)} min {Math.round((targetContacts.length * delaySeconds) % 60)} sec
                </span>
              </div>
              <div className="flex justify-between">
                <span>Anti-Ban Interval:</span>
                <span className="font-bold text-emerald-600">Active ({delaySeconds}s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
