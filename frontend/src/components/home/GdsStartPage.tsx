'use client';

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Search, 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  Bot,
  Scale
} from 'lucide-react';
import { ActiveWorkspaceTab } from '@/app/page';
import { useAppStore } from '@/lib/store';

interface GdsStartPageProps {
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
}

export const GdsStartPage: React.FC<GdsStartPageProps> = ({ onSelectTab }) => {
  const { classificationState, priorArtAnalysis, absCalculation } = useAppStore();

  return (
    <div className="w-full space-y-10">
      {/* 1. Main Service Purpose & Value Proposition (GOV.UK Start Page Pattern) */}
      <div className="bg-white border border-[#b1b4b6] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-3 max-w-3xl">
          <span className="gds-tag gds-tag-blue font-bold">STATUTORY PATENT INTELLIGENCE</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0b0c0c] tracking-tight">
            Clear Botanical Innovations for Patenting &amp; Commercialization
          </h2>
          <p className="text-base sm:text-lg text-[#505a5f] leading-relaxed">
            Over <strong>76% of Indian botanical patent applications</strong> face critical rejection or revocation under <strong>Section 3(p)</strong> (Traditional Knowledge) or <strong>Section 3(e)</strong> (Mere Admixture) because applicants file without checking CSIR-TKDL citations or securing prior Biodiversity Act (BDA 2023) clearance.
          </p>
        </div>

        {/* GOV.UK Inset Warning / Notice Box */}
        <div className="gds-inset-text">
          <p className="font-bold text-[#0b0c0c] mb-1">
            Why this enterprise platform was built:
          </p>
          <p className="text-[#505a5f] text-sm leading-relaxed">
            IP-SAKTI Sahayak automates pre-filing legal triage for pharmaceutical companies, biotech laboratories, and patent attorneys. In under 3 minutes, it analyzes botanical ingredients against <strong>500,000+ CSIR-TKDL records</strong>, checks statutory Section 3(p)/(e)/(d) barriers, computes <strong>BDA 2023 Access &amp; Benefit Sharing (ABS) fees</strong>, and generates audit-ready statutory compliance dossiers.
          </p>
        </div>

        {/* Primary CTA (Iconic GOV.UK Green Start Button) */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onSelectTab('wizard')}
            className="gds-btn-start"
          >
            <span>Start Statutory Triage Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('copilot')}
            className="gds-btn-secondary"
          >
            <Bot className="w-4 h-4 text-[#1d70b8]" />
            <span>Consult Legal AI Copilot</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Task List (Signature GOV.UK Service Workflow) */}
      <div className="space-y-4">
        <div className="border-b-2 border-[#0b0c0c] pb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-[#0b0c0c]">
            Statutory Clearance Workflow
          </h3>
          <p className="text-xs sm:text-sm text-[#505a5f]">
            Complete the 4-step statutory clearance process before filing with the Indian Patent Office (IPO) or State Licensing Authority (SLA).
          </p>
        </div>

        <ol className="space-y-3">
          {/* Step 1: Formulation Classification */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b0c0c] text-sm sm:text-base">
                  1. Formulation Classification &amp; Regulatory Pathway
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f]">
                Diagnose recipe into 1 of 6 legal buckets: Classical Generic, Patent or Proprietary (P&amp;P), Phytopharmaceutical (Rule 122-E), or Food.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {classificationState ? (
                <span className="gds-tag gds-tag-green">COMPLETED</span>
              ) : (
                <span className="gds-tag gds-tag-yellow">NOT STARTED</span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('wizard')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {classificationState ? 'View / Change' : 'Start'}
              </button>
            </div>
          </li>

          {/* Step 2: TKDL & Section 3(p) Prior-Art Screen */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b0c0c] text-sm sm:text-base">
                  2. CSIR-TKDL &amp; Section 3(p) Prior-Art Risk Analyzer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f]">
                Screen individual herbs against classical texts (Charaka, Sushruta Samhita) and evaluate Section 3(e) synergistic efficacy hurdles.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {priorArtAnalysis ? (
                <span className={`gds-tag ${priorArtAnalysis.patentability_risk_score >= 80 ? 'gds-tag-red' : 'gds-tag-green'}`}>
                  RISK: {priorArtAnalysis.patentability_risk_score}%
                </span>
              ) : (
                <span className="gds-tag gds-tag-grey">PENDING</span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('prior-art')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {priorArtAnalysis ? 'View Report' : 'Analyze'}
              </button>
            </div>
          </li>

          {/* Step 3: Biological Diversity Act (BDA 2023) Assessment */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b0c0c] text-sm sm:text-base">
                  3. Biological Diversity Act (BDA 2023) ABS Liability
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f]">
                Calculate commercial benefit-sharing fees (0.1% to 0.5% turnover) or verify Section 7 codified practitioner exemptions.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {absCalculation ? (
                <span className="gds-tag gds-tag-green">CALCULATED</span>
              ) : (
                <span className="gds-tag gds-tag-grey">PENDING</span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('abs')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {absCalculation ? 'Recalculate' : 'Compute'}
              </button>
            </div>
          </li>

          {/* Step 4: Statutory Compliance Dossier */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0b0c0c] text-sm sm:text-base">
                  4. Statutory Compliance Dossier &amp; Export
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f]">
                Download official, verified statutory audit dossier in PDF format for submission to patent examiners, NBA, and state regulators.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              <span className="gds-tag gds-tag-blue">AUDIT READY</span>
              <button
                type="button"
                onClick={() => onSelectTab('dossier')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                Export PDF
              </button>
            </div>
          </li>
        </ol>
      </div>

      {/* 3. Commercial ROI & Enterprise Value Proposition Cards */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-[#b1b4b6] pb-2">
          <h3 className="text-lg sm:text-xl font-bold text-[#0b0c0c]">
            Commercial Impact &amp; Risk Mitigation
          </h3>
          <p className="text-xs sm:text-sm text-[#505a5f]">
            Quantifiable value delivered to pharmaceutical manufacturers, biotech innovators, and patent counsels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#b1b4b6] p-5 space-y-2">
            <span className="gds-tag gds-tag-red">Cost Avoidance</span>
            <h4 className="text-base font-bold text-[#0b0c0c]">
              Prevent Section 3(p) Rejections
            </h4>
            <p className="text-xs text-[#505a5f] leading-relaxed">
              Filing a barred polyherbal patent costs an enterprise ₹1,50,000 to ₹5,00,000 in official IPO fees, examination responses, and attorney hearings. Pre-screening saves 100% of this wasted expenditure.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#b1b4b6] p-5 space-y-2">
            <span className="gds-tag gds-tag-green">Time to Market</span>
            <h4 className="text-base font-bold text-[#0b0c0c]">
              Fast-Track CDSCO Rule 122-E
            </h4>
            <p className="text-xs text-[#505a5f] leading-relaxed">
              Instantly identify whether a purified botanical extract qualifies for the Phytopharmaceutical pathway with ≥4 bioactive markers, accelerating clinical trial authorization by 6–12 months.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#b1b4b6] p-5 space-y-2">
            <span className="gds-tag gds-tag-blue">Regulatory Immunity</span>
            <h4 className="text-base font-bold text-[#0b0c0c]">
              BDA 2023 Penalty Shield
            </h4>
            <p className="text-xs text-[#505a5f] leading-relaxed">
              The Biological Diversity (Amendment) Act 2023 introduces strict compliance audits. Ensure mandatory Form I/III approval before applying for patent grants, preventing statutory prosecution under Section 55.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
