'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Calculator, 
  Globe, 
  MessageSquare, 
  CheckCircle2, 
  Printer, 
  Search, 
  FileText, 
  BookMarked 
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const Header: React.FC = () => {
  const { language, setLanguage, classificationState } = useAppStore();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Legal AI Copilot', icon: MessageSquare },
    { href: '/wizard', label: 'Formulation Triage', icon: Sparkles },
    { href: '/abs-calculator', label: 'BDA 2023 ABS Calculator', icon: Calculator },
    { href: '/prior-art', label: 'TKDL Prior-Art Analyzer', icon: Search },
    { href: '/dossier', label: 'Statutory Dossier', icon: FileText },
    { href: '/history', label: 'Saved Citations', icon: BookMarked },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs (Modern Rounded Pill Tabs) */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Area: Triage Badge & Language Selector */}
        <div className="flex items-center gap-2.5 py-2">
          {/* Active Triage Pill */}
          {classificationState ? (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-800 font-semibold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[180px]">
                {classificationState.category?.split('.')[1]?.trim() || classificationState.category}
              </span>
            </div>
          ) : (
            <Link
              href="/wizard"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-xs text-amber-800 font-semibold transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Formulation Not Triaged</span>
            </Link>
          )}

          {/* Download PDF Quick Action */}
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold transition-colors shadow-2xs"
            title="Download or Print Statutory Dossier / Page as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PDF</span>
          </button>

          {/* Bhashini Indic Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              aria-label="Select Interface Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};
