'use client';

import React from 'react';
import { 
  RotateCcw, 
  ArrowRight,
  Printer,
  FileText
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
    <aside className="w-full bg-white border border-[#b1b4b6] p-5 space-y-5">
      {/* Sidebar Header (GOV.UK Summary Header) */}
      <div className="flex items-center justify-between border-b-2 border-[#0b0c0c] pb-2">
        <div>
          <h3 className="text-base font-bold text-[#0b0c0c]">
            Active Case Summary
          </h3>
          <p className="text-xs text-[#505a5f]">
            Statutory baseline for AI reasoning
          </p>
        </div>

        {classificationState && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-[#1d70b8] hover:underline flex items-center gap-1 cursor-pointer"
            title="Reset active case dossier"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Structured Summary Rows (GOV.UK Summary List Pattern) */}
      <div className="space-y-4 text-xs">
        {/* Row 1: Formulation Triage */}
        <div className="border border-[#b1b4b6] p-3 space-y-2 bg-[#f3f2f1]/50">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0b0c0c] uppercase tracking-wider text-[11px]">
              1. Formulation Category
            </span>
            {classificationState ? (
              <span className="gds-tag gds-tag-green">TRIAGED</span>
            ) : (
              <span className="gds-tag gds-tag-yellow">PENDING</span>
            )}
          </div>

          {classificationState ? (
            <div className="space-y-1">
              <p className="font-bold text-[#0b0c0c] text-xs">
                {classificationState.category}
              </p>
              <p className="text-[11px] text-[#505a5f] font-mono">
                {classificationState.statute}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('wizard', '/wizard')}
                className="text-xs font-bold text-[#1d70b8] hover:underline pt-1 inline-block cursor-pointer"
              >
                Change category &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[#505a5f] leading-snug">
                Not classified. Run Step 1 diagnostic to evaluate Section 3(p) exclusion risk.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('wizard', '/wizard')}
                className="gds-btn-primary w-full text-xs cursor-pointer"
              >
                Start Formulation Triage
              </button>
            </div>
          )}
        </div>

        {/* Row 2: TKDL & Section 3(p) Screening */}
        <div className="border border-[#b1b4b6] p-3 space-y-2 bg-[#f3f2f1]/50">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0b0c0c] uppercase tracking-wider text-[11px]">
              2. TKDL Prior-Art
            </span>
            {priorArtAnalysis ? (
              <span className={`gds-tag ${priorArtAnalysis.patentability_risk_score >= 80 ? 'gds-tag-red' : 'gds-tag-green'}`}>
                RISK: {priorArtAnalysis.patentability_risk_score}%
              </span>
            ) : (
              <span className="gds-tag gds-tag-grey">UNSCREENED</span>
            )}
          </div>

          {priorArtAnalysis ? (
            <div className="space-y-1">
              <p className="text-[#0b0c0c] font-medium leading-relaxed">
                {priorArtAnalysis.statutory_summary}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('prior-art', '/prior-art')}
                className="text-xs font-bold text-[#1d70b8] hover:underline pt-1 inline-block cursor-pointer"
              >
                View full prior-art report ({priorArtAnalysis.tkdl_matches_count} hits) &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[#505a5f] leading-snug">
                Screen herbs against Charaka/Sushruta classical texts.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('prior-art', '/prior-art')}
                className="gds-btn-secondary w-full text-xs cursor-pointer"
              >
                Run TKDL Prior-Art Screen
              </button>
            </div>
          )}
        </div>

        {/* Row 3: BDA 2023 ABS Liability */}
        <div className="border border-[#b1b4b6] p-3 space-y-2 bg-[#f3f2f1]/50">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0b0c0c] uppercase tracking-wider text-[11px]">
              3. BDA 2023 ABS Fee
            </span>
            {absCalculation ? (
              <span className="gds-tag gds-tag-green font-mono">
                ₹{absCalculation.calculatedFee.toLocaleString('en-IN')}
              </span>
            ) : (
              <span className="gds-tag gds-tag-grey">NOT COMPUTED</span>
            )}
          </div>

          {absCalculation ? (
            <div className="space-y-1">
              <p className="text-[#505a5f]">
                {absCalculation.statutoryRateDescription}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('abs', '/abs-calculator')}
                className="text-xs font-bold text-[#1d70b8] hover:underline pt-1 inline-block cursor-pointer"
              >
                Recalculate ABS rate &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[#505a5f] leading-snug">
                Check statutory 0.5% turnover fee or Section 7 Vaidya exemptions.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('abs', '/abs-calculator')}
                className="gds-btn-secondary w-full text-xs cursor-pointer"
              >
                Calculate ABS Liability
              </button>
            </div>
          )}
        </div>

        {/* Row 4: Action Buttons (GDS Start & Print Buttons) */}
        <div className="pt-2 space-y-2 border-t border-[#b1b4b6]">
          <button
            type="button"
            onClick={() => navigateTo('dossier', '/dossier')}
            className="gds-btn-start w-full text-xs justify-center cursor-pointer"
          >
            <FileText className="w-4 h-4 text-white" />
            <span>Generate Statutory Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="gds-btn-secondary w-full text-xs justify-center cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#0b0c0c]" />
            <span>Print / Save View (PDF)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
