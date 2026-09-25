'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AshokaEmblem } from './AshokaEmblem';
import { 
  Search, 
  MessageSquare, 
  Sparkles, 
  Calculator, 
  BookOpen, 
  FileText, 
  BookMarked,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage } = useAppStore();
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/?tab=copilot', label: 'AI Copilot' },
    { href: '/wizard', label: 'Formulation Triage' },
    { href: '/prior-art', label: 'TKDL Prior-Art' },
    { href: '/abs-calculator', label: 'BDA 2023 ABS' },
    { href: '/dossier', label: 'Compliance Dossier' },
    { href: '/history', label: 'Saved Citations' },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Ashoka Emblem & Brand Identity (Passport Seva Style) */}
        <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0">
          <AshokaEmblem size={52} className="flex-shrink-0 drop-shadow-2xs group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#002147] tracking-tight font-serif">
                IP-SAKTI Sahayak
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
                AI Copilot
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">
              National Statutory Intellectual Property &amp; Biodiversity Portal &bull; भारत सरकार
            </p>
          </div>
        </Link>

        {/* Center / Right: Clean Modern Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-700">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href === '/?tab=copilot' && pathname === '/' && false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-blue-700 font-bold bg-blue-50'
                    : 'hover:text-[#002147] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search + Login / Register Action Buttons (Exactly like Passport Seva) */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Quick Search Button */}
          <button
            type="button"
            className="p-2 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-slate-100 transition-colors"
            title="Search Statutory Knowledgebase"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Login Button (Crisp White with Royal Navy Border) */}
          <Link
            href="/?tab=copilot"
            className="px-3.5 sm:px-4 py-1.5 rounded-lg border-2 border-[#1565C0] text-[#1565C0] hover:bg-blue-50/80 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>

          {/* Register Button (Solid Royal Blue) */}
          <Link
            href="/wizard"
            className="px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Register</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
