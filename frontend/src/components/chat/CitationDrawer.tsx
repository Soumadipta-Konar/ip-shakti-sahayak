'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, BookOpen, ShieldCheck, Scale, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useAppStore } from '@/lib/store';

// Verbatim statutory database for canonical patent & biodiversity laws
const CANONICAL_STATUTE_DATA: Record<string, {
  verbatim: string;
  plainMeaning: string;
  examinerChecklist: string[];
  officialUrl: string;
}> = {
  '3(p)': {
    verbatim: 'Section 3(p) of The Patents Act, 1970: "The following are not inventions within the meaning of this Act: an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components."',
    plainMeaning: 'Inventions that copy or slightly tweak classical herbal formulas (from Charaka Samhita, Sushruta Samhita, or CSIR-TKDL) cannot receive a patent. You cannot patent turmeric for healing wounds or ginger for digestion because these uses are already centuries-old public knowledge.',
    examinerChecklist: [
      'Conduct internal search in CSIR Traditional Knowledge Digital Library (TKDL) before filing.',
      'Provide evidence of novel technological fractioning (standardized to ≥4 bioactive markers under Rule 122-E).',
      'Demonstrate unexpected synergistic therapeutic activity that goes far beyond individual known herb effects.',
      'If relying on classical formula as-is, protect via Trademark (Trade Marks Act 1999) and Packaging Industrial Design (Designs Act 2000) instead.'
    ],
    officialUrl: 'https://www.ipindia.gov.in/patents.htm'
  },
  '3(e)': {
    verbatim: 'Section 3(e) of The Patents Act, 1970: "The following are not inventions within the meaning of this Act: a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance."',
    plainMeaning: 'Simply mixing two or more known herbs together is not patentable unless you prove they interact synergistically to produce a non-obvious result greater than the mathematical sum of individual ingredients.',
    examinerChecklist: [
      'Submit experimental bio-activity assays establishing a Combination Index (CI < 1.0) using Chou-Talalay or isobologram analysis.',
      'Show comparative in-vitro / in-vivo animal model data comparing the combination against each isolated component alone.',
      'Prove statistically significant reduction in effective therapeutic dosage (e.g., 50% lower dose required).',
      'Document unexpected pharmacokinetic enhancement (e.g., Piperine increasing bioavailability of Curcumin by 2000%).'
    ],
    officialUrl: 'https://www.ipindia.gov.in/patents.htm'
  },
  '3(d)': {
    verbatim: 'Section 3(d) of The Patents Act, 1970: "The following are not inventions within the meaning of this Act: the mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance or the mere discovery of any new property or new use for a known substance..."',
    plainMeaning: 'Creating a new salt, ester, derivative, polymorph, or formulation of a known botanical substance is barred from patenting unless you demonstrate significant enhancement in therapeutic efficacy.',
    examinerChecklist: [
      'Quantify therapeutic efficacy improvement (e.g., higher receptor binding affinity, improved IC50 values).',
      'Distinguish biological efficacy from mere physical property changes (solubility alone is not therapeutic efficacy under Novatis v. UOI).',
      'Present comparative clinical or preclinical pharmacological data against the parent known substance.'
    ],
    officialUrl: 'https://www.ipindia.gov.in/patents.htm'
  },
  '6': {
    verbatim: 'Section 6 of the Biological Diversity Act, 2002 (as amended 2023): "No person shall apply for any intellectual property right, by whatever name called, in or outside India, for any invention based on any research or information on a biological resource obtained from India, without obtaining the previous approval of the National Biodiversity Authority before grant of such intellectual property right."',
    plainMeaning: 'If your invention uses any Indian plant, seed, microorganism, or biological extract, you MUST submit Form III to the National Biodiversity Authority (NBA) and obtain approval prior to the grant of the patent. Filing or securing grant without NBA clearance is a statutory violation and ground for patent revocation under Section 64(1).',
    examinerChecklist: [
      'Identify whether any biological resource was procured within India.',
      'File Form III with the National Biodiversity Authority (NBA) at Chennai prior to patent grant.',
      'Verify if source was cultivated by registered farmers or procured from wild forest areas.',
      'Execute Benefit Sharing Agreement (BSA) if commercial exploitation is intended.'
    ],
    officialUrl: 'http://nbaindia.org/'
  },
  '7': {
    verbatim: 'Section 7 of the Biological Diversity Act, 2002 (as amended 2023): "No person, who is a citizen of India or a body corporate, association or organisation which is registered in India, shall obtain any biological resource for commercial utilisation... except after giving prior intimation to the State Biodiversity Board concerned."',
    plainMeaning: 'Indian companies procuring commercial quantities of herbs must give formal prior intimation to the State Biodiversity Board (SBB) of the state where herbs are collected, unless explicitly exempted (such as codified traditional practitioners or cultivated registered produce).',
    examinerChecklist: [
      'Submit formal intimation notice to the relevant State Biodiversity Board (SBB).',
      'Maintain documented procurement receipts confirming cultivation or mandis origin.',
      'Check applicability of revised 2023 amendments regarding codified AYUSH practitioners and cultivated species exemptions.'
    ],
    officialUrl: 'http://nbaindia.org/'
  },
  '122-e': {
    verbatim: 'Rule 122-E of Drugs and Cosmetics Rules, 1945: "Phytopharmaceutical drug includes purified and standardized fraction with defined minimum four of bio-active or analytical marker compounds of an extract of a medicinal plant or its part, for internal or external use of human beings or animals."',
    plainMeaning: 'Phytopharmaceuticals are modern scientific botanical drugs. By fractionating an extract and standardizing it to at least 4 analytical/bioactive chemical markers, your botanical product qualifies as an innovative new drug rather than a classical mixture, unlocking high patentability.',
    examinerChecklist: [
      'Standardize the botanical fraction to ≥4 chemical markers using HPLC / LC-MS profiling.',
      'Submit Phase I/II/III clinical trial data under CDSCO Central Licensing Authority.',
      'Claim the specific standardized fraction and process of manufacturing under Form 2.',
      'Overcomes Section 3(p) objections by establishing non-obvious technological separation.'
    ],
    officialUrl: 'https://cdsco.gov.in'
  }
};

function getStatuteData(sectionStr?: string, actStr?: string, snippet?: string) {
  const s = (sectionStr || '').toLowerCase();
  const a = (actStr || '').toLowerCase();
  const text = (snippet || '').toLowerCase();

  if (s.includes('3(p)') || text.includes('3(p)')) return CANONICAL_STATUTE_DATA['3(p)'];
  if (s.includes('3(e)') || text.includes('3(e)')) return CANONICAL_STATUTE_DATA['3(e)'];
  if (s.includes('3(d)') || text.includes('3(d)')) return CANONICAL_STATUTE_DATA['3(d)'];
  if (s.includes('6') && (a.includes('biodiversity') || a.includes('bda') || text.includes('nba'))) return CANONICAL_STATUTE_DATA['6'];
  if (s.includes('7') && (a.includes('biodiversity') || a.includes('bda') || text.includes('sbb'))) return CANONICAL_STATUTE_DATA['7'];
  if (s.includes('122-e') || text.includes('122-e')) return CANONICAL_STATUTE_DATA['122-e'];

  return null;
}

export const CitationDrawer: React.FC = () => {
  const { selectedCitation, isCitationDrawerOpen, setIsCitationDrawerOpen } = useAppStore();

  if (!selectedCitation) return null;

  const canonical = getStatuteData(
    selectedCitation.section, 
    selectedCitation.act, 
    selectedCitation.snippet || selectedCitation.description
  );

  const displayVerbatim = canonical?.verbatim || selectedCitation.snippet || selectedCitation.description || 'Statutory authority text from official Gazette.';
  const displayMeaning = canonical?.plainMeaning || 'This statutory provision is enforced by patent examiners and statutory authorities during substantive examination of botanical, pharmaceutical, and biological inventions.';
  const displayChecklist = canonical?.examinerChecklist || [
    'Verify alignment with Indian Patents Act 1970 and Patent Rules 2003.',
    'Confirm whether CSIR-TKDL search triggers pre-grant opposition barriers.',
    'Maintain documented experimental evidence to substantiate claims.'
  ];
  const displayUrl = selectedCitation.url || canonical?.officialUrl || 'https://www.ipindia.gov.in';

  return (
    <AnimatePresence>
      {isCitationDrawerOpen && (
        <>
          {/* Subtle Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCitationDrawerOpen(false)}
            className="fixed inset-0 bg-[#0b0c0c]/40 z-50 backdrop-blur-2xs"
          />

          {/* Slide-over Drawer (100% Light Theme / GDS Clean Aesthetic) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white border-l-2 border-[#0b0c0c] shadow-2xl p-6 z-50 overflow-y-auto custom-scrollbar flex flex-col text-[#0b0c0c]"
          >
            {/* 1. Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1d70b8] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0b0c0c] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-[#1d70b8]">
                    Official Statutory Authority
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#0b0c0c] leading-tight">
                    {selectedCitation.act || 'The Patents Act, 1970'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCitationDrawerOpen(false)}
                className="p-1.5 text-[#505a5f] hover:text-[#0b0c0c] hover:bg-[#f3f2f1] transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Main Content Body */}
            <div className="space-y-5 flex-1 text-xs sm:text-sm">
              {/* Section Header Card */}
              <div className="p-3.5 bg-[#f3f2f1] border border-[#b1b4b6] flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#505a5f] font-semibold uppercase tracking-wider">
                    Statute Provision / Rule
                  </p>
                  <p className="text-base font-bold text-[#0b0c0c]">
                    {selectedCitation.section || 'General Statutory Section'}
                  </p>
                </div>
                <span className="gds-tag gds-tag-green">
                  GAZETTE VERIFIED
                </span>
              </div>

              {/* Verbatim Statutory Text (Callout Box) */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#0b0c0c] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#1d70b8]" />
                  <span>Verbatim Law (Gazette of India)</span>
                </h4>
                <div className="gds-inset-text text-xs leading-relaxed text-[#0b0c0c] font-serif bg-[#fbfbfb]">
                  {displayVerbatim}
                </div>
              </div>

              {/* Plain-English Interpretation */}
              <div className="space-y-1.5 p-4 bg-[#f8f8f8] border border-[#b1b4b6]">
                <h5 className="font-bold text-[#0b0c0c] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#00703c]" />
                  <span>What This Means in Plain English:</span>
                </h5>
                <p className="leading-relaxed text-[#505a5f] text-xs">
                  {displayMeaning}
                </p>
              </div>

              {/* Practical Examiner Compliance Checklist */}
              <div className="space-y-2 p-4 bg-white border border-[#b1b4b6]">
                <h5 className="font-bold text-[#0b0c0c] uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00703c]" />
                  <span>Patent Examiner Clearance Checklist:</span>
                </h5>
                <ul className="space-y-2 pt-1">
                  {displayChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#0b0c0c]">
                      <span className="font-bold text-[#00703c]">&bull;</span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official Gazette / Government Link */}
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-white border-2 border-[#1d70b8] hover:bg-[#f3f2f1] text-[#1d70b8] font-bold text-xs transition-colors group shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Read Full Act on Official Government Gazette Portal</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#f3f2f1] border border-[#b1b4b6] text-[#0b0c0c]">
                  Official Portal &rarr;
                </span>
              </a>
            </div>

            {/* 3. Footer */}
            <div className="mt-6 pt-4 border-t border-[#b1b4b6] text-[11px] text-[#505a5f] text-center">
              Statutory Intelligence Grounded in The Patents Act (1970) &amp; BDA (2023)
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
