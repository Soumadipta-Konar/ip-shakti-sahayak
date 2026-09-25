'use client';

import React from 'react';
import Link from 'next/link';

export const GdsFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#f3f2f1] text-[#0b0c0c] border-t-2 border-[#1d70b8] pt-8 pb-10 mt-16 print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#b1b4b6] pb-6">
          {/* Left Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#0b0c0c]">
              Enterprise Platform Services
            </h4>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#1d70b8]">
              <Link href="/" className="hover:underline">Statutory Clearance Engine</Link>
              <span>&bull;</span>
              <Link href="/wizard" className="hover:underline">Formulation Triage</Link>
              <span>&bull;</span>
              <Link href="/prior-art" className="hover:underline">CSIR-TKDL Screening</Link>
              <span>&bull;</span>
              <Link href="/abs-calculator" className="hover:underline">BDA 2023 ABS Calculator</Link>
              <span>&bull;</span>
              <Link href="/dossier" className="hover:underline">Audit Dossier Export</Link>
              <span>&bull;</span>
              <Link href="/history" className="hover:underline">Statutory Citations</Link>
            </div>
            <p className="text-xs text-[#505a5f] max-w-2xl leading-relaxed pt-1">
              Built for commercial patent attorneys, pharmaceutical manufacturers, and bio-resource enterprises. Grounded in The Patents Act 1970, Biological Diversity Act 2023, Drugs &amp; Cosmetics Act 1940, and international patent treaties.
            </p>
          </div>

          {/* Right Brand & SLA */}
          <div className="text-left md:text-right space-y-1.5 flex-shrink-0 text-xs text-[#505a5f]">
            <div className="font-bold text-sm text-[#0b0c0c]">
              IP-SAKTI Sahayak
            </div>
            <div>Commercial LegalTech Platform</div>
            <div className="font-mono text-[11px] text-[#1d70b8]">Qdrant Cloud RAG v1.5 Synced</div>
          </div>
        </div>

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#505a5f]">
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="hover:underline">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:underline">Enterprise Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:underline">Statutory Disclaimer</Link>
            <span>&bull;</span>
            <Link href="/" className="hover:underline">API SLA &amp; Uptime</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} IP-SAKTI Sahayak. Commercial Statutory Intelligence.
          </div>
        </div>
      </div>
    </footer>
  );
};
