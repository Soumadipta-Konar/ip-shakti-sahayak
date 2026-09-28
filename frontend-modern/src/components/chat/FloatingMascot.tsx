'use client';

import React, { useState } from 'react';
import { Bot, MessageSquare, X, Sparkles } from 'lucide-react';
import { ActiveWorkspaceTab } from '@/app/page';

interface FloatingMascotProps {
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
}

export const FloatingMascot: React.FC<FloatingMascotProps> = ({ onSelectTab }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClick = () => {
    onSelectTab('copilot');
    const el = document.getElementById('copilot-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end">
      {/* Speech Bubble Pill */}
      {isOpen && (
        <div className="mb-2 relative bg-white border border-slate-200 rounded-2xl px-3.5 py-2 shadow-lg text-slate-800 text-xs font-semibold max-w-[210px] animate-bounce-subtle flex items-start gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center border border-slate-300 transition-colors"
            title="Dismiss bubble"
          >
            <X className="w-3 h-3" />
          </button>
          <Sparkles className="w-3.5 h-3.5 text-[#FF9933] flex-shrink-0 mt-0.5" />
          <span className="leading-snug text-[11px]">
            Need statutory advice? <strong>Ask Sahayak AI</strong>!
          </span>
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        type="button"
        onClick={handleClick}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#002147] via-[#0b3d91] to-[#1565C0] text-white shadow-xl hover:shadow-2xl border-2 border-amber-400 flex items-center justify-center group cursor-pointer hover:scale-105 transition-all"
        title="Open IP-SAKTI Sahayak AI Copilot"
        aria-label="Open IP-SAKTI Sahayak AI Copilot"
      >
        <div className="relative">
          <Bot className="w-7 h-7 text-amber-300 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#002147] animate-pulse" />
        </div>
      </button>
    </div>
  );
};
