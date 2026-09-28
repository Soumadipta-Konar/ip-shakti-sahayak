'use client';

import React from 'react';
import Link from 'next/link';
import { Scale, ShieldCheck, ExternalLink, BookOpen, Layers } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';

export const ModernFooter: React.FC = () => {
  const { language } = useAppStore();
  const isHi = language === 'hi';

  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Platform Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                ⚖️
              </div>
              <span className="font-bold text-slate-900 text-sm font-display tracking-tight">
                IP-SAKTI Sahayak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isHi
                ? 'भारतीय वानस्पतिक पेटेंट, टीकेडीएल पूर्व-कला और जैव-संसाधन अनुपालन हेतु भारत का अग्रणी AI-संचालित कानूनी निर्णय समर्थन मंच।'
                : 'Enterprise decision-support system clearing botanical and pharmaceutical formulations against Section 3(p) bars and BDA 2023 liabilities.'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-slate-500" />
                DPDP Act 2023 Compliant
              </span>
            </div>
          </div>

          {/* Column 2: Clearance Tools */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {isHi ? 'अनुपालन उपकरण' : 'Compliance Tools'}
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link href="/?tab=wizard" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>1. {isHi ? 'फॉर्मूलेशन ट्राइएज' : 'Formulation Triage'}</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=prior-art" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>2. {isHi ? 'सीएसआईआर-टीकेडीएल जांच' : 'CSIR-TKDL Screen'}</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=abs" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>3. {isHi ? 'बीडीए 2023 कैलकुलेटर' : 'BDA 2023 ABS Calculator'}</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=dossier" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>4. {isHi ? 'डिजिटल अनुपालन डोजियर' : 'Compliance Dossier'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Statutory Reference Corpus */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {isHi ? 'वैधानिक संविधि संदर्भ' : 'Statutory Corpus'}
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <StatutoryTooltip termId="section-3p" position="top">
                  <span className="hover:text-blue-600 cursor-help transition-colors">
                    The Patents Act, 1970 § 3(p)
                  </span>
                </StatutoryTooltip>
              </li>
              <li>
                <StatutoryTooltip termId="section-3e" position="top">
                  <span className="hover:text-blue-600 cursor-help transition-colors">
                    The Patents Act, 1970 § 3(e) (Synergy)
                  </span>
                </StatutoryTooltip>
              </li>
              <li>
                <StatutoryTooltip termId="bda-2023" position="top">
                  <span className="hover:text-blue-600 cursor-help transition-colors">
                    Biological Diversity Act, 2023
                  </span>
                </StatutoryTooltip>
              </li>
              <li>
                <StatutoryTooltip termId="phytopharmaceutical" position="top">
                  <span className="hover:text-blue-600 cursor-help transition-colors">
                    CDSCO Drugs & Cosmetics Rule 122-E
                  </span>
                </StatutoryTooltip>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Portals */}
          <div className="space-y-2.5">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              {isHi ? 'सरकारी पोर्टल' : 'Official Authorities'}
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a 
                  href="https://ipindia.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Indian Patent Office (IPO)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a 
                  href="http://nbaindia.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>National Biodiversity Authority (NBA)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://cdsco.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>CDSCO (Ministry of Health)</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
              <li>
                <a 
                  href="https://ayush.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Ministry of AYUSH</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} IP-SAKTI Sahayak • Smart India Hackathon (SIH 045). Statutory Intelligence Platform.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/?tab=history" className="hover:text-slate-600 transition-colors">
              {isHi ? 'सहेजे गए परामर्श' : 'Saved Consultations Vault'}
            </Link>
            <span>&bull;</span>
            <Link href="/?tab=copilot" className="hover:text-slate-600 transition-colors">
              {isHi ? 'कानूनी AI कोपायलट' : 'Legal AI Copilot'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
