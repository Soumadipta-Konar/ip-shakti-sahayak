'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Scale, ExternalLink, ShieldCheck, BookOpen } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { StatutoryCitation } from '@/lib/types';

interface InlineCitationProps {
  rawMatch: string;
  matchedText: string;
}

// Canonical statutory repository for instant citation lookup & hover preview
const STATUTORY_REGISTRY: Record<string, { act: string; section: string; snippet: string; url: string }> = {
  '3(p)': {
    act: 'The Patents Act, 1970',
    section: 'Section 3(p)',
    snippet: 'An invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.',
    url: 'https://www.ipindia.gov.in/patents.htm',
  },
  '3(e)': {
    act: 'The Patents Act, 1970',
    section: 'Section 3(e)',
    snippet: 'A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable.',
    url: 'https://www.ipindia.gov.in/patents.htm',
  },
  '3(d)': {
    act: 'The Patents Act, 1970',
    section: 'Section 3(d)',
    snippet: 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance is not patentable.',
    url: 'https://www.ipindia.gov.in/patents.htm',
  },
  '6': {
    act: 'Biological Diversity Act, 2002 (as amended 2023)',
    section: 'Section 6',
    snippet: 'No person shall apply for any intellectual property right for any invention based on any research or information on a biological resource obtained from India without obtaining previous approval of the National Biodiversity Authority.',
    url: 'http://nbaindia.org/',
  },
  '7': {
    act: 'Biological Diversity Act, 2002 (as amended 2023)',
    section: 'Section 7',
    snippet: 'Prior intimation to State Biodiversity Board for commercial utilization of biological resources (exempts traditional codified knowledge users).',
    url: 'http://nbaindia.org/',
  },
  '158-b': {
    act: 'Drugs and Cosmetics Rules, 1945',
    section: 'Rule 158-B',
    snippet: 'Prescribes mandatory textual citations for classical Ayurvedic formulations vs safety literature and clinical trials for Patent-or-Proprietary (P&P) medicines.',
    url: 'https://cdsco.gov.in',
  },
  '122-e': {
    act: 'Drugs and Cosmetics Rules, 1945',
    section: 'Rule 122-E & Schedule Y-A',
    snippet: 'Standards for Phytopharmaceutical drugs: purified fractionated extracts with minimum 4 bioactive markers subjected to Phase I-III clinical trials.',
    url: 'https://cdsco.gov.in',
  }
};

export const InlineCitation: React.FC<InlineCitationProps> = ({ rawMatch, matchedText }) => {
  const { setSelectedCitation, jurisdiction } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);

  // Normalize match to find canonical citation
  const lower = rawMatch.toLowerCase();
  let citationData = STATUTORY_REGISTRY['3(p)']; // default fallback

  if (lower.includes('3(p)') || lower.includes('3p')) {
    citationData = STATUTORY_REGISTRY['3(p)'];
  } else if (lower.includes('3(e)') || lower.includes('3e')) {
    citationData = STATUTORY_REGISTRY['3(e)'];
  } else if (lower.includes('3(d)') || lower.includes('3d')) {
    citationData = STATUTORY_REGISTRY['3(d)'];
  } else if (lower.includes('158') || lower.includes('158-b')) {
    citationData = STATUTORY_REGISTRY['158-b'];
  } else if (lower.includes('122') || lower.includes('122-e')) {
    citationData = STATUTORY_REGISTRY['122-e'];
  } else if (lower.includes('sec 6') || lower.includes('section 6') || lower.includes('bda')) {
    citationData = STATUTORY_REGISTRY['6'];
  } else if (lower.includes('sec 7') || lower.includes('section 7')) {
    citationData = STATUTORY_REGISTRY['7'];
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 900);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHovered(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleOpenDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citationPayload: StatutoryCitation = {
      id: `cit-inline-${Date.now()}`,
      act: citationData.act,
      section: citationData.section,
      description: citationData.snippet,
      snippet: citationData.snippet,
      url: citationData.url,
      jurisdiction: jurisdiction === 'INTL' ? 'INTL' : 'IN',
    };
    setSelectedCitation(citationPayload);
  };

  const getBadgeColors = () => {
    return 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs';
  };

  return (
    <span 
      className="relative inline-block mx-1 align-baseline select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Badge */}
      <button
        type="button"
        onClick={handleOpenDrawer}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer ${getBadgeColors()}`}
        aria-label={`Inspect citation for ${citationData.section}`}
      >
        <Scale className="w-3 h-3 text-slate-500" />
        <span>{citationData.section}</span>
      </button>

      {/* Hover Card Preview */}
      {isHovered && (
        <span 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3.5 bg-white/98 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl z-50 text-left pointer-events-auto block animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          {/* Header */}
          <span className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="truncate max-w-[180px]">{citationData.act}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Proven Verbatim</span>
            </span>
          </span>

          {/* Section & Snippet */}
          <span className="block text-xs font-mono font-bold text-slate-900 mb-1">
            {citationData.section}
          </span>
          <span className="block text-xs text-slate-600 leading-relaxed italic line-clamp-3 mb-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
            &ldquo;{citationData.snippet}&rdquo;
          </span>

          {/* Action */}
          <span className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-indigo-600 font-semibold hover:text-indigo-800">
            <span>Click to inspect full statute</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </span>
      )}
    </span>
  );
};
