import React from 'react';
import { useApp, ScreenName } from '../context/AppContext';
import {
  LogIn,
  LayoutDashboard,
  Users,
  FolderTree,
  FileText,
  Send,
  BarChart3,
  History,
  Settings,
  Smartphone,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Database,
} from 'lucide-react';

interface NavItem {
  id: ScreenName;
  stepNumber: number;
  label: string;
  icon: React.ElementType;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'login', stepNumber: 1, label: 'Login', icon: LogIn },
  { id: 'dashboard', stepNumber: 2, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'contacts', stepNumber: 3, label: 'Contacts', icon: Users },
  { id: 'lists', stepNumber: 4, label: 'Lists', icon: FolderTree },
  { id: 'templates', stepNumber: 5, label: 'Templates', icon: FileText },
  { id: 'new_broadcast', stepNumber: 6, label: 'New Broadcast', icon: Send },
  { id: 'reports', stepNumber: 7, label: 'Reports', icon: BarChart3 },
  { id: 'history', stepNumber: 8, label: 'History', icon: History },
  { id: 'settings', stepNumber: 9, label: 'Settings', icon: Settings },
];

export const Navigation: React.FC = () => {
  const { activeScreen, setActiveScreen, user, isDemoUser, logout } = useApp();

  const currentIndex = NAV_ITEMS.findIndex((n) => n.id === activeScreen);
  const prevScreen = currentIndex > 0 ? NAV_ITEMS[currentIndex - 1] : null;
  const nextScreen = currentIndex < NAV_ITEMS.length - 1 ? NAV_ITEMS[currentIndex + 1] : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  WhatsCast <span className="text-emerald-600">Pro</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Node.js + Firebase
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                WhatsApp &amp; SMS Broadcast Engine (India +91)
              </p>
            </div>
          </div>

          {/* Quick Step Sequence Stepper Controls (Step 5 Order) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => prevScreen && setActiveScreen(prevScreen.id)}
              disabled={!prevScreen}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Screen in Video Order"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              Step {currentIndex + 1}/9: {NAV_ITEMS[currentIndex]?.label}
            </span>

            <button
              onClick={() => nextScreen && setActiveScreen(nextScreen.id)}
              disabled={!nextScreen}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Screen in Video Order"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* User profile / Demo indicator */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'U')[0]}
                  </div>
                )}
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {user.displayName || 'Marketer'}
                  </div>
                  <div className="text-[10px] text-slate-400">Google Auth</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sandbox Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Switcher Nav Tabs (Order matching Step 5 Video Flow) */}
      <div className="border-t border-slate-100 bg-slate-50/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 py-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {item.stepNumber}
                </span>
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
