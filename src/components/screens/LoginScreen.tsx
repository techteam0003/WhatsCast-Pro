import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles, CheckCircle2, Database, Zap, Lock, ArrowRight, Smartphone } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { user, isDemoUser, loginWithGoogle, loginAsDemo, logout, setActiveScreen, isFirestoreConnected } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Screen 1 of 9: Authentication &amp; Access</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to WhatsCast Studio
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-xl mx-auto">
          High-performance WhatsApp &amp; SMS Broadcast Engine with Node.js backend runtime and secure Firestore persistence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Sign In Options Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-600/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Sign In to Continue</h3>
                  <p className="text-xs text-slate-500">Choose your preferred login method</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                <Database className="w-3.5 h-3.5" />
                {isFirestoreConnected ? 'Firestore Ready' : 'Local Sandbox'}
              </span>
            </div>

            {user ? (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full border border-slate-300" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{user.displayName || 'Authenticated User'}</h4>
                    <p className="text-xs text-slate-500">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Google Account Linked
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveScreen('dashboard')}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition"
                  >
                    Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={logout}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-3 rounded-lg text-xs font-medium transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3 px-4 rounded-xl border border-slate-300 shadow-sm transition group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.36 7.35 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Or Instant Sandbox
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  onClick={loginAsDemo}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Continue as Demo Marketer</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> End-to-end sandbox security
            </span>
            <span className="text-slate-400">Node.js Server v20.x</span>
          </div>
        </div>

        {/* Feature Highlights Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
              <ShieldCheck className="w-4 h-4" /> Production Architecture
            </div>
            <h3 className="text-xl font-bold mb-4">Enterprise Broadcast Engine</h3>
            
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Excel (.xlsx / .csv) Smart Import:</strong> Auto-removes duplicates and cleans invalid phone numbers.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Indian Phone Standard (+91):</strong> Strict 10-digit validation with leading zero &amp; code formatting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Anti-Ban Rate Limiter:</strong> Configurable interval delay (1.5s - 5s) &amp; batch pauses for safe sending.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Live WhatsApp Previews:</strong> Real-time message bubble with CTA buttons &amp; variable interpolation.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span><strong>Firestore Rules Deployed:</strong> Zero-trust role separation and audit logging.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition"
            >
              <span>Explore Dashboard (Screen 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
