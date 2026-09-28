'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronRight, 
  Layers, 
  Sparkles, 
  Scale, 
  BookOpen, 
  Leaf, 
  FileCheck2, 
  BookMarked,
  Info,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';
import { ModernOverview } from '@/components/home/ModernOverview';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { PriorArtAnalyzer } from '@/components/prior-art/PriorArtAnalyzer';
import { StatutoryDossier } from '@/components/dossier/StatutoryDossier';
import { FormulationWizard } from '@/components/wizard/FormulationWizard';
import { ABSCalculator } from '@/components/abs/ABSCalculator';
import { SessionHistory } from '@/components/history/SessionHistory';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';

export type ModernTab = 'overview' | 'copilot' | 'tools' | 'wizard' | 'prior-art' | 'abs' | 'dossier' | 'history';
export type ActiveWorkspaceTab = ModernTab;

function ModernWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, savedResponses } = useAppStore();
  const t = getTranslations(language);
  const isHi = language === 'hi';

  const activeTab = (searchParams.get('tab') as ModernTab) || 'overview';

  const handleSelectTab = (tab: string) => {
    if (tab === 'overview') {
      router.push('/');
    } else {
      router.push(`/?tab=${tab}`);
    }
  };

  const complianceSteps = [
    { 
      id: 'wizard', 
      label: isHi ? '1. फॉर्मूलेशन ट्राइएज' : '1. Formulation Triage', 
      icon: Layers, 
      termId: 'step-1-formulation',
      badge: 'D&C Act'
    },
    { 
      id: 'prior-art', 
      label: isHi ? '2. टीकेडीएल जांच' : '2. TKDL Prior-Art', 
      icon: BookOpen, 
      termId: 'step-2-tkdl',
      badge: 'Sec 3(p)'
    },
    { 
      id: 'abs', 
      label: isHi ? '3. बीडीए 2023 रॉयल्टी' : '3. BDA ABS Royalty', 
      icon: Leaf, 
      termId: 'step-3-abs',
      badge: 'NBA Slabs'
    },
    { 
      id: 'dossier', 
      label: isHi ? '4. वैधानिक डोजियर' : '4. Statutory Dossier', 
      icon: FileCheck2, 
      termId: 'step-4-dossier',
      badge: 'Filing Ready'
    },
  ];

  const isComplianceActive = ['tools', 'wizard', 'prior-art', 'abs', 'dossier'].includes(activeTab);
  const currentComplianceStep = ['wizard', 'prior-art', 'abs', 'dossier'].includes(activeTab) ? activeTab : 'wizard';

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Enterprise Sub-Header Bar (Shown for non-overview tabs) */}
      {activeTab !== 'overview' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap font-medium">
            <Link href="/" className="hover:text-blue-600 font-bold transition-colors">
              {isHi ? 'क्लीयरेंस हब' : 'Clearance Hub'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {activeTab === 'copilot' && (isHi ? 'लीगल AI कोपायलट' : 'Legal AI Copilot')}
              {activeTab === 'history' && (isHi ? 'सहेजे गए उद्धरण एवं परामर्श' : 'Saved Citations & Consultations')}
              {isComplianceActive && (isHi ? 'अनुपालन स्टूडियो' : 'Compliance Studio')}
            </span>

            {isComplianceActive && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-blue-700 font-bold">
                  {complianceSteps.find((s) => s.id === currentComplianceStep)?.label}
                </span>
              </>
            )}
          </div>

          {/* Quick tab switcher pill bar */}
          <div className="flex items-center gap-2">
            <StatutoryTooltip termId="workflow-steps">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>{isHi ? '4-चरणीय पाइपलाइन' : '4-Step Pipeline'}</span>
              </span>
            </StatutoryTooltip>
          </div>
        </div>
      )}

      {/* Compliance Studio Step Segmented Navigator (Shown when in any compliance tool) */}
      {isComplianceActive && (
        <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {complianceSteps.map((step) => {
              const Icon = step.icon;
              const isCurrent = currentComplianceStep === step.id;
              return (
                <StatutoryTooltip key={step.id} termId={step.termId}>
                  <button
                    type="button"
                    onClick={() => handleSelectTab(step.id)}
                    className={`p-3 rounded-xl transition-all duration-150 text-left flex items-center justify-between gap-2 border cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-slate-50/70 hover:bg-blue-50/50 text-slate-700 border-slate-200/80 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        isCurrent ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
                          {step.label}
                        </p>
                        <p className={`text-[10px] font-mono truncate ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                          {step.badge}
                        </p>
                      </div>
                    </div>
                  </button>
                </StatutoryTooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      {activeTab === 'overview' && (
        <ModernOverview onSelectTab={handleSelectTab} />
      )}

      {activeTab === 'copilot' && (
        <div className="w-full flex flex-col min-h-[660px]">
          <ChatContainer />
        </div>
      )}

      {/* Compliance Tools */}
      {(activeTab === 'wizard' || (activeTab === 'tools' && currentComplianceStep === 'wizard')) && (
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

      {/* Saved Citations Vault Tab */}
      {activeTab === 'history' && (
        <div className="w-full">
          <SessionHistory />
        </div>
      )}
    </div>
  );
}

export default function ModernWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="w-full p-12 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <ModernWorkspaceContent />
    </Suspense>
  );
}
