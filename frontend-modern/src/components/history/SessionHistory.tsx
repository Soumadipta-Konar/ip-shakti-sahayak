'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  Search, 
  ExternalLink, 
  Download, 
  Printer, 
  Scale, 
  Trash2, 
  Bookmark, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  MessageSquare, 
  ArrowRight,
  BookOpen,
  Filter,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Database,
  Info
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SavedResponseItem, StatutoryCitation } from '@/lib/types';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import { getTranslations } from '@/lib/translations';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';
import { printLegalDocument } from '@/lib/printUtils';

export const SessionHistory: React.FC = () => {
  const { 
    savedResponses, 
    removeSavedResponse, 
    clearSavedResponses,
    setSelectedCitation,
    language,
    hydrateFromStorage
  } = useAppStore();

  const t = getTranslations(language);
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Client-side hydration from localStorage on mount (guarantees persistence across refresh)
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Extract all unique sections across saved responses for filter chips
  const allUniqueSections = React.useMemo(() => {
    const set = new Set<string>();
    savedResponses.forEach((sr) => {
      (sr.sectionsDiscussed || []).forEach((sec) => set.add(sec));
    });
    return Array.from(set);
  }, [savedResponses]);

  // Filtered responses by query and section
  const filteredResponses = React.useMemo(() => {
    return savedResponses.filter((sr) => {
      const matchesSection = 
        filterSection === 'all' || 
        (sr.sectionsDiscussed || []).some((s) => s.toLowerCase() === filterSection.toLowerCase());

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        sr.query.toLowerCase().includes(q) ||
        sr.response.toLowerCase().includes(q) ||
        (sr.sectionsDiscussed || []).some((s) => s.toLowerCase().includes(q)) ||
        sr.timestamp.toLowerCase().includes(q);

      return matchesSection && matchesSearch;
    });
  }, [savedResponses, filterSection, searchQuery]);

  // Toggle expand/collapse for a specific row
  const toggleRow = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIds.size === filteredResponses.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredResponses.map((r) => r.id)));
    }
  };

  // Copy query + response text to clipboard
  const handleCopy = (item: SavedResponseItem) => {
    const textToCopy = `IP-SAKTI Statutory Consultation Record
Date & Time: ${item.timestamp}
Statutory Sections Discussed: ${(item.sectionsDiscussed || []).join(', ') || 'N/A'}

[USER QUERY]
${item.query}

[STATUTORY ADVICE & OPINION]
${item.response}
`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleClearAll = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }
    clearSavedResponses();
    setIsConfirmingClear(false);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      export_date: new Date().toISOString(),
      platform: "IP-SAKTI Sahayak Statutory Intelligence Platform",
      total_saved_records: savedResponses.length,
      saved_citations_and_consultations: savedResponses,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `IP_SAKTI_Saved_Consultations_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintDossier = () => {
    if (savedResponses.length === 0) return;

    const sections = savedResponses.map((item, idx) => ({
      heading: `Consultation #${idx + 1}: ${item.query}`,
      subheading: `Recorded on ${item.timestamp} | Jurisdiction: ${item.jurisdiction || 'IN'}`,
      timestamp: item.timestamp,
      bodyMarkdown: item.response,
      citations: item.citations,
    }));

    printLegalDocument({
      title: isHindi ? 'सहेजे गए वैधानिक परामर्श एवं उद्धरण संचय' : 'Statutory Saved Citations & Consultations Dossier',
      subtitle: isHindi ? 'सीएसआईआर-टीकेडीएल एवं भारतीय पेटेंट विधिक ग्राउंडिंग ऑडिट रिपोर्ट' : 'Official CSIR-TKDL & Indian Patent Practice Grounding Audit Report',
      jurisdiction: 'IN',
      language: isHindi ? 'hi' : 'en',
      sections,
    });
  };

  const handlePrintSingleItem = (item: SavedResponseItem) => {
    printLegalDocument({
      title: isHindi ? 'वैधानिक परामर्श कानूनी रिपोर्ट' : 'Statutory Legal Assessment Report',
      subtitle: `${isHindi ? 'सहेजे जाने का समय:' : 'Recorded:'} ${item.timestamp}`,
      jurisdiction: item.jurisdiction || 'IN',
      language: isHindi ? 'hi' : 'en',
      sections: [
        {
          heading: `${isHindi ? 'आवेदक का प्रश्न:' : 'Applicant Inquiry:'} ${item.query}`,
          subheading: isHindi ? 'विधिक एआई परामर्शदाता विश्लेषण' : 'Statutory Legal AI Copilot Assessment',
          timestamp: item.timestamp,
          bodyMarkdown: item.response,
          citations: item.citations,
        }
      ]
    });
  };

  const getSectionBadgeStyle = (secName: string) => {
    return 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 font-bold shadow-2xs';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 1. Modern Enterprise Card Header & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/15 flex-shrink-0">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {isHindi ? 'सहेजे गए उद्धरण वॉल्ट' : 'Saved Citations Vault'}
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-500" />
                {isHindi ? 'रिफ्रेश के बाद भी सुरक्षित' : 'Preserved on Refresh'}
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-mono">
                {savedResponses.length} {isHindi ? 'परामर्श सहेजे गए' : 'Consultations'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {t.savedCitationsTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {t.savedCitationsSubtitle}
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2.5 print:hidden flex-wrap">
          {savedResponses.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all bg-white shadow-2xs cursor-pointer"
                title={expandedIds.size === filteredResponses.length ? 'Collapse all answers' : 'Expand all answers'}
              >
                {expandedIds.size === filteredResponses.length 
                  ? (isHindi ? 'सभी संक्षिप्त करें' : 'Collapse All') 
                  : (isHindi ? 'सभी उत्तर देखें' : 'Expand All')}
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                  isConfirmingClear
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-700 bg-white'
                }`}
                title="Clear all saved responses from storage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isConfirmingClear ? (isHindi ? 'निश्चित रूप से हटाएं?' : 'Confirm Clear?') : (isHindi ? 'सभी हटाएं' : 'Clear All')}</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={savedResponses.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all bg-white shadow-2xs cursor-pointer disabled:opacity-40"
            title="Download full saved consultations repository as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? 'JSON निर्यात' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintDossier}
            disabled={savedResponses.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
            title="Print full saved citations dossier without clipping"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>{isHindi ? 'प्रिंट / पीडीएफ' : 'Print Dossier'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? 'कुल सहेजे गए' : 'Total Consultations'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {savedResponses.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? 'चर्चा की गई धाराएं' : 'Unique Sections Cited'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {allUniqueSections.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? 'डेटा सुरक्षा' : 'Data Integrity'}</span>
          </div>
          <p className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 inline-block font-mono shadow-2xs">
            {isHindi ? 'स्थानीय वॉल्ट सक्रिय' : 'Local Vault Active'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHindi ? 'सत्र स्थिति' : 'Storage State'}</span>
          </div>
          <p className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 inline-block font-mono">
            localStorage 100%
          </p>
        </div>
      </div>

      {/* 3. Search & Section Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi 
              ? 'सहेजे गए प्रश्नों, उत्तरों या धाराओं में खोजें...' 
              : 'Search saved queries, statutory responses, or legal sections...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Section Filter Pills */}
        {allUniqueSections.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>{isHindi ? 'धारा द्वारा फ़िल्टर:' : 'Filter by Section:'}</span>
            </span>

            <button
              type="button"
              onClick={() => setFilterSection('all')}
              className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                filterSection === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isHindi ? 'सभी' : 'All'} ({savedResponses.length})
            </button>

            {allUniqueSections.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setFilterSection(sec)}
                className={`text-xs px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer border ${
                  filterSection === sec
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Modern Tabular List of Saved Citations & Consultations */}
      {filteredResponses.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 border-b border-slate-200/80">
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[11px] w-[180px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isHindi ? 'तारीख एवं समय' : 'Date & Time'}</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isHindi ? 'उपयोगकर्ता का प्रश्न (Query)' : 'User Query'}</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[11px] w-[240px]">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isHindi ? 'चर्चा की गई धाराएं' : 'Sections Discussed'}</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-5 font-bold uppercase tracking-wider text-[11px] text-right w-[140px]">
                    <span>{isHindi ? 'कार्रवाई' : 'Action'}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResponses.map((item, idx) => {
                  const isExpanded = expandedIds.has(item.id);
                  const isCopied = copiedId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Main Tabular Row (Clickable) */}
                      <tr 
                        onClick={() => toggleRow(item.id)}
                        className={`transition-colors cursor-pointer select-none group ${
                          isExpanded 
                            ? 'bg-indigo-50/30' 
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Column 1: Date & Time */}
                        <td className="py-4 px-5 font-mono text-[11px] text-slate-500 whitespace-nowrap align-top">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{item.timestamp.split(',')[0]}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pl-4.5 mt-0.5">
                            {item.timestamp.split(',')[1] || ''}
                          </div>
                        </td>

                        {/* Column 2: User Query */}
                        <td className="py-4 px-5 align-top">
                          <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                            {item.query}
                          </div>
                          {!isExpanded && (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal leading-relaxed">
                              {item.response.replace(/[#*`_]/g, '').slice(0, 130)}...
                            </div>
                          )}
                        </td>

                        {/* Column 3: Sections Discussed */}
                        <td className="py-4 px-5 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {item.sectionsDiscussed && item.sectionsDiscussed.length > 0 ? (
                              item.sectionsDiscussed.map((sec, sIdx) => (
                                <span
                                  key={sIdx}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${getSectionBadgeStyle(sec)}`}
                                >
                                  {sec}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                General Law
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 4: Actions */}
                        <td className="py-4 px-5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy button */}
                            <button
                              type="button"
                              onClick={() => handleCopy(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title={isCopied ? 'Copied!' : 'Copy Query & Statutory Advice'}
                            >
                              {isCopied ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeSavedResponse(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title={isHindi ? 'यह रिकॉर्ड हटाएं' : 'Delete this record'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Expand Chevron */}
                            <button
                              type="button"
                              onClick={() => toggleRow(item.id)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'Expand full statutory response'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Accordion Body */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="p-0 bg-slate-50/60 border-b border-slate-200/80">
                            <div className="p-5 sm:p-7 space-y-5 animate-in fade-in duration-200">
                              {/* 1. Full Query Card */}
                              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{isHindi ? 'पूछा गया वैधानिक प्रश्न:' : 'Applicant Statutory Inquiry:'}</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                                  {item.query}
                                </p>
                              </div>

                              {/* 2. Full Statutory Advice & Opinion */}
                              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                                      <Scale className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                      {isHindi ? 'वैधानिक राय एवं कानूनी विश्लेषण' : 'Statutory Legal Advice & Analysis'}
                                    </h4>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(item)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          <span className="text-emerald-700 font-bold">{isHindi ? 'कॉपी हो गया' : 'Copied'}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>{isHindi ? 'कॉपी करें' : 'Copy'}</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handlePrintSingleItem(item)}
                                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                      title={isHindi ? 'यह परामर्श प्रिंट करें' : 'Print this consultation'}
                                    >
                                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                                      <span>{isHindi ? 'प्रिंट' : 'Print'}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Markdown Legal Advice */}
                                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                                  <MarkdownContent content={item.response} />
                                </div>

                                {/* Citations Footer */}
                                {item.citations && item.citations.length > 0 && (
                                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      {t.authoritiesLabel}:
                                    </span>
                                    {item.citations.map((c, cIdx) => (
                                      <button
                                        key={cIdx}
                                        type="button"
                                        onClick={() => setSelectedCitation(c)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${getSectionBadgeStyle(c.section || '')}`}
                                      >
                                        <span>{c.section || 'Statute'}</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 sm:p-14 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <BookMarked className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {searchQuery || filterSection !== 'all'
                ? (isHindi ? 'कोई मेल नहीं मिला' : 'No Matching Saved Consultations')
                : (isHindi ? 'कोई सहेजा गया परामर्श रिकॉर्ड नहीं' : 'No Saved Consultations in Vault')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery || filterSection !== 'all'
                ? (isHindi ? 'फ़िल्टर या खोज शब्द बदलकर पुनः प्रयास करें।' : 'Try changing your search terms or section filter.')
                : (isHindi 
                    ? 'लीगल AI कोपायलट में चर्चा करते समय, किसी भी उत्तर के नीचे "Save this response" बटन पर क्लिक करें।' 
                    : 'While chatting with the Legal AI Copilot, click the "Save this response" bookmark button under any message to archive it here.')}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/?tab=copilot"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{isHindi ? 'लीगल AI कोपायलट खोलें' : 'Open Legal AI Copilot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
