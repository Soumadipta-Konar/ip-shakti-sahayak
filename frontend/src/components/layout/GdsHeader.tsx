'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function GdsNavItems() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const navItems = [
    { tab: 'overview', label: 'Service Overview & Tasks', href: '/' },
    { tab: 'copilot', label: 'Legal AI Copilot', href: '/?tab=copilot' },
    { tab: 'wizard', label: '1. Formulation Triage', href: '/?tab=wizard' },
    { tab: 'prior-art', label: '2. TKDL Prior-Art Screen', href: '/?tab=prior-art' },
    { tab: 'abs', label: '3. BDA 2023 ABS Calculator', href: '/?tab=abs' },
    { tab: 'dossier', label: '4. Compliance Dossier', href: '/?tab=dossier' },
    { tab: 'history', label: 'Saved Citations', href: '/?tab=history' },
  ];

  return (
    <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto border-t border-[#b1b4b6]/60 pt-2 text-xs sm:text-sm font-bold">
      {navItems.map((item) => {
        const isActive = activeTab === item.tab || (item.tab === 'overview' && !searchParams.get('tab'));
        return (
          <Link
            key={item.tab}
            href={item.href}
            className={`px-3 py-2 border-b-4 transition-colors whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-[#1d70b8] text-[#1d70b8] bg-[#f3f2f1]'
                : 'border-transparent text-[#0b0c0c] hover:bg-[#f3f2f1] hover:border-[#505a5f]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
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

      {/* 2. White Service Title & Navigation Bar */}
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

          {/* Active Navigation Tabs connected to URL Query */}
          <Suspense fallback={<div className="h-8" />}>
            <GdsNavItems />
          </Suspense>
        </div>
      </div>
    </header>
  );
};
