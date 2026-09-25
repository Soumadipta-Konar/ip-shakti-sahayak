'use client';

import React from 'react';
import { 
  Sparkles, 
  Leaf, 
  RotateCcw, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Printer,
  Search,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ActiveWorkspaceTab } from '@/app/page';

interface SessionContextSidebarProps {
  onSelectTab?: (tab: ActiveWorkspaceTab) => void;
}

export const SessionContextSidebar: React.FC<SessionContextSidebarProps> = ({ onSelectTab }) => {
  const { 
    classificationState, 
    setClassificationState, 
    priorArtAnalysis, 
    absCalculation 
  } = useAppStore();

  const handleClear = () => {
    setClassificationState(null);
  };

  const navigateTo = (tab: ActiveWorkspaceTab, fallbackHref: string) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else {
      window.location.href = fallbackHref;
    }
  };

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col gap-3.5">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#002147]">
            <Sparkles className="w-3.5 h-3.5 text-[#002147]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#002147] tracking-tight">
              Session Case Dossier
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Active Statutory Baseline Context
            </p>
          </div>
        </div>

        {classificationState && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 font-semibold transition-colors print:hidden px-2 py-0.5 rounded-lg hover:bg-rose-50"
            title="Reset active case dossier"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Case Context Content */}
      <div className="space-y-2.5">
        {/* 1. Formulation Triage Category Card */}
        {classificationState ? (
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 transition-all">
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Diagnosed Category
              </span>
              <button
                type="button"
                onClick={() => navigateTo('wizard', '/wizard')}
                className="text-[10px] font-bold text-[#002147] hover:underline"
              >
                Change
              </button>
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              {classificationState.category}
            </h4>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">
              {classificationState.statute}
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-slate-900 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Formulation Triage (Step 1)
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Pending
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5 font-normal">
              Classify your recipe into 1 of 6 legal buckets (Classical, P&amp;P, Phytopharmaceutical, or Food).
            </p>
            <button
              type="button"
              onClick={() => navigateTo('wizard', '/wizard')}
              className="w-full py-2 px-3 rounded-xl bg-[#002147] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#001733] shadow-2xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Launch Triage Wizard</span>
            </button>
          </div>
        )}

        {/* 2. TKDL & Patentability Status Card */}
        {priorArtAnalysis ? (
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5 text-[#002147]" />
                TKDL Prior-Art Screened
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                priorArtAnalysis.patentability_risk_score >= 80
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                Risk: {priorArtAnalysis.patentability_risk_score}%
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-normal leading-relaxed">
              {priorArtAnalysis.statutory_summary}
            </p>
            <button
              type="button"
              onClick={() => navigateTo('prior-art', '/prior-art')}
              className="text-[10px] font-bold text-[#002147] hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Full Prior-Art Report ({priorArtAnalysis.tkdl_matches_count} TKDL hits)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-[#002147]" />
                TKDL &amp; Section 3(p) Screen
              </span>
              <span className="text-[9px] font-medium text-slate-400">Unscreened</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Screen herbs against Charaka/Sushruta Samhita prior-art and Section 3(p) bars.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('prior-art', '/prior-art')}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200 text-[#002147] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-[#002147]" />
              <span>Run TKDL Prior-Art Check</span>
            </button>
          </div>
        )}

        {/* 3. BDA 2023 ABS Assessment Card */}
        {absCalculation ? (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/90">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                BDA 2023 ABS Fee
              </span>
              <span className="text-[10px] font-mono font-bold text-[#002147]">
                ₹{absCalculation.calculatedFee.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed font-normal">
              {absCalculation.statutoryRateDescription}
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5 text-amber-700" />
                BDA 2023 ABS Liability
              </span>
              <span className="text-[9px] font-medium text-slate-400">Not Computed</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Check statutory 0.5% turnover fee or Vaidya exemptions under BDA 2023.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('abs', '/abs-calculator')}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-700" />
              <span>Compute Benefit Sharing (ABS)</span>
            </button>
          </div>
        )}

        {/* 4. Action Row & Statutory Compliance Dossier Link */}
        <div className="pt-2 flex flex-col gap-2 print:hidden border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigateTo('dossier', '/dossier')}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#138808] hover:bg-[#0f6b06] text-white text-xs font-bold text-center transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs"
            title="Open Statutory Compliance Dossier"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>Open Statutory Compliance Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold text-center border border-slate-200 transition-all flex items-center justify-center gap-1.5"
            title="Print or Save Page as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print / Save Current View (PDF)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
