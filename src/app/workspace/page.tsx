'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { InteractiveCursorGlow } from '../../components/canvas/InteractiveCursorGlow';
import { FinancialNewsTab } from '../../components/FinancialNewsTab';
import { PaperTradingTab } from '../../components/PaperTradingTab';
import { JobSearchTab } from '../../components/JobSearchTab';
import { FinanceHubTab } from '../../components/FinanceHubTab';
import { Header } from '../../components/Header';
import { useFirestoreData } from '../../hooks/useFirestoreData';

export default function WorkspacePage() {
  const { user, isGuest, isAuthenticated, isLoading } = useAuth();
  const { data: userData, updateData } = useFirestoreData();
  const [activeTab, setActiveTab] = React.useState<string>('news');

  useEffect(() => {
    // If not authenticated and not loading, redirect to landing page
    if (!isLoading && !user && !isGuest && !isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/#landing';
      }
    }
  }, [user, isGuest, isAuthenticated, isLoading]);

  if (isLoading || (!user && !isGuest && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#8B95A5] tracking-widest uppercase">Authenticating Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative overflow-x-hidden">
      <InteractiveCursorGlow />
      <Header
        activeTab={activeTab as any}
        setActiveTab={(t) => setActiveTab(t)}
        onGoBack={() => {}}
        onGoHome={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/#landing';
          }
        }}
        onExportMultiSheet={() => {}}
        onUploadDrive={() => {}}
        googleSyncState={{
          isConnected: false,
          userEmail: null,
          spreadsheetId: null,
          spreadsheetUrl: null,
          lastSynced: null,
          isSyncing: false,
          error: null,
          accessToken: null
        }}
        userData={userData}
        updateData={updateData}
      />
      <main className="flex-1 pb-24 pt-20 sm:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {activeTab === 'news' && <FinancialNewsTab />}
        {activeTab === 'trading' && <PaperTradingTab />}
        {activeTab === 'jobs' && <JobSearchTab />}
        {activeTab === 'finance' && <FinanceHubTab />}
      </main>
    </div>
  );
}
