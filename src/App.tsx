import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { LoginScreen } from './components/screens/LoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { ListsScreen } from './components/screens/ListsScreen';
import { TemplatesScreen } from './components/screens/TemplatesScreen';
import { NewBroadcastScreen } from './components/screens/NewBroadcastScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ImportSummaryModal } from './components/modals/ImportSummaryModal';

const MainContent: React.FC = () => {
  const { activeScreen } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeScreen === 'login' && <LoginScreen />}
        {activeScreen === 'dashboard' && <DashboardScreen />}
        {activeScreen === 'contacts' && <ContactsScreen />}
        {activeScreen === 'lists' && <ListsScreen />}
        {activeScreen === 'templates' && <TemplatesScreen />}
        {activeScreen === 'new_broadcast' && <NewBroadcastScreen />}
        {activeScreen === 'reports' && <ReportsScreen />}
        {activeScreen === 'history' && <HistoryScreen />}
        {activeScreen === 'settings' && <SettingsScreen />}
      </main>

      <ImportSummaryModal />

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        WhatsCast Studio &bull; Node.js Backend &bull; Firebase Firestore &bull; Designed for India (+91) Broadcast Campaigns
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
