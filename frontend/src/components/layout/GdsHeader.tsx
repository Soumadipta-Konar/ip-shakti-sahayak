'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, Sparkles, Scale, BookOpen, Layers } from 'lucide-react';

function GdsNavItems() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const isToolsActive = ['wizard', 'prior-art', 'abs', 'dossier'].includes(activeTab);

  const mainTabs = [
    { id: 'overview', label: 'Overview & Guide', href: '/', isActive: activeTab === 'overview' && !searchParams.get('tab') },
    { id: 'copilot', label: 'Legal AI Copilot', href: '/?tab=copilot', isActive: activeTab === 'copilot' },
    { id: 'tools', label: 'Compliance Tools', href: '/?tab=wizard', isActive: isToolsActive },
    { id: 'history', label: 'Saved Citations', href: '/?tab=history', isActive: activeTab === 'history' },
  ];

  const toolSubTabs = [
    { id: 'wizard', label: '1. Formulation Triage', href: '/?tab=wizard' },
    { id: 'prior-art', label: '2. TKDL Prior-Art Screen', href: '/?tab=prior-art' },
    { id: 'abs', label: '3. BDA 2023 ABS Calculator', href: '/?tab=abs' },
    { id: 'dossier', label: '4. Compliance Dossier', href: '/?tab=dossier' },
  ];

  return (
    <div className="space-y-2">
      {/* 4 Clean Main Tabs */}
      <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto border-t border-[#b1b4b6]/60 pt-2 text-xs sm:text-sm font-bold">
        {mainTabs.map((item) => {
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-3.5 py-2 border-b-4 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                item.isActive
                  ? 'border-[#1d70b8] text-[#1d70b8] bg-[#f3f2f1]'
                  : 'border-transparent text-[#0b0c0c] hover:bg-[#f3f2f1] hover:border-[#505a5f]'
              }`}
            >
              <span>{item.label}</span>
              {item.id === 'tools' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  item.isActive ? 'bg-[#1d70b8] text-white' : 'bg-[#e5e5e5] text-[#505a5f]'
                }`}>
                  4 Steps
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Contextual Sub-Nav Bar (Shown only when inside Compliance Tools) */}
      {isToolsActive && (
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#f3f2f1] p-1.5 border border-[#b1b4b6] text-xs font-semibold">
          <span className="text-[#505a5f] uppercase tracking-wider text-[10px] font-bold px-2 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#1d70b8]" />
            Workflow:
          </span>
          {toolSubTabs.map((sub) => {
            const isSubActive = activeTab === sub.id;
            return (
              <Link
                key={sub.id}
                href={sub.href}
                className={`px-3 py-1 transition-colors whitespace-nowrap ${
                  isSubActive
                    ? 'bg-[#0b0c0c] text-white font-bold shadow-2xs'
                    : 'text-[#0b0c0c] hover:bg-white hover:text-[#1d70b8]'
                }`}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const GdsHeader: React.FC = () => {
  return (
    <header className="w-full bg-[#0b0c0c] text-white">
      {/* 1. Top Black GOV.UK Signature Bar */}
      <div className="border-b-[10px] border-[#1d70b8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo / Brandmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5 font-sans">
              <span className="text-xl">⚖️</span>
              <span className="underline-offset-4 group-hover:underline">IP-SAKTI SAHAYAK</span>
            </span>
          </Link>

          {/* Right Enterprise Status & Tier */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00703c]" />
              <span className="text-white font-semibold">Qdrant Cloud RAG</span>
              <span className="text-slate-400">&bull;</span>
              <span>8,936 Chunks (BAAI v1.5)</span>
            </div>
            <div className="border-l border-slate-700 pl-4 hidden md:block">
              <span className="gds-tag gds-tag-blue">Enterprise B2B</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. White Service Title & Streamlined Navigation Bar */}
      <div className="bg-white text-[#0b0c0c] border-b border-[#b1b4b6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2 space-y-3">
          {/* Service Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b0c0c]">
              Statutory Patent &amp; Bio-Resource Intelligence Platform
            </h1>
            <p className="text-xs sm:text-sm text-[#505a5f] mt-0.5">
              Clear botanical and pharmaceutical innovations against Section 3(p) TKDL bars, BDA 2023 ABS liabilities, and CDSCO Rule 122-E
            </p>
          </div>

          {/* Streamlined Navigation Tabs connected to URL Query */}
          <Suspense fallback={<div className="h-8" />}>
            <GdsNavItems />
          </Suspense>
        </div>
      </div>
    </header>
  );
};
