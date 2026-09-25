'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Phone, Volume2 } from 'lucide-react';

export const GovtBanner: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [activeSize, setActiveSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Format real-time live clock: "Friday, September 25, 2026 | 5:35:12 PM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setCurrentDateTime(now.toLocaleDateString('en-IN', options).replace(' at ', ' | '));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="w-full">
      {/* 1. National Tricolor Sovereign Strip (Saffron, White, India Green) */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#FF9933]" title="Saffron" />
        <div className="h-full flex-1 bg-white" title="White" />
        <div className="h-full flex-1 bg-[#138808]" title="India Green" />
      </div>

      {/* 2. Official Utility & Accessibility Strip (Warm Champagne Bar - Exactly like Passport Seva) */}
      <div className="bg-[#FFFDF4] border-b border-[#F2E5C9] text-xs text-slate-700 py-1.5 px-4 sm:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Live Indian Standard Time Clock */}
          <div className="flex items-center gap-2 font-medium text-slate-800 text-[11px] sm:text-xs">
            <span>{currentDateTime || 'Friday, September 25, 2026 | 5:35:00 PM'}</span>
          </div>

          {/* Right: Accessibility, Language, and Toll-Free Helpline */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] font-medium text-slate-700">
            <a
              href="#main-content"
              className="hover:text-blue-900 transition-colors underline-offset-2 hover:underline"
            >
              Skip to Main Content
            </a>
            <span className="text-slate-300">|</span>

            <a
              href="#screen-reader"
              className="hover:text-blue-900 transition-colors flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Screen Reader Access</span>
            </a>
            <span className="text-slate-300">|</span>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 transition-all ${
                isHighContrast
                  ? 'bg-slate-900 text-amber-300 border-amber-400'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Toggle High Contrast Mode"
            >
              <Eye className="w-3 h-3" />
              <span>{isHighContrast ? 'Contrast: High' : 'High Contrast'}</span>
            </button>
            <span className="text-slate-300">|</span>

            {/* Font Sizer Controls (A- A A+) */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleSetSize('sm')}
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-colors ${
                  activeSize === 'sm' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="Decrease Text Size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleSetSize('base')}
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-colors ${
                  activeSize === 'base' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleSetSize('lg')}
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold border transition-colors ${
                  activeSize === 'lg' ? 'bg-[#002147] text-white border-[#002147]' : 'bg-white border-slate-300 text-slate-700'
                }`}
                title="Increase Text Size"
              >
                A+
              </button>
            </div>
            <span className="text-slate-300">|</span>

            {/* Hindi / English Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-blue-900 font-bold hover:underline"
            >
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <span className="text-slate-300">|</span>

            {/* Toll Free Call Center (Like Passport Seva's National Call Center) */}
            <div className="flex items-center gap-1 text-slate-800 font-semibold">
              <Phone className="w-3 h-3 text-[#B8860B]" />
              <span className="text-[10px] text-slate-500 hidden md:inline">Statutory Call Center:</span>
              <a href="tel:1800112026" className="text-blue-900 font-bold hover:underline">
                1800-11-2026
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
