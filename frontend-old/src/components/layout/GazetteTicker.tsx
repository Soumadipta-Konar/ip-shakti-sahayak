'use client';

import React from 'react';
import { Bell, ChevronRight, ShieldCheck } from 'lucide-react';

export const GazetteTicker: React.FC = () => {
  return (
    <div className="w-full bg-slate-100/90 border-b border-slate-200 py-1.5 px-4 sm:px-8 overflow-hidden text-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Ticker Tag / Label */}
        <div className="flex items-center gap-1.5 bg-[#002147] text-white px-2.5 py-0.5 rounded text-[11px] font-bold flex-shrink-0 shadow-2xs">
          <Bell className="w-3 h-3 text-[#FF9933] animate-pulse" />
          <span className="uppercase tracking-wider">Gazette Flash:</span>
        </div>

        {/* Scrolling News Stream */}
        <div className="flex-1 overflow-x-hidden whitespace-nowrap relative">
          <div className="animate-marquee hover:pause text-slate-700 text-[11px] font-medium items-center gap-10">
            <span className="inline-flex items-center gap-1.5 mr-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              <span><strong>Biological Diversity (Amendment) Act, 2023:</strong> Exemption for registered Vaidyas under Section 7 and mandatory 0.5% ABS commercial brackets operational.</span>
            </span>

            <span className="inline-flex items-center gap-1.5 mr-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              <span><strong>CSIR-TKDL Vector Sync:</strong> 500,000+ classical formulations integrated into Qdrant Cloud BAAI/bge-small-en-v1.5 embeddings for Section 3(p) prior-art screening.</span>
            </span>

            <span className="inline-flex items-center gap-1.5 mr-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
              <span><strong>CDSCO Rule 122-E Phytopharmaceuticals:</strong> Fast-track Phase I-III clinical trial dossier export protocol live.</span>
            </span>

            <span className="inline-flex items-center gap-1.5 mr-8">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>GIGW 3.0 &amp; DPDP Act 2023 certified sovereign cloud orchestration.</span>
            </span>

            {/* Loop clone for continuous animation */}
            <span className="inline-flex items-center gap-1.5 mr-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              <span><strong>Biological Diversity (Amendment) Act, 2023:</strong> Exemption for registered Vaidyas under Section 7 and mandatory 0.5% ABS commercial brackets operational.</span>
            </span>

            <span className="inline-flex items-center gap-1.5 mr-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              <span><strong>CSIR-TKDL Vector Sync:</strong> 500,000+ classical formulations integrated into Qdrant Cloud BAAI/bge-small-en-v1.5 embeddings for Section 3(p) prior-art screening.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
