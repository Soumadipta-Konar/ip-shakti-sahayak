'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GdsStartPage } from '@/components/home/GdsStartPage';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { PriorArtAnalyzer } from '@/components/prior-art/PriorArtAnalyzer';
import { StatutoryDossier } from '@/components/dossier/StatutoryDossier';
import { FormulationWizard } from '@/components/wizard/FormulationWizard';
import { ABSCalculator } from '@/components/abs/ABSCalculator';
import { SessionHistory } from '@/components/history/SessionHistory';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';

import { getTranslations } from '@/lib/translations';

export type ActiveWorkspaceTab = 'overview' | 'copilot' | 'prior-art' | 'dossier' | 'wizard' | 'abs' | 'history';

const TAB_TITLES_EN: Record<ActiveWorkspaceTab, string> = {
  overview: 'Service Overview',
  copilot: 'Legal AI Copilot (Chat & Voice)',
  wizard: '1. Formulation Classification & Triage',
  'prior-art': '2. CSIR-TKDL & Section 3(p) Prior-Art Screen',
  abs: '3. Biological Diversity Act (BDA 2023) ABS Calculator',
  dossier: '4. Statutory Compliance Dossier & Filing Roadmap',
  history: 'Saved Statutory Citations Vault'
};

const TAB_TITLES_HI: Record<ActiveWorkspaceTab, string> = {
  overview: 'सेवा अवलोकन',
  copilot: 'कानूनी AI सहायक (चैट व आवाज़)',
  wizard: '1. फॉर्मूलेशन वर्गीकरण एवं ट्राइएज',
  'prior-art': '2. सीएसआईआर-टीकेडीएल एवं धारा 3(p) पूर्व-कला जांच',
  abs: '3. जैविक विविधता अधिनियम (BDA 2023) रॉयल्टी कैलकुलेटर',
  dossier: '4. वैधानिक अनुपालन डोजियर एवं फाइलिंग रोडमैप',
  history: 'सहेजे गए वैधानिक उद्धरण'
};

function MainWorkspace() {
  const searchParams = useSearchParams();
  const { language } = useAppStore();
  const t = getTranslations(language);
  const activeTab = (searchParams.get('tab') as ActiveWorkspaceTab) || 'overview';
  const tabTitles = language === 'hi' ? TAB_TITLES_HI : TAB_TITLES_EN;

  const handleSelectTab = (tab: ActiveWorkspaceTab) => {
    const url = tab === 'overview' ? '/' : `/?tab=${tab}`;
    window.location.href = url;
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* GOV.UK Breadcrumb Trail (Shown when navigating specific tools) */}
      {activeTab !== 'overview' && (
        <div className="flex items-center justify-between gap-3 text-xs text-[#505a5f] border-b border-[#b1b4b6] pb-3">
          <div className="flex items-center gap-1.5 flex-wrap font-medium">
            <Link href="/" className="hover:underline text-[#1d70b8]">{t.home}</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#505a5f]" />
            <span className="font-bold text-[#0b0c0c]">{tabTitles[activeTab] || 'Tool'}</span>
          </div>

          <Link
            href="/"
            className="text-xs font-bold text-[#1d70b8] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToOverview}</span>
          </Link>
        </div>
      )}

      {/* Main Viewport Content */}
      {activeTab === 'overview' && (
        <GdsStartPage onSelectTab={handleSelectTab} />
      )}

      {activeTab === 'copilot' && (
        <div className="w-full flex flex-col min-h-[660px]">
          <ChatContainer />
        </div>
      )}

      {activeTab === 'wizard' && (
        <div className="w-full flex items-center justify-center">
          <FormulationWizard />
        </div>
      )}

      {activeTab === 'prior-art' && (
        <div className="w-full">
          <PriorArtAnalyzer />
        </div>
      )}

      {activeTab === 'abs' && (
        <div className="w-full flex items-center justify-center">
          <ABSCalculator />
        </div>
      )}

      {activeTab === 'dossier' && (
        <div className="w-full">
          <StatutoryDossier />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="w-full">
          <SessionHistory />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-[#0b0c0c] bg-white border border-[#b1b4b6]">Loading IP-SAKTI Sahayak Statutory Intelligence Platform...</div>}>
      <MainWorkspace />
    </Suspense>
  );
}
