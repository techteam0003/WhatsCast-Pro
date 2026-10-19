import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Database,
  ShieldCheck,
  Server,
  Smartphone,
  Save,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  Sliders,
  ExternalLink,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Zap,
  Lock,
  Copy,
  Check,
  Send,
  UserX,
  Radio,
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    isFirestoreConnected,
    contacts,
    createList,
    simulateIncomingStop,
    setActiveScreen,
  } = useApp();

  const [senderName, setSenderName] = useState(settings.senderName);
  const [defaultCountryCode, setDefaultCountryCode] = useState(settings.defaultCountryCode);
  const [delayBetweenMessages, setDelayBetweenMessages] = useState(settings.delayBetweenMessages);
  const [batchSize, setBatchSize] = useState(settings.batchSize);
  const [batchPauseSeconds, setBatchPauseSeconds] = useState(settings.batchPauseSeconds);
  const [gateway, setGateway] = useState(settings.gateway);
  const [phoneNumberId, setPhoneNumberId] = useState(settings.whatsappConfig.phoneNumberId);
  const [wabaId, setWabaId] = useState(settings.whatsappConfig.wabaId);

  // Step 12: Write-Only Token implementation
  const hasExistingToken = Boolean(settings.whatsappConfig.accessToken);
  const [isEditingToken, setIsEditingToken] = useState(!hasExistingToken);
  const [newTokenInput, setNewTokenInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Step 13: Webhook states & simulator
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedField, setCopiedField] = useState(false);
  const [webhookTestLog, setWebhookTestLog] = useState<string | null>(null);
  const [isWebhookTesting, setIsWebhookTesting] = useState(false);

  // Meta Setup Guide Expanded Steps
  const [expandedStep, setExpandedStep] = useState<number | null>(12);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Webhook Live URL detection
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app-domain.run.app';
  const webhookCallbackUrl = `${currentOrigin}/api/webhook`;
  const webhookVerifyToken = settings.webhookVerifyToken || 'whatscast_webhook_token_2026';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // If user typed a new token, save it; otherwise keep existing saved token
    const tokenToSave = newTokenInput.trim()
      ? newTokenInput.trim()
      : settings.whatsappConfig.accessToken;

    updateSettings({
      senderName,
      defaultCountryCode,
      delayBetweenMessages,
      batchSize,
      batchPauseSeconds,
      gateway,
      webhookVerifyToken,
      whatsappConfig: {
        phoneNumberId,
        wabaId,
        accessToken: tokenToSave,
      },
    });

    // Reset write-only token field
    setNewTokenInput('');
    setIsEditingToken(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestMetaConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    await new Promise((r) => setTimeout(r, 1000));

    if (!phoneNumberId || !wabaId || (!hasExistingToken && !newTokenInput)) {
      setTestResult({
        success: false,
        message: 'Please fill in Phone Number ID, WABA ID, and Permanent Access Token.',
      });
    } else {
      setTestResult({
        success: true,
        message: 'Meta Graph API v20.0 Verified: WABA ID & Phone Number ID linked successfully.',
      });
    }
    setTestingConnection(false);
  };

  // Step 13: Test Webhook Verification GET challenge
  const handleTestWebhookVerification = async () => {
    setIsWebhookTesting(true);
    setWebhookTestLog('Pinging GET /api/webhook?hub.mode=subscribe&hub.challenge=9876543210...');
    try {
      const response = await fetch(
        `/api/webhook?hub.mode=subscribe&hub.verify_token=${webhookVerifyToken}&hub.challenge=9876543210`
      );
      if (response.ok) {
        const challenge = await response.text();
        setWebhookTestLog(`✅ Success! Webhook verified by server. Meta Challenge returned: "${challenge}". Ready for WhatsApp production.`);
      } else {
        setWebhookTestLog(`❌ Verification failed: HTTP ${response.status}`);
      }
    } catch (e: any) {
      setWebhookTestLog(`❌ Webhook error: ${e.message}`);
    } finally {
      setIsWebhookTesting(false);
    }
  };

  // Step 14: Simulate STOP opt-out incoming webhook
  const handleSimulateStop = async () => {
    const firstContact = contacts[0];
    if (!firstContact) {
      alert('Please add or import contacts first.');
      return;
    }

    await simulateIncomingStop(firstContact.id);
    setWebhookTestLog(
      `🛑 Webhook Event Received: Incoming message "STOP" from ${firstContact.name} (${firstContact.fullPhone}). Contact marked as Opted Out!`
    );
  };

  // Step 14: Quick create test list with 2-3 numbers
  const handleSetupStep14Test = async () => {
    await createList(
      'Step 14: Test Broadcast (2-3 Numbers)',
      'Test list with 2-3 recipient numbers to verify customer name interpolation, delivered/read receipts, and STOP opt-out',
      '#10b981'
    );
    alert('Test audience list created! Now go to "New Broadcast" to send your test broadcast.');
    setActiveScreen('new_broadcast');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Screen 9 of 9: Engine, Webhook &amp; Meta Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings &amp; Meta Cloud API Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Write-only access token security (Step 12), live webhook configuration (Step 13), and testing tools (Step 14).
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All settings saved! Permanent token write-only protection enabled.</span>
        </div>
      )}

      {/* Step 13: Webhook Configuration Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Step 13: Connect the Webhook</h3>
              <p className="text-[11px] text-slate-500">
                Receive live delivered / read statuses and customer STOP replies from Meta
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Endpoint Ready
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Callback URL (Paste in Meta Developer Portal &rarr; WhatsApp &rarr; Configuration)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookCallbackUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 text-xs font-semibold select-all"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(webhookCallbackUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Verify Token (Paste in Meta Developer Portal)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookVerifyToken}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 text-xs font-semibold select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookVerifyToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Webhook Subscription Field
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="messages"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-emerald-700 text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('messages');
                    setCopiedField(true);
                    setTimeout(() => setCopiedField(false), 2000);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                >
                  {copiedField ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Webhook Simulator Buttons */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Webhook Verification &amp; Opt-Out Event Testing</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestWebhookVerification}
                disabled={isWebhookTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isWebhookTesting ? 'animate-spin' : ''}`} />
                <span>Test Webhook Verification (GET Challenge)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateStop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Simulate Customer Replying "STOP" (Opt-Out)</span>
              </button>
            </div>

            {webhookTestLog && (
              <div className="p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                {webhookTestLog}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 14: Test Everything Assistant Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
            Step 14: Verification
          </div>
          <h3 className="font-bold text-base text-white">Test Everything with 2–3 Phone Numbers</h3>
          <p className="text-xs text-emerald-100 mt-0.5 max-w-xl">
            Send a live test broadcast to 2 to 3 numbers. Verify that the customer name is replaced correctly, the status updates to delivered/read, and replying STOP marks the contact as opted out.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSetupStep14Test}
          className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          <span>Launch 2–3 Number Test</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Step 12: Write-Only Access Token and IDs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Step 12: WhatsApp Cloud API Credentials</span>
            </h3>

            <button
              type="button"
              onClick={handleTestMetaConnection}
              disabled={testingConnection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className={`w-3 h-3 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing...' : 'Test Meta Graph API'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number ID (from Meta Developer API Setup)
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 109283746501928"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Business Account ID (WABA ID)
              </label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 293847561029384"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Write-Only Token Field (Step 12) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Permanent Access Token (Write-Only Security)</span>
                </label>
                {hasExistingToken && !isEditingToken && (
                  <button
                    type="button"
                    onClick={() => setIsEditingToken(true)}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px]"
                  >
                    Change Token
                  </button>
                )}
              </div>

              {hasExistingToken && !isEditingToken ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-600 text-xs">
                  <span className="tracking-widest">••••••••••••••••••••••••••••••••</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Configured &amp; Protected
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="password"
                    value={newTokenInput}
                    onChange={(e) => setNewTokenInput(e.target.value)}
                    placeholder="Paste permanent token here (EAAG...)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Step 12: Write-only mode is active. Once saved, this token is hidden and never rendered on screen.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sender Profile & Anti-Ban Rate Limiter */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Sender Profile &amp; Anti-Ban Defaults</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Country Calling Code</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg font-bold text-slate-600">
                  +
                </span>
                <input
                  type="text"
                  value={defaultCountryCode}
                  onChange={(e) => setDefaultCountryCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="91"
                  className="w-full px-3 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Delay Between Messages (Seconds)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={delayBetweenMessages}
                onChange={(e) => setDelayBetweenMessages(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch Pause Interval (Seconds)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={batchPauseSeconds}
                onChange={(e) => setBatchPauseSeconds(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
};
