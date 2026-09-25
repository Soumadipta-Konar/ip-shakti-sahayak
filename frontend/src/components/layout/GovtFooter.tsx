'use client';

import React from 'react';
import Link from 'next/link';
import { AshokaEmblem } from './AshokaEmblem';
import { ShieldCheck, ExternalLink, Phone, Mail, Globe, MapPin } from 'lucide-react';

export const GovtFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#001737] text-white border-t-4 border-[#FF9933] pt-12 pb-6 print:hidden mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-300">
          {/* Column 1: Government Identity & Portal Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AshokaEmblem size={48} className="flex-shrink-0" />
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-serif">
                  IP-SAKTI Sahayak
                </h4>
                <p className="text-[10px] text-amber-400 font-semibold">
                  National Statutory AI Platform &bull; भारत सरकार
                </p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              An official Digital Public Infrastructure initiative delivering real-time statutory triage, CSIR-TKDL Section 3(p) prior-art screening, and Biological Diversity Act 2023 compliance.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>GIGW 3.0 &bull; DPDP Act 2023 Verified</span>
            </div>
          </div>

          {/* Column 2: Statutory Acts & Regulatory Frameworks */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-blue-900/80 pb-2">
              Statutory Governing Acts
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li>
                <span className="text-white font-semibold">The Patents Act, 1970</span>
                <p className="text-slate-400 text-[10px]">Sections 3(p), 3(e), 3(d) Traditional Knowledge Exclusions</p>
              </li>
              <li>
                <span className="text-white font-semibold">Biological Diversity Act, 2023</span>
                <p className="text-slate-400 text-[10px]">Section 7 Vaidya Exemptions &amp; 0.5% ABS Commercial Levies</p>
              </li>
              <li>
                <span className="text-white font-semibold">Drugs &amp; Cosmetics Rules, 1945</span>
                <p className="text-slate-400 text-[10px]">Rule 158-B Classical Proof &amp; Rule 122-E Phytopharmaceuticals</p>
              </li>
              <li>
                <span className="text-white font-semibold">FSSAI Ayurveda-Aahar, 2022</span>
                <p className="text-slate-400 text-[10px]">Nutraceutical and Traditional Dietary Supplement Norms</p>
              </li>
            </ul>
          </div>

          {/* Column 3: Sovereign Partner Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-blue-900/80 pb-2">
              Official Portals
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <a
                  href="https://ipindia.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>Intellectual Property India (CGPDTM)</span>
                </a>
              </li>
              <li>
                <a
                  href="http://nbaindia.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>National Biodiversity Authority (NBA)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://cdsco.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>Central Drugs Standard Control Org (CDSCO)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.csir.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>CSIR-TKDL Traditional Knowledge Digital Library</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpdesk, Support & Grievances */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-blue-900/80 pb-2">
              National Support &amp; Grievance
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Toll-Free Helpline: <strong>1800-11-2026</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email: <strong>sahayak-support@gov.in</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Working Hours: <strong>09:00 - 17:30 IST (Mon-Fri)</strong></span>
              </div>
              <div className="pt-2 text-[10px] text-slate-400">
                DPDP Act 2023 Compliant &bull; Hosting on Sovereign Government Cloud Infrastructure
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar: Copyright, Terms, Privacy */}
        <div className="pt-6 border-t border-blue-950/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-white transition-colors">Hyperlinking Policy</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-white transition-colors">Accessibility Statement</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:text-white transition-colors">Help / FAQ</Link>
          </div>

          <div className="text-center sm:text-right text-[10px] text-slate-400">
            Content Owned and Maintained by Government of India &bull; Designed &amp; Developed for SIH 2024
          </div>
        </div>
      </div>
    </footer>
  );
};
