'use client';

import React, { useState } from 'react';
import { Eye, Shield, Scale, Sparkles } from 'lucide-react';

export const GovtBanner: React.FC = () => {
  const [activeSize, setActiveSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isHighContrast, setIsHighContrast] = useState(false);

  const handleSetSize = (size: 'sm' | 'base' | 'lg') => {
    setActiveSize(size);
    if (typeof document !== 'undefined') {
      if (size === 'sm') document.documentElement.style.fontSize = '14px';
      if (size === 'base') document.documentElement.style.fontSize = '16px';
      if (size === 'lg') document.documentElement.style.fontSize = '18px';
    }
  };

  const handleToggleContrast = () => {
    setIsHighContrast((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      }
      return next;
    });
  };

  return (
    <header className="w-full bg-white border-b border-slate-200">
      {/* 1. Tricolor Top Accent Strip (Saffron, White, India Green) */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-[#FF9933]" title="Saffron" />
        <div className="h-full flex-1 bg-white" title="White" />
        <div className="h-full flex-1 bg-[#138808]" title="India Green" />
      </div>

      {/* 2. Official Utility & Accessibility Strip */}
      <div className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">भारत सरकार</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Government of India</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
              Digital India Initiative
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-medium text-slate-600">
            <a
              href="#main-content"
              className="hover:text-blue-700 transition-colors focus:underline"
            >
              Skip to Main Content
            </a>
            <span className="text-slate-300">|</span>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`px-2 py-0.5 rounded-md border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                isHighContrast
                  ? 'bg-slate-900 text-amber-300 border-amber-400'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              aria-label="Toggle High Contrast Accessibility Mode"
            >
              <Eye className={`w-3 h-3 ${isHighContrast ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{isHighContrast ? 'Contrast: High' : 'High Contrast'}</span>
            </button>

            <span className="text-slate-300">|</span>

            {/* Text Size Controls */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-0.5">Font:</span>
              <button
                type="button"
                onClick={() => handleSetSize('sm')}
                className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] font-bold transition-all ${
                  activeSize === 'sm'
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleSetSize('base')}
                className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] font-bold transition-all ${
                  activeSize === 'base'
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Standard font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleSetSize('lg')}
                className={`w-5 h-5 rounded flex items-center justify-center border text-[10px] font-bold transition-all ${
                  activeSize === 'lg'
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modern DPI Masthead (Sovereign Insignia + AI Copilot Branding) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          {/* Sovereign IP-SAKTI Emblem SVG */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#002147] via-[#0b3d91] to-[#1e40af] p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#002147] flex items-center justify-center relative overflow-hidden">
              {/* Subtle Ashoka Chakra Radial Glow */}
              <div className="absolute inset-0 bg-radial from-blue-500/20 to-transparent" />
              <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 relative z-10" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                National AI Platform
              </span>
              <span className="text-[11px] text-slate-400">•</span>
              <span className="text-[11px] font-semibold text-slate-600">
                Digital Public Infrastructure
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                IP-SAKTI Sahayak
              </h1>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                v1.5 BAAI
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
              National Statutory AI Copilot for Intellectual Property, TKDL Prior-Art &amp; Biodiversity Compliance (BDA 2023)
            </p>
          </div>
        </div>

        {/* Live Infrastructure Pills */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Qdrant Cloud &bull; Active</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              8,936 Legal Chunks Synced
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-left">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">DPDP Act Compliant</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Zero-PII Sovereign Guardrails
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
