'use client';

import React from 'react';
import { 
  Scale, 
  ExternalLink, 
  BookOpen, 
  CheckCircle2, 
  X,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { extractDiscussedSections } from '@/lib/statutoryCatalog';
import { StatutoryCitation } from '@/lib/types';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';

interface SessionContextSidebarProps {
  onClose?: () => void;
  onSelectQuery?: (query: string) => void;
}

export const SessionContextSidebar: React.FC<SessionContextSidebarProps> = ({ onClose, onSelectQuery }) => {
  const { 
    chatMessages, 
    setSelectedCitation,
    language
  } = useAppStore();

  const isHindi = language === 'hi';
  const discussedSections = React.useMemo(() => {
    return extractDiscussedSections(chatMessages);
  }, [chatMessages]);

  const handleInspectSection = (sec: {
    section: string;
    act: string;
    description: string;
    snippet?: string;
    url?: string;
  }) => {
    const citation: StatutoryCitation = {
      id: `cit_${sec.section.replace(/[^a-zA-Z0-9]/g, '_')}`,
      act: sec.act,
      section: sec.section,
      description: sec.description,
      snippet: sec.snippet,
      url: sec.url || 'https://ipindia.gov.in',
      jurisdiction: 'IN',
      source: 'chat_session',
    };
    setSelectedCitation(citation);
  };

  const getSectionColor = (secName: string) => {
    const s = secName.toLowerCase();
    let termId = 'section-3p';
    if (s.includes('3(e)') || s.includes('3e')) termId = 'section-3e';
    else if (s.includes('3(d)') || s.includes('3d')) termId = 'section-3d';
    else if (s.includes('6') || s.includes('7') || s.includes('bda')) termId = 'bda-2023';
    else if (s.includes('158')) termId = 'rule-158b';
    else if (s.includes('122')) termId = 'rule-122e';

    return {
      badge: 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 font-bold shadow-2xs',
      dot: 'bg-slate-400',
      termId
    };
  };

  return (
    <div className="w-full space-y-4">
      {/* Modern Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isHindi ? 'चर्चा की गई धाराएं' : 'Sections Discussed'}
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                {discussedSections.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isHindi 
                ? 'इस सत्र में विश्लेषित सभी कानूनी प्रावधान' 
                : 'Statutory provisions cited in this session'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When sections have been discussed */}
      {discussedSections.length > 0 ? (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">
              {isHindi 
                ? `${discussedSections.length} धाराएं कानूनी रूप से सक्रिय` 
                : `${discussedSections.length} statutory section${discussedSections.length > 1 ? 's' : ''} active`}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
              100% Deterministic
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {discussedSections.map((sec, idx) => {
              const color = getSectionColor(sec.section);
              return (
                <StatutoryTooltip key={idx} termId={color.termId}>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-violet-300 hover:shadow-sm transition-all text-left space-y-2 cursor-pointer group">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${color.dot} flex-shrink-0`} />
                        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-violet-700 transition-colors">
                          {sec.section}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${color.badge}`}>
                        {sec.act.includes('Patents') ? 'IPO 1970' : sec.act.includes('Biodiversity') ? 'BDA 2023' : 'D&C 1940'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                      {sec.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspectSection(sec);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{isHindi ? 'धारा देखें' : 'Inspect Clause'}</span>
                      </button>

                      {onSelectQuery && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectQuery(`Explain the statutory impact of ${sec.section} on my formulation`);
                          }}
                          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{isHindi ? 'पूछें' : 'Query'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </StatutoryTooltip>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-700">
            {isHindi ? 'कोई धारा अभी तक नहीं' : 'No Sections Discussed Yet'}
          </p>
          <p className="text-[11px] text-slate-500">
            {isHindi 
              ? 'जैसे ही आप एआई से सवाल पूछेंगे, संबंधित धाराएं यहाँ स्वचालित रूप से जुड़ जाएंगी।' 
              : 'As you consult the AI Copilot, relevant statutory sections will be catalogued here.'}
          </p>
        </div>
      )}
    </div>
  );
};
