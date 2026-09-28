'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Layers, Globe } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';

function GdsNavItems() {
  const searchParams = useSearchParams();
  const { language } = useAppStore();
  const t = getTranslations(language);
  const activeTab = searchParams.get('tab') || 'overview';
  const isToolsActive = ['wizard', 'prior-art', 'abs', 'dossier'].includes(activeTab);

  const mainTabs = [
    { id: 'overview', label: t.navOverview, href: '/', isActive: activeTab === 'overview' && !searchParams.get('tab') },
    { id: 'copilot', label: t.navCopilot, href: '/?tab=copilot', isActive: activeTab === 'copilot' },
    { id: 'tools', label: t.navTools, href: '/?tab=wizard', isActive: isToolsActive },
    { id: 'history', label: t.navHistory, href: '/?tab=history', isActive: activeTab === 'history' },
  ];

  const toolSubTabs = [
    { id: 'wizard', label: t.step1, href: '/?tab=wizard', termId: 'step-1-formulation' },
    { id: 'prior-art', label: t.step2, href: '/?tab=prior-art', termId: 'step-2-tkdl' },
    { id: 'abs', label: t.step3, href: '/?tab=abs', termId: 'step-3-abs' },
    { id: 'dossier', label: t.step4, href: '/?tab=dossier', termId: 'step-4-dossier' },
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
                  {language === 'hi' ? '4 चरण' : '4 Steps'}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Contextual Sub-Nav Bar (Shown only when inside Compliance Tools) */}
      {isToolsActive && (
        <div className="flex items-center gap-1.5 overflow-visible bg-[#f3f2f1] p-1.5 border border-[#b1b4b6] text-xs font-semibold relative z-20">
          <StatutoryTooltip termId="workflow-steps" position="bottom" align="left">
            <span className="text-[#505a5f] uppercase tracking-wider text-[10px] font-bold px-2 flex items-center gap-1 cursor-help hover:text-[#0b0c0c] transition-colors">
              <Layers className="w-3 h-3 text-[#1d70b8]" />
              <span>{t.workflowLabel}:</span>
            </span>
          </StatutoryTooltip>

          {toolSubTabs.map((sub) => {
            const isSubActive = activeTab === sub.id;
            return (
              <StatutoryTooltip key={sub.id} termId={sub.termId} position="bottom">
                <Link
                  href={sub.href}
                  className={`px-3 py-1 transition-colors whitespace-nowrap block cursor-pointer ${
                    isSubActive
                      ? 'bg-[#0b0c0c] text-white font-bold shadow-2xs'
                      : 'text-[#0b0c0c] hover:bg-white hover:text-[#1d70b8]'
                  }`}
                >
                  {sub.label}
                </Link>
              </StatutoryTooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const GdsHeader: React.FC = () => {
  const { language, toggleLanguage } = useAppStore();
  const t = getTranslations(language);

  return (
    <header className="w-full bg-[#0b0c0c] text-white">
      {/* 1. Top Black GOV.UK Signature Bar with Language Switcher */}
      <div className="border-b-[10px] border-[#1d70b8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo / Brandmark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-bold text-lg tracking-wider text-white flex items-center gap-1.5 font-sans">
              <span className="text-xl">⚖️</span>
              <span className="underline-offset-4 group-hover:underline">{t.brandTitle}</span>
            </span>
          </Link>

          {/* Right: Status, Enterprise Tier, and Global UI Translate Button */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-slate-300">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00703c]" />
              <span className="text-white font-semibold">{t.ragStatus}</span>
            </div>
            
            <div className="border-l border-slate-700 pl-3 hidden md:block">
              <span className="gds-tag gds-tag-blue">{t.enterpriseTag}</span>
            </div>

            {/* Global UI Language Toggle Button */}
            <div className="border-l border-slate-700 pl-3">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#1d70b8] hover:bg-[#005a30] text-white transition-all shadow-xs border border-white/20 active:translate-y-0.5"
                title={language === 'hi' ? 'Switch whole interface to English' : 'सम्पूर्ण इंटरफ़ेस को हिन्दी में बदलें'}
                aria-label={`Switch language to ${t.languageButtonLabel}`}
              >
                <Globe className="w-3.5 h-3.5 text-white" />
                <span>{t.languageButtonLabel}</span>
              </button>
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
              {t.serviceTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#505a5f] mt-0.5">
              {t.serviceSubtitle}
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
