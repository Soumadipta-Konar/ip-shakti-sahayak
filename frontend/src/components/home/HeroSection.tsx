'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Scale, 
  ShieldCheck, 
  Database, 
  BookOpen, 
  Bot,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ActiveWorkspaceTab } from '@/app/page';

interface HeroSectionProps {
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTab }) => {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#00142e] via-[#00224d] to-[#0a3977] text-white shadow-xl border border-blue-900/50">
      {/* Subtle Sovereign Traditional Watermark Patterns */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute right-1/3 -bottom-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Heading & Calls to Action (Passport Seva Typography) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Welcome Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-200 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
            <span>Welcome to IP-SAKTI Sahayak</span>
            <span className="text-blue-400">&bull;</span>
            <span className="text-amber-300">Government of India</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Delivering Statutory IPR &amp; Biodiversity Intelligence to Innovators
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal">
            Screen botanical and polyherbal formulations against <strong>500,000+ CSIR-TKDL</strong> prior-art citations, assess Section 3(p) &amp; 3(e) patentability risks, compute <strong>BDA 2023</strong> benefit-sharing liability, and compile statutory regulatory compliance dossiers.
          </p>

          {/* Dual CTAs (Passport Seva Style) */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => onSelectTab('copilot')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#E68A00] hover:from-[#FFA74D] hover:to-[#FF9933] text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
            >
              <Bot className="w-4 h-4 text-slate-950" />
              <span>Launch AI Copilot</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('wizard')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Diagnose Formulation (Step 1)</span>
            </button>
          </div>

          {/* Live System Metrics Badges */}
          <div className="pt-4 border-t border-blue-900/60 flex flex-wrap items-center gap-4 text-xs text-blue-200/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Qdrant Cloud:</span>
              <span>8,936 Chunks Synced (BAAI v1.5)</span>
            </div>
            <span className="text-blue-500 hidden sm:inline">&bull;</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-PII Sovereign Guardrails (DPDP Act)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sovereign Illuminated 3D Holographic AI Codex (Mirroring the Golden Passport visual in Passport Seva) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group">
            {/* Golden Radial Halo Glow Ring (Passport Seva Signature Aura) */}
            <div className="absolute -inset-6 bg-gradient-to-r from-[#FF9933]/30 via-yellow-400/20 to-blue-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all opacity-80" />

            {/* Glowing Sovereign Codex Card */}
            <div className="relative w-72 sm:w-80 p-6 rounded-3xl bg-gradient-to-br from-[#0c2a55]/95 via-[#001f3f]/95 to-[#05172e]/95 border-2 border-amber-400/40 shadow-2xl backdrop-blur-xl text-center space-y-4">
              {/* Top Sovereign Insignia Badge */}
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-[#B8860B] p-0.5 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#001737] flex items-center justify-center">
                  <Scale className="w-8 h-8 text-amber-300 drop-shadow-md" />
                </div>
              </div>

              {/* Title & Statutory Seal */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Republic of India &bull; भारत गणराज्य
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  National Statutory AI Codex
                </h3>
                <p className="text-xs text-blue-200/80 font-mono mt-0.5">
                  Statutory IPR &bull; BDA 2023 &bull; TKDL
                </p>
              </div>

              {/* Verification Pills */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    TKDL Section 3(p) Bar Check
                  </span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    BDA 2023 ABS Calculator
                  </span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                <div className="flex items-center justify-between text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    CDSCO Rule 122-E Pathway
                  </span>
                  <span className="text-emerald-400 font-bold">SYNCED</span>
                </div>
              </div>

              {/* Holographic Verification Ribbon */}
              <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-amber-300/90 font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Verifiable Sovereign AI Pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
