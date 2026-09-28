'use client';

import React from 'react';
import { Jurisdiction } from '@/lib/types';
import { ShieldCheck, Globe } from 'lucide-react';

interface Props {
  value: Jurisdiction;
  onChange: (val: Jurisdiction) => void;
}

export const JurisdictionToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="inline-flex p-0.5 sm:p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-inner">
      <button
        type="button"
        onClick={() => onChange('IN')}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
          value === 'IN'
            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
            : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
        }`}
        title="Indian Patents Act 1970 & Biological Diversity Act 2023"
      >
        <span className="text-xs sm:text-sm">🇮🇳</span>
        <span className="hidden sm:inline">India Law (IPO)</span>
        <span className="sm:hidden text-[11px]">IN</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('INTL')}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
          value === 'INTL'
            ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/80'
            : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
        }`}
        title="International Treaties (WIPO PCT, US FDA Botanical & EMA)"
      >
        <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Global Law (PCT)</span>
        <span className="sm:hidden text-[11px]">WIPO</span>
      </button>
    </div>
  );
};
