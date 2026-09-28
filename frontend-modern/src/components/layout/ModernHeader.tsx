'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Scale, 
  Layers, 
  MessageSquare, 
  BookMarked, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';

function ModernNavContent() {
  const searchParams = useSearchParams();
  const { language, toggleLanguage, jurisdiction, setJurisdiction, savedResponses } = useAppStore();
  const t = getTranslations(language);
  const isHi = language === 'hi';
  const activeTab = searchParams.get('tab') || 'overview';
  const isToolsActive = ['wizard', 'prior-art', 'abs', 'dossier', 'tools'].includes(activeTab);

  const mainTabs = [
    { 
      id: 'overview', 
      label: isHi ? 'क्लीयरेंस हब' : 'Clearance Hub', 
      icon: Layers,
      href: '/', 
      isActive: activeTab === 'overview' && !searchParams.get('tab'),
      tooltipId: 'workflow-steps',
      activeClass: 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-2xs',
      iconClass: 'text-slate-800'
    },
    { 
      id: 'copilot', 
      label: isHi ? 'लीगल AI कोपायलट' : 'Legal AI Copilot', 
      icon: MessageSquare,
      href: '/?tab=copilot', 
      isActive: activeTab === 'copilot',
      badge: 'Live RAG',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      activeClass: 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-2xs',
      iconClass: 'text-slate-800',
      tooltipTitle: isHi ? 'कानूनी AI कोपायलट' : 'Statutory AI Copilot',
      tooltipContent: isHi ? 'वैधानिक संविधियों पर आधारित वास्तविक समय कानूनी सहायक।' : 'Interactive conversational assistant grounded in verified statutory legal provisions.'
    },
    { 
      id: 'tools', 
      label: isHi ? 'अनुपालन स्टूडियो' : 'Compliance Studio', 
      icon: Scale,
      href: '/?tab=tools', 
      isActive: isToolsActive,
      badge: isHi ? '4 चरण' : '4 Steps',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
      activeClass: 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-2xs',
      iconClass: 'text-slate-800',
      tooltipId: 'workflow-steps'
    },
    { 
      id: 'history', 
      label: isHi ? 'सहेजे गए उद्धरण' : 'Saved Citations', 
      icon: BookMarked,
      href: '/?tab=history', 
      isActive: activeTab === 'history',
      count: savedResponses.length,
      activeClass: 'bg-white text-slate-900 font-bold border border-slate-200/90 shadow-2xs',
      iconClass: 'text-slate-800',
      tooltipTitle: isHi ? 'सहेजे गए उद्धरण वॉल्ट' : 'Saved Citations Vault',
      tooltipContent: isHi ? 'रिफ्रेश के बाद भी सुरक्षित सहेजे गए प्रश्नों और उत्तरों का ऑडिट रिकॉर्ड।' : 'Persistent archive of saved user queries, statutory responses, and cited clauses.'
    },
  ];

  const workflowSteps = [
    { id: 'wizard', label: isHi ? '1. वर्गीकरण' : '1. Triage', href: '/?tab=wizard', termId: 'step-1-formulation', isActive: activeTab === 'wizard' },
    { id: 'prior-art', label: isHi ? '2. टीकेडीएल जांच' : '2. TKDL Screen', href: '/?tab=prior-art', termId: 'step-2-tkdl', isActive: activeTab === 'prior-art' },
    { id: 'abs', label: isHi ? '3. बीडीए रॉयल्टी' : '3. BDA Royalty', href: '/?tab=abs', termId: 'step-3-abs', isActive: activeTab === 'abs' },
    { id: 'dossier', label: isHi ? '4. अनुपालन डोजियर' : '4. Dossier', href: '/?tab=dossier', termId: 'step-4-dossier', isActive: activeTab === 'dossier' },
  ];

  return (
    <div className="w-full">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brandmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-indigo-500/15 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-indigo-700" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight font-display">
                  IP-SAKTI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isHi ? 'वैधानिक पेटेंट आसूचना मंच' : 'Statutory Patent & Bio-Resource Intelligence'}
              </p>
            </div>
          </Link>


        </div>

        {/* Global Controls: Jurisdiction & Language */}
        <div className="flex items-center gap-2.5">
          {/* Jurisdiction Toggle Switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setJurisdiction('IN')}
              className={`px-3 py-1 rounded-lg transition-all ${
                jurisdiction === 'IN'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🇮🇳 {isHi ? 'भारतीय कानून' : 'India Law'}
            </button>
            <button
              type="button"
              onClick={() => setJurisdiction('INTL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                jurisdiction === 'INTL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🌐 {isHi ? 'वैश्विक WIPO' : 'Global Law'}
            </button>
          </div>

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title={language === 'hi' ? 'Switch interface to English' : 'इंटरफ़ेस को हिन्दी में बदलें'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>

      {/* Modern Navigation Ribbon */}
      <div className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto">
          {/* Main Workspace Navigation */}
          <nav className="flex items-center gap-1.5 py-2 text-xs font-medium">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <StatutoryTooltip 
                  key={tab.id} 
                  termId={tab.tooltipId}
                  customTitle={tab.tooltipTitle}
                  customContent={tab.tooltipContent}
                >
                  <Link
                    href={tab.href}
                    className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition-all select-none ${
                      tab.isActive
                        ? tab.activeClass
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${tab.isActive ? tab.iconClass : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${tab.badgeClass || 'bg-slate-100 text-slate-800'}`}>
                        {tab.badge}
                      </span>
                    )}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {tab.count}
                      </span>
                    )}
                  </Link>
                </StatutoryTooltip>
              );
            })}
          </nav>

          {/* Sub-steps breadcrumb/chips when in tools mode */}
          {isToolsActive && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-1">
                {isHi ? 'चरण:' : 'Steps:'}
              </span>
              {workflowSteps.map((step) => (
                <StatutoryTooltip key={step.id} termId={step.termId} position="bottom">
                  <Link
                    href={step.href}
                    className={`px-2 py-0.5 rounded transition-all ${
                      step.isActive
                        ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {step.label}
                  </Link>
                </StatutoryTooltip>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ModernHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs">
      <Suspense fallback={<div className="h-16 bg-white animate-pulse" />}>
        <ModernNavContent />
      </Suspense>
    </header>
  );
};
