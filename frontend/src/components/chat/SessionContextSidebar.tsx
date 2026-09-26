'use client';

import React from 'react';
import { 
  Scale, 
  ExternalLink, 
  BookOpen, 
  CheckCircle2, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { extractDiscussedSections } from '@/lib/statutoryCatalog';
import { StatutoryCitation } from '@/lib/types';

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

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="border-b-2 border-[#0b0c0c] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#002147] text-white">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0b0c0c]">
                  {isHindi ? 'चर्चा की गई धाराएं' : 'Sections Discussed'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.2 bg-[#1d70b8] text-white rounded-full">
                  {discussedSections.length}
                </span>
              </div>
              <p className="text-[11px] text-[#505a5f]">
                {isHindi 
                  ? 'चैट में संदर्भित सभी वैधानिक प्रावधानों की सूची' 
                  : 'Statutory provisions cited during this consultation'}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#505a5f] hover:text-[#0b0c0c] text-xs font-bold border border-transparent hover:border-[#b1b4b6]"
              title={isHindi ? 'बंद करें' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* When sections have been discussed */}
      {discussedSections.length > 0 ? (
        <div className="space-y-3">
          <div className="p-2.5 bg-[#f3f2f1] border-l-4 border-[#1d70b8] text-[11px] text-[#0b0c0c] font-medium flex items-center justify-between">
            <span>
              {isHindi 
                ? `${discussedSections.length} कानूनी धाराएं चर्चा में शामिल` 
                : `${discussedSections.length} statutory section${discussedSections.length > 1 ? 's' : ''} catalogued`}
            </span>
            <span className="text-[10px] text-[#505a5f] font-mono">
              Live Session
            </span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {discussedSections.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-3 bg-white border border-[#b1b4b6] hover:border-[#1d70b8] transition-colors shadow-2xs space-y-2 group"
              >
                {/* Section title & count */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#002147] bg-[#eef4f9] px-2 py-0.5 border border-[#1d70b8]/30">
                    {item.section}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#f3f2f1] text-[#505a5f] border border-[#e5e5e5]">
                    {isHindi ? `${item.count} बार उद्धृत` : `Cited ${item.count}x`}
                  </span>
                </div>

                {/* Act Name */}
                <p className="text-[11px] font-bold text-[#1d70b8]">
                  {item.act}
                </p>

                {/* Description */}
                <p className="text-xs text-[#0b0c0c] leading-relaxed">
                  {item.description}
                </p>

                {/* Snippet quote if present */}
                {item.snippet && (
                  <blockquote className="text-[11px] italic text-[#505a5f] bg-[#f8f8f8] p-2 border-l-2 border-[#b1b4b6] leading-normal font-serif">
                    &ldquo;{item.snippet}&rdquo;
                  </blockquote>
                )}

                {/* Inspect Action */}
                <div className="pt-1 border-t border-[#e5e5e5] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleInspectSection(item)}
                    className="text-[11px] font-bold text-[#1d70b8] hover:text-[#002147] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{isHindi ? 'वैधानिक खंड देखें' : 'Inspect Statutory Clause'}</span>
                  </button>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#505a5f] hover:text-[#0b0c0c] inline-flex items-center gap-0.5"
                    >
                      <span>Gov Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-4 bg-[#f8f8f8] border border-[#b1b4b6] text-center space-y-3">
          <div className="w-10 h-10 mx-auto bg-white border border-[#b1b4b6] flex items-center justify-center text-[#505a5f]">
            <BookOpen className="w-5 h-5 text-[#1d70b8]" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#0b0c0c]">
              {isHindi ? 'कोई धारा अभी तक चर्चा में नहीं आई है' : 'No Sections Discussed Yet'}
            </h4>
            <p className="text-[11px] text-[#505a5f] mt-1 leading-relaxed">
              {isHindi
                ? 'जैसे ही आप पेटेंट या जैव-संसाधन अनुपालन पर प्रश्न पूछेंगे, संदर्भित सभी वैधानिक धाराएं यहाँ वास्तविक समय में सूचीबद्ध होंगी।'
                : 'As the AI Copilot references statutory bars and compliance rules during your consultation, they will automatically be catalogued here in real time.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#e5e5e5] text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#505a5f]">
              {isHindi ? 'प्रमुख वैधानिक प्रावधान:' : 'Core Statutory Provisions Tracked:'}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {[
                { tag: 'Section 3(p)', desc: 'TKDL Bar' },
                { tag: 'Section 3(e)', desc: 'Synergism' },
                { tag: 'Section 3(d)', desc: 'Efficacy' },
                { tag: 'Section 6', desc: 'NBA Clearance' },
                { tag: 'Rule 158-B', desc: 'Ayurveda License' },
                { tag: 'Rule 122-E', desc: 'Phytopharma' },
              ].map((p) => (
                <span
                  key={p.tag}
                  className="text-[10px] bg-white border border-[#b1b4b6] px-1.5 py-0.5 font-mono text-[#0b0c0c]"
                  title={p.desc}
                >
                  {p.tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
