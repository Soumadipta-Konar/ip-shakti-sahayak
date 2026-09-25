'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickLinksSection } from '@/components/home/QuickLinksSection';
import { FloatingMascot } from '@/components/chat/FloatingMascot';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { SessionContextSidebar } from '@/components/chat/SessionContextSidebar';
import { PriorArtAnalyzer } from '@/components/prior-art/PriorArtAnalyzer';
import { StatutoryDossier } from '@/components/dossier/StatutoryDossier';
import { FormulationWizard } from '@/components/wizard/FormulationWizard';
import { ABSCalculator } from '@/components/abs/ABSCalculator';
import { SessionHistory } from '@/components/history/SessionHistory';
import { 
  Bot, 
  Sparkles, 
  Search, 
  Calculator, 
  FileText, 
  BookMarked,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export type ActiveWorkspaceTab = 'copilot' | 'prior-art' | 'dossier' | 'wizard' | 'abs' | 'history';

function MainWorkspace() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveWorkspaceTab) || 'copilot';

  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>(initialTab);
  const { classificationState, priorArtAnalysis, absCalculation } = useAppStore();

  // Sync tab from URL search parameters if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveWorkspaceTab;
    if (tabParam && ['copilot', 'prior-art', 'dossier', 'wizard', 'abs', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: ActiveWorkspaceTab) => {
    setActiveTab(tab);
    // Smooth scroll down to interactive workspace section
    const el = document.getElementById('interactive-stage');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-10">
      {/* 1. Sovereign Government Hero Banner (Passport Seva Style) */}
      <HeroSection onSelectTab={handleSelectTab} />

      {/* 2. Quick Links Grid (Cream/Gold Cards Directly Below Hero) */}
      <QuickLinksSection activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* 3. Interactive Statutory AI Workspace Stage */}
      <section id="interactive-stage" className="w-full space-y-6 pt-4">
        {/* Workspace Header & Tab Selector (Modern Government Pill Bar) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('copilot')}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Interactive AI Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wizard')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'wizard'
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Formulation Triage</span>
              {classificationState && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prior-art')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'prior-art'
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span>TKDL Prior-Art Analyzer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('abs')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'abs'
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-500" />
              <span>BDA ABS Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dossier')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Compliance Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-slate-500" />
              <span>Saved Citations</span>
            </button>
          </div>

          {/* Active Status Badge or Back Button */}
          {activeTab !== 'copilot' ? (
            <button
              type="button"
              onClick={() => setActiveTab('copilot')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-[#002147] px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to AI Copilot</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>National Copilot Engine Ready</span>
            </div>
          )}
        </div>

        {/* Tab Viewports */}
        {activeTab === 'copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: AI Copilot Chatbot */}
            <div className="lg:col-span-8 flex flex-col min-h-[660px]">
              <ChatContainer />
            </div>

            {/* Right 4 Cols: Active Session Case Dossier */}
            <div className="lg:col-span-4 sticky top-20">
              <SessionContextSidebar onSelectTab={handleSelectTab} />
            </div>
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
      </section>

      {/* 4. Floating Sovereign AI Mascot Widget (Passport Seva Robot Avatar) */}
      <FloatingMascot onSelectTab={handleSelectTab} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-600 bg-white rounded-2xl border border-slate-200">Loading IP-SAKTI Sahayak National AI Portal...</div>}>
      <MainWorkspace />
    </Suspense>
  );
}
