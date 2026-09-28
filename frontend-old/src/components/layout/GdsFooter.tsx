'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';

export const GdsFooter: React.FC = () => {
  const { language } = useAppStore();
  const t = getTranslations(language);

  return (
    <footer className="w-full bg-[#f3f2f1] text-[#0b0c0c] border-t-2 border-[#1d70b8] pt-8 pb-10 mt-16 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#b1b4b6] pb-6">
          {/* Left Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#0b0c0c]">
              {t.footerServicesTitle}
            </h4>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#1d70b8]">
              <Link href="/" className="hover:underline">{t.footerStatutoryClearance}</Link>
              <span>&bull;</span>
              <Link href="/?tab=wizard" className="hover:underline">{t.footerFormulationTriage}</Link>
              <span>&bull;</span>
              <Link href="/?tab=prior-art" className="hover:underline">{t.footerTkdlScreening}</Link>
              <span>&bull;</span>
              <Link href="/?tab=abs" className="hover:underline">{t.footerAbsCalculator}</Link>
              <span>&bull;</span>
              <Link href="/?tab=dossier" className="hover:underline">{t.footerDossierExport}</Link>
              <span>&bull;</span>
              <Link href="/?tab=history" className="hover:underline">{t.footerCitations}</Link>
            </div>
            <p className="text-xs text-[#505a5f] max-w-2xl leading-relaxed pt-1">
              {t.phaseBannerText}
            </p>
          </div>

          {/* Right Brand & SLA */}
          <div className="text-left md:text-right space-y-1.5 flex-shrink-0 text-xs text-[#505a5f]">
            <div className="font-bold text-sm text-[#0b0c0c]">
              {t.brandTitle}
            </div>
            <div>{t.enterpriseTag}</div>
            <div className="font-mono text-[11px] text-[#1d70b8]">{t.footerPlatformNote}</div>
          </div>
        </div>

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#505a5f]">
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="hover:underline">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:underline">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:underline">Statutory Disclaimer</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} {t.brandTitle}. {t.footerDisclaimer}
          </div>
        </div>
      </div>
    </footer>
  );
};
