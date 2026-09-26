'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';

export const GdsPhaseBanner: React.FC = () => {
  const { language } = useAppStore();
  const t = getTranslations(language);

  return (
    <div className="bg-[#f3f2f1] border-b border-[#b1b4b6] py-2 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2.5 text-xs text-[#0b0c0c]">
        <span className="gds-tag gds-tag-blue font-bold">{t.phaseTag}</span>
        <span>{t.phaseBannerText}</span>
      </div>
    </div>
  );
};
