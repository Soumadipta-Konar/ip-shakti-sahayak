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
  FileText
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SavedResponseItem, StatutoryCitation } from '@/lib/types';
import { MarkdownContent } from '@/components/chat/MarkdownContent';
import { getTranslations } from '@/lib/translations';

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
      setTimeout(() => setIsConfirmingClear(false), 4000);
      return;
    }
    clearSavedResponses();
    setIsConfirmingClear(false);
  };

  const handleExportJSON = () => {
    const exportPayload = {
      export_meta: {
        system: "IP-SAKTI Sahayak (SIH 045)",
        exported_at: new Date().toISOString(),
        total_saved_records: savedResponses.length,
        retention_guarantee: "Persistent Client Storage (No auto-wipe on refresh)",
        compliance: "Indian DPDP Act 2023 Compliant"
      },
      saved_citations_and_consultations: savedResponses,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-sakti-saved-citations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInspectSection = (sectionName: string, item: SavedResponseItem) => {
    // Check if this item has citation metadata
    const matchedCitation = item.citations?.find((c) => 
      c.section.toLowerCase().includes(sectionName.toLowerCase())
    );

    const citation: StatutoryCitation = matchedCitation || {
      id: `cit_${sectionName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      act: sectionName.toLowerCase().includes('rule') ? 'Drugs and Cosmetics Rules, 1945' : 'The Patents Act, 1970',
      section: sectionName,
      description: `Statutory bar and compliance rule for ${sectionName}.`,
      jurisdiction: 'IN',
      source: 'user_saved'
    };

    setSelectedCitation(citation);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* 1. Header & Controls */}
      <div className="bg-white border-2 border-[#b1b4b6] border-t-4 border-t-[#002147] p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#002147] text-white">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#eef4f9] text-[#002147] border border-[#1d70b8]/30">
                {isHindi ? 'सहेजे गए उद्धरण वॉल्ट' : 'Saved Citations Vault'}
              </span>
              <span className="text-[10px] font-bold text-[#00703c] bg-[#eef7ee] px-2 py-0.5 border border-[#00703c]/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#00703c]" />
                {isHindi ? 'रिफ्रेश के बाद भी सुरक्षित' : 'Preserved on Refresh'}
              </span>
              <span className="text-[10px] font-bold text-[#0b0c0c] bg-[#f3f2f1] px-2 py-0.5 border border-[#b1b4b6] font-mono">
                {savedResponses.length} {isHindi ? 'परामर्श सहेजे गए' : 'Saved Consultations'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#002147] mt-1 tracking-tight">
              {t.savedCitationsTitle}
            </h1>
            <p className="text-xs text-[#505a5f] mt-0.5 leading-normal">
              {t.savedCitationsSubtitle}
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 print:hidden flex-wrap">
          {savedResponses.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExpandAll}
                className="px-3 py-1.5 border border-[#b1b4b6] hover:bg-[#f3f2f1] text-xs font-bold text-[#0b0c0c] transition-colors bg-white"
                title={expandedIds.size === filteredResponses.length ? 'Collapse all answers' : 'Expand all answers'}
              >
                {expandedIds.size === filteredResponses.length 
                  ? (isHindi ? 'सभी संक्षिप्त करें' : 'Collapse All') 
                  : (isHindi ? 'सभी उत्तर देखें' : 'Expand All')}
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className={`px-3 py-1.5 border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isConfirmingClear
                    ? 'bg-[#d4351c] text-white border-[#d4351c] animate-pulse'
                    : 'border-[#b1b4b6] hover:bg-red-50 text-[#0b0c0c] hover:text-[#d4351c] bg-white'
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
            className="px-3 py-1.5 border border-[#b1b4b6] hover:bg-[#f3f2f1] text-xs font-bold text-[#0b0c0c] flex items-center gap-1.5 transition-colors bg-white disabled:opacity-40"
            title="Download full saved consultations repository as JSON"
          >
            <Download className="w-3.5 h-3.5 text-[#505a5f]" />
            <span>{isHindi ? 'JSON निर्यात' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={savedResponses.length === 0}
            className="px-3 py-1.5 border border-[#b1b4b6] hover:bg-[#f3f2f1] text-xs font-bold text-[#0b0c0c] flex items-center gap-1.5 transition-colors bg-white disabled:opacity-40"
            title="Print saved citations record"
          >
            <Printer className="w-3.5 h-3.5 text-[#505a5f]" />
            <span>{isHindi ? 'प्रिंट' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls (Visible when items exist) */}
      {savedResponses.length > 0 && (
        <div className="bg-[#f8f8f8] border border-[#b1b4b6] p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#505a5f] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi 
                ? 'प्रश्न, उत्तर या धारा द्वारा खोजें (उदा. Section 3(p), अश्वगंधा)...' 
                : 'Filter by question, response text, or section (e.g. Section 3(p), Ashwagandha)...'}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#b1b4b6] text-xs text-[#0b0c0c] focus:outline-none focus:border-[#1d70b8]"
            />
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#505a5f] flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#505a5f]" />
              <span>{isHindi ? 'धारा:' : 'Section:'}</span>
            </span>

            <button
              type="button"
              onClick={() => setFilterSection('all')}
              className={`px-2 py-1 text-[11px] font-bold transition-colors border ${
                filterSection === 'all'
                  ? 'bg-[#002147] text-white border-[#002147]'
                  : 'bg-white text-[#0b0c0c] border-[#b1b4b6] hover:bg-[#f3f2f1]'
              }`}
            >
              {isHindi ? 'सभी' : 'All'} ({savedResponses.length})
            </button>

            {allUniqueSections.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setFilterSection(sec)}
                className={`px-2 py-1 text-[11px] font-bold transition-colors border ${
                  filterSection === sec
                    ? 'bg-[#1d70b8] text-white border-[#1d70b8]'
                    : 'bg-white text-[#0b0c0c] border-[#b1b4b6] hover:bg-[#f3f2f1]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Tabular List of Saved Citations & Consultations */}
      {filteredResponses.length > 0 ? (
        <div className="bg-white border-2 border-[#b1b4b6] overflow-hidden shadow-2xs">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#002147] text-white border-b border-[#002147]">
                  <th className="py-3 px-4 font-bold tracking-wider w-[185px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1d70b8]" />
                      <span>{isHindi ? 'तारीख एवं समय' : 'Date & Time'}</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 font-bold tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#1d70b8]" />
                      <span>{isHindi ? 'उपयोगकर्ता का प्रश्न (Query)' : 'User Query'}</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 font-bold tracking-wider w-[220px]">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#1d70b8]" />
                      <span>{isHindi ? 'चर्चा की गई धाराएं' : 'Sections Discussed'}</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 font-bold tracking-wider text-right w-[150px]">
                    <span>{isHindi ? 'उत्तर एवं कार्रवाई' : 'Action'}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b1b4b6]">
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
                            ? 'bg-[#eef4f9] border-l-4 border-l-[#1d70b8]' 
                            : idx % 2 === 0 ? 'bg-white hover:bg-[#f8f8f8]' : 'bg-[#fafafa] hover:bg-[#f3f2f1]'
                        }`}
                      >
                        {/* Column 1: Date & Time */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#505a5f] whitespace-nowrap align-top">
                          <div className="font-bold text-[#0b0c0c]">
                            {item.timestamp.split(',')[0]}
                          </div>
                          <div className="text-[10px] text-[#505a5f]">
                            {item.timestamp.split(',')[1] || ''}
                          </div>
                        </td>

                        {/* Column 2: User Query */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-xs sm:text-[13px] text-[#002147] group-hover:text-[#1d70b8] transition-colors leading-snug">
                            {item.query}
                          </div>
                          {!isExpanded && (
                            <div className="text-[11px] text-[#505a5f] line-clamp-1 mt-1 font-serif italic">
                              {item.response.replace(/[#*`_]/g, '').slice(0, 140)}...
                            </div>
                          )}
                        </td>

                        {/* Column 3: Sections Discussed */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {item.sectionsDiscussed && item.sectionsDiscussed.length > 0 ? (
                              item.sectionsDiscussed.map((sec, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-[#1d70b8]/40 text-[#002147] font-mono shadow-2xs"
                                >
                                  {sec}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-[#505a5f] italic">
                                General Law
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Column 4: View Response Button & Actions */}
                        <td className="py-3.5 px-4 text-right align-top" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle / View Response Button */}
                            <button
                              type="button"
                              onClick={() => toggleRow(item.id)}
                              className={`px-2.5 py-1 text-xs font-bold border transition-colors inline-flex items-center gap-1 ${
                                isExpanded
                                  ? 'bg-[#002147] text-white border-[#002147]'
                                  : 'bg-white text-[#1d70b8] border-[#b1b4b6] hover:border-[#1d70b8] hover:bg-[#f3f2f1]'
                              }`}
                              title={isExpanded ? 'Hide saved response' : 'Show full saved response'}
                            >
                              <span>{isExpanded ? (isHindi ? 'छिपाएं' : 'Hide') : (isHindi ? 'उत्तर देखें' : 'View')}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>

                            {/* Copy Button */}
                            <button
                              type="button"
                              onClick={() => handleCopy(item)}
                              className="p-1.5 text-[#505a5f] hover:text-[#0b0c0c] border border-transparent hover:border-[#b1b4b6] transition-colors"
                              title="Copy query and response"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-[#00703c]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removeSavedResponse(item.id)}
                              className="p-1.5 text-[#505a5f] hover:text-[#d4351c] border border-transparent hover:border-[#b1b4b6] transition-colors"
                              title="Remove from saved citations"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded View: Full Response Display (When User Clicks Row) */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="p-0 bg-[#f8f8f8] border-b border-[#b1b4b6]">
                            <div className="p-5 sm:p-6 space-y-4 border-l-4 border-l-[#1d70b8] animate-in fade-in duration-150">
                              {/* Query Banner */}
                              <div className="p-3.5 bg-white border border-[#b1b4b6] space-y-1">
                                <div className="flex items-center justify-between text-[11px] text-[#505a5f] pb-1 border-b border-[#e5e5e5]">
                                  <span className="font-bold text-[#002147] uppercase tracking-wider flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-[#1d70b8]" />
                                    {isHindi ? 'पूछा गया प्रश्न (User Query)' : 'User Statutory Query'}
                                  </span>
                                  <span className="font-mono text-[10px] text-[#505a5f]">
                                    Recorded on {item.timestamp}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-[#0b0c0c] pt-1">
                                  {item.query}
                                </p>
                              </div>

                              {/* Official Copilot Response in Full Markdown */}
                              <div className="p-4 sm:p-5 bg-white border border-[#b1b4b6] space-y-3 shadow-2xs">
                                <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e5]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-[#002147] text-white flex items-center justify-center">
                                      <Scale className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-[#002147]">
                                      {isHindi ? 'आईपी-शक्ति सहायक का वैधानिक उत्तर' : 'IP-SAKTI Sahayak Statutory Advice & Opinion'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(item)}
                                      className="text-xs font-bold text-[#1d70b8] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      {isCopied ? (
                                        <>
                                          <Check className="w-3 h-3 text-[#00703c]" />
                                          <span className="text-[#00703c]">{isHindi ? 'कॉपी हो गया!' : 'Copied!'}</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3 text-[#1d70b8]" />
                                          <span>{isHindi ? 'उत्तर कॉपी करें' : 'Copy Response'}</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div className="prose prose-slate max-w-none text-sm text-[#0b0c0c] leading-relaxed">
                                  <MarkdownContent content={item.response} />
                                </div>

                                {/* Statutory Sections Discussed in this Response */}
                                {item.sectionsDiscussed && item.sectionsDiscussed.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-bold text-[#505a5f] uppercase tracking-wider">
                                      {isHindi ? 'संदर्भित धाराएं:' : 'Cited Statutory Provisions:'}
                                    </span>
                                    {item.sectionsDiscussed.map((sec, sIdx) => (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => handleInspectSection(sec, item)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef4f9] border border-[#1d70b8]/40 text-[#002147] text-xs font-bold hover:bg-[#1d70b8] hover:text-white transition-colors cursor-pointer"
                                        title={`Inspect official clause for ${sec}`}
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        <span>{sec}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions for this expanded card */}
                              <div className="flex items-center justify-between gap-3 text-xs pt-1">
                                <Link
                                  href="/?tab=copilot"
                                  className="text-xs font-bold text-[#1d70b8] hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{isHindi ? 'लीगल कोपायलट में नया प्रश्न पूछें' : 'Ask follow-up in Legal Copilot'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => removeSavedResponse(item.id)}
                                  className="text-xs font-bold text-[#505a5f] hover:text-[#d4351c] inline-flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{isHindi ? 'इस सहेजे गए परामर्श को हटाएं' : 'Delete this saved consultation'}</span>
                                </button>
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
        <div className="bg-white border-2 border-[#b1b4b6] p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-[#eef4f9] border border-[#1d70b8]/30 flex items-center justify-center text-[#002147]">
            <BookMarked className="w-7 h-7 text-[#1d70b8]" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-[#002147]">
              {searchQuery || filterSection !== 'all'
                ? (isHindi ? 'कोई मेल खाता परिणाम नहीं मिला' : 'No matching saved responses')
                : (isHindi ? 'कोई सहेजा गया उद्धरण या परामर्श नहीं है' : 'No Saved Citations or Consultations Yet')}
            </h3>

            <p className="text-xs text-[#505a5f] leading-relaxed">
              {searchQuery || filterSection !== 'all'
                ? (isHindi 
                    ? 'कृपया अपने खोज शब्दों या फ़िल्टर को साफ़ करके पुनः प्रयास करें।' 
                    : 'Try clearing your search query or section filter to view all saved items.')
                : (isHindi
                    ? 'कानूनी AI सहायक में किसी भी उत्तर के नीचे "यह उत्तर सहेजें" बटन पर क्लिक करें। आपका प्रश्न, उत्तर, दिनांक और चर्चा की गई कानूनी धाराएं यहाँ सुरक्षित रूप से सहेजी जाएंगी और पेज रिफ्रेश करने पर भी नहीं हटेंगी।'
                    : 'While chatting in the Legal AI Copilot, click the "Save this response" button beneath any assistant answer. The query, response, timestamp, and cited statutory sections will be preserved here and will NOT be deleted upon refresh.')}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {searchQuery || filterSection !== 'all' ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterSection('all'); }}
                className="px-4 py-2 bg-[#002147] text-white text-xs font-bold hover:bg-[#1d70b8] transition-colors"
              >
                {isHindi ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
              </button>
            ) : (
              <Link
                href="/?tab=copilot"
                className="px-5 py-2.5 bg-[#002147] text-white text-xs font-bold hover:bg-[#1d70b8] transition-colors inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isHindi ? 'लीगल AI कोपायलट खोलें' : 'Open Legal AI Copilot'}</span>
              </Link>
            )}
          </div>

          {/* Quick Informational Guide */}
          <div className="mt-8 pt-6 border-t border-[#b1b4b6] max-w-xl mx-auto text-left space-y-2">
            <span className="text-[11px] font-bold text-[#002147] uppercase tracking-wider">
              {isHindi ? 'यह सुविधा कैसे काम करती है:' : 'How Saved Citations & Responses Work:'}
            </span>
            <ul className="text-xs text-[#505a5f] space-y-1.5 list-disc pl-4">
              <li>
                <strong>{isHindi ? 'सहेजें बटन:' : 'Save Response Button:'}</strong>{' '}
                {isHindi 
                  ? 'कोपायलट में प्रत्येक उत्तर के नीचे "यह उत्तर सहेजें" बटन पर क्लिक करने पर पूरा प्रश्न और उत्तर सहेजा जाता है।' 
                  : 'Click "Save this response" in the chat to store both your question and the complete legal advice.'}
              </li>
              <li>
                <strong>{isHindi ? 'स्थायी स्टोरेज:' : 'Persistence on Refresh:'}</strong>{' '}
                {isHindi 
                  ? 'सभी रिकॉर्ड ब्राउज़र के सुरक्षित स्टोरेज में रहते हैं और पेज रिफ्रेश होने पर डिलीट नहीं होते।' 
                  : 'All saved entries are stored in localStorage and remain intact when you refresh or close the browser.'}
              </li>
              <li>
                <strong>{isHindi ? 'विस्तारित दृश्य:' : 'Expandable Rows:'}</strong>{' '}
                {isHindi 
                  ? 'तारीख और प्रश्न पर क्लिक करने पर पूरा मार्कडाउन उत्तर और प्रासंगिक धाराएं खुलती हैं।' 
                  : 'Click any row in the table above to expand and review the full statutory advice with citations.'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
