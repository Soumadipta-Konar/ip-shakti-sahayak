'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { SessionContextSidebar } from '@/components/chat/SessionContextSidebar';
import { PriorArtAnalyzer } from '@/components/prior-art/PriorArtAnalyzer';
import { StatutoryDossier } from '@/components/dossier/StatutoryDossier';
import { FormulationWizard } from '@/components/wizard/FormulationWizard';
import { ABSCalculator } from '@/components/abs/ABSCalculator';
import { SessionHistory } from '@/components/history/SessionHistory';
import { 
  Sparkles, 
  Calculator, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Search, 
  FileText,
  ArrowLeft,
  BookMarked
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

  return (
    <div className="flex-1 flex flex-col gap-5">
      {/* 1. Top Quick Feature Modules (Modern Soft Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Formulation Triage */}
        <button 
          type="button"
          onClick={() => setActiveTab('wizard')}
          className={`p-4 rounded-2xl border text-left transition-all group flex items-center justify-between shadow-xs ${
            activeTab === 'wizard'
              ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Formulation Triage
                </h3>
                {classificationState ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Triaged
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Step 1
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Classify product into 6 buckets
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Card 2: ABS Calculator */}
        <button 
          type="button"
          onClick={() => setActiveTab('abs')}
          className={`p-4 rounded-2xl border text-left transition-all group flex items-center justify-between shadow-xs ${
            activeTab === 'abs'
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex-shrink-0">
              <Calculator className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  BDA 2023 ABS Calculator
                </h3>
                {absCalculation && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Calculated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Compute statutory benefit fees
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Card 3: TKDL Prior-Art Risk Analyzer */}
        <button 
          type="button"
          onClick={() => setActiveTab('prior-art')}
          className={`p-4 rounded-2xl border text-left transition-all group flex items-center justify-between shadow-xs ${
            activeTab === 'prior-art'
              ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex-shrink-0">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  TKDL Prior-Art Risk
                </h3>
                {priorArtAnalysis && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Risk {priorArtAnalysis.patentability_risk_score}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sec 3(p) &amp; 3(e) patent screening
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Card 4: Compliance Dossier & Export */}
        <button 
          type="button"
          onClick={() => setActiveTab('dossier')}
          className={`p-4 rounded-2xl border text-left transition-all group flex items-center justify-between shadow-xs ${
            activeTab === 'dossier'
              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Statutory Dossier
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Print/Export official filings
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 2. Workspace Viewport Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'copilot'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Legal Copilot (Chat &amp; Voice)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prior-art')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'prior-art'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>TKDL Prior-Art Risk Analyzer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'dossier'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Statutory Compliance Dossier &amp; Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wizard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'wizard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Formulation Triage Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('abs')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'abs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>BDA ABS Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Saved Citations</span>
          </button>
        </div>

        {activeTab !== 'copilot' && (
          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Legal Copilot</span>
          </button>
        )}
      </div>

      {/* 3. Tab Content Viewport */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Interactive Legal Copilot & Voice Interface */}
          <div className="lg:col-span-8 flex flex-col min-h-[640px]">
            <ChatContainer />
          </div>

          {/* Right Column: Formulation Classification Sidebar / Session Context */}
          <div className="lg:col-span-4 sticky top-16">
            <SessionContextSidebar onSelectTab={(tab) => setActiveTab(tab)} />
          </div>
        </div>
      )}

      {activeTab === 'prior-art' && (
        <div className="flex-1">
          <PriorArtAnalyzer />
        </div>
      )}

      {activeTab === 'dossier' && (
        <div className="flex-1">
          <StatutoryDossier />
        </div>
      )}

      {activeTab === 'wizard' && (
        <div className="flex-1 flex items-center justify-center">
          <FormulationWizard />
        </div>
      )}

      {activeTab === 'abs' && (
        <div className="flex-1 flex items-center justify-center">
          <ABSCalculator />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex-1">
          <SessionHistory />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-slate-600 bg-white rounded-2xl border border-slate-200">Loading National AI Statutory Copilot...</div>}>
      <MainWorkspace />
    </Suspense>
  );
}
