'use client';

import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Search, 
  Calculator, 
  FileText, 
  ArrowRight,
  ShieldAlert,
  Leaf,
  Scale
} from 'lucide-react';
import { ActiveWorkspaceTab } from '@/app/page';

interface QuickLinksSectionProps {
  activeTab: ActiveWorkspaceTab;
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
}

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({ activeTab, onSelectTab }) => {
  const quickLinks = [
    {
      tab: 'copilot' as ActiveWorkspaceTab,
      title: 'Interactive AI Copilot',
      subtitle: 'Ask statutory questions, explore citations, or speak via Bhashini voice',
      icon: Bot,
      accentColor: 'text-blue-700',
      badge: 'Bhashini AI',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      tab: 'wizard' as ActiveWorkspaceTab,
      title: 'Formulation Triage (Step 1)',
      subtitle: 'Classify your recipe into Classical, P&P, Phytopharmaceutical, or Food',
      icon: Sparkles,
      accentColor: 'text-amber-700',
      badge: 'Step 1 Diagnostic',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      tab: 'prior-art' as ActiveWorkspaceTab,
      title: 'TKDL Prior-Art Screen',
      subtitle: 'Screen botanical ingredients against Section 3(p) and 3(e) prior-art hurdles',
      icon: Search,
      accentColor: 'text-indigo-700',
      badge: 'CSIR-TKDL',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200'
    },
    {
      tab: 'abs' as ActiveWorkspaceTab,
      title: 'BDA 2023 ABS Calculator',
      subtitle: 'Compute statutory 0.5% turnover fee or check Vaidya exemptions under Section 7',
      icon: Calculator,
      accentColor: 'text-emerald-700',
      badge: 'NBA / SBB Fee',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200'
    },
    {
      tab: 'dossier' as ActiveWorkspaceTab,
      title: 'Statutory Dossier Export',
      subtitle: 'Compile one-click GIGW 3.0 compliant PDF compliance roadmap for attorneys',
      icon: FileText,
      accentColor: 'text-slate-800',
      badge: 'Official PDF',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
    },
  ];

  return (
    <section className="w-full space-y-5 pt-2">
      {/* Centered Heading (Passport Seva Style) */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-[#002147] tracking-tight">
          Quick Links
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Access high-priority statutory screening tools, legal calculators, and AI assistance
        </p>
      </div>

      {/* 5 Prominent Quick Link Cards (Warm Cream / Gold Tint - Exactly like Passport Seva) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          const isCurrent = activeTab === item.tab;

          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onSelectTab(item.tab)}
              className={`p-4 rounded-2xl text-left transition-all group flex flex-col justify-between cursor-pointer border ${
                isCurrent
                  ? 'bg-white border-[#1565C0] ring-3 ring-blue-500/20 shadow-md translate-y-[-2px]'
                  : 'bg-[#FFFDF4] hover:bg-white border-[#F2E5C9] hover:border-[#D4AF37] shadow-2xs hover:shadow-md hover:translate-y-[-2px]'
              }`}
            >
              <div>
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white border border-[#EEDBBA] shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${item.accentColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm font-black text-[#002147] group-hover:text-blue-900 leading-snug tracking-tight">
                  {item.title}
                </h3>

                {/* Subtitle */}
                <p className="text-[11px] text-slate-600 font-normal mt-1.5 leading-relaxed line-clamp-3">
                  {item.subtitle}
                </p>
              </div>

              {/* Bottom Action Cue */}
              <div className="mt-4 pt-2.5 border-t border-[#F2E5C9]/60 flex items-center justify-between text-[11px] font-bold text-blue-800 group-hover:text-[#002147]">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
