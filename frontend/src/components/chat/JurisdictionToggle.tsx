'use client';

import React from 'react';
import { Jurisdiction } from '@/lib/types';

interface Props {
  value: Jurisdiction;
  onChange: (val: Jurisdiction) => void;
}

export const JurisdictionToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="inline-flex p-0.5 bg-[#f3f2f1] border border-[#b1b4b6] text-xs font-bold shadow-2xs">
      <button
        type="button"
        onClick={() => onChange('IN')}
        className={`px-2.5 py-1 transition-colors ${
          value === 'IN'
            ? 'bg-[#0b0c0c] text-white'
            : 'text-[#505a5f] hover:text-[#0b0c0c] hover:bg-white'
        }`}
        title="Indian Patents Act 1970 & Biological Diversity Act 2023"
      >
        <span>🇮🇳 India Law</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('INTL')}
        className={`px-2.5 py-1 transition-colors ${
          value === 'INTL'
            ? 'bg-[#1d70b8] text-white'
            : 'text-[#505a5f] hover:text-[#0b0c0c] hover:bg-white'
        }`}
        title="International Treaties (WIPO PCT, US FDA Botanical & EMA)"
      >
        <span>🌐 Global Law</span>
      </button>
    </div>
  );
};
