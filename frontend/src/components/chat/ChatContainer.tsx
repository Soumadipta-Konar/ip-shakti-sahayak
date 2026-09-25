'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Scale, 
  ShieldAlert, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Volume2,
  VolumeX,
  Printer,
  RotateCcw,
  BookMarked,
  Bookmark,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ChatMessage, StatutoryCitation } from '@/lib/types';
import { askLegalQuestion } from '@/lib/apiClient';
import { JurisdictionToggle } from './JurisdictionToggle';
import { AudioRecorder } from '../voice/AudioRecorder';
import { MarkdownContent } from './MarkdownContent';

const WELCOME_TEXT = `### Welcome to IP-SAKTI Sahayak

I am your **Enterprise Statutory AI Legal Copilot**, specialized in **The Patents Act (1970)**, **The Biological Diversity (Amendment) Act (2023)**, **CSIR Traditional Knowledge Digital Library (TKDL)**, and international patent clearance frameworks (WIPO / PCT).

How may I evaluate your botanical formulation or statutory patent inquiry today?`;

const createWelcomeMessage = (): ChatMessage => ({
  id: 'welcome',
  sender: 'assistant',
  text: WELCOME_TEXT,
  timestamp: '10:00 AM',
  jurisdiction: 'IN',
  confidenceScore: 0.98,
  citations: [
    {
      id: 'welcome-cit-1',
      act: 'The Patents Act, 1970',
      section: 'Section 3(p)',
      description: 'Traditional Knowledge Non-Patentability Bar',
      jurisdiction: 'IN',
      url: 'https://www.ipindia.gov.in',
      source: 'canonical'
    },
    {
      id: 'welcome-cit-2',
      act: 'Biological Diversity Act, 2002 (as amended 2023)',
      section: 'Section 6',
      description: 'Prior NBA Approval for IPR on Indian Biological Resources',
      jurisdiction: 'IN',
      url: 'http://nbaindia.org/',
      source: 'canonical'
    },
    {
      id: 'welcome-cit-3',
      act: 'The Patents Act, 1970',
      section: 'Section 3(e)',
      description: 'Mere Admixture Synergistic Efficacy Threshold',
      jurisdiction: 'IN',
      url: 'https://www.ipindia.gov.in',
      source: 'canonical'
    }
  ]
});

export const ChatContainer: React.FC = () => {
  const { 
    chatMessages, 
    setChatMessages, 
    clearChatMessages, 
    savedCitations, 
    addSavedCitations, 
    removeSavedCitation, 
    isCitationSaved,
    jurisdiction, 
    setJurisdiction, 
    language, 
    setSelectedCitation,
    sessionId,
    classificationState,
    setIsEscalationOpen,
  } = useAppStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const isIntl = jurisdiction === 'INTL';

  useEffect(() => {
    setIsHydrated(true);
    // Initialize or replace legacy Hindi welcome message in storage
    if (
      chatMessages.length === 0 || 
      (chatMessages.length === 1 && chatMessages[0].id === 'welcome' && /[\u0900-\u0D7F]/.test(chatMessages[0].text))
    ) {
      const welcome = createWelcomeMessage();
      setChatMessages([welcome]);
      if (welcome.citations) {
        addSavedCitations(welcome.citations, 'canonical');
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    let cleanText = text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/§\s*/g, 'Section ')
      .replace(/[•\*\-]\s+/g, ', ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith('en');
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(msgId);
  };

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      jurisdiction,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const contextualizedQuery = classificationState?.category
        ? `[Statutory Context: Product classified as "${classificationState.category}", Statute: "${classificationState.statute}"] ${query}`
        : query;

      const response = await askLegalQuestion(contextualizedQuery, jurisdiction, 'en', sessionId, classificationState);
      setChatMessages((prev) => [...prev, response]);

      if (response.citations && response.citations.length > 0) {
        addSavedCitations(response.citations, 'chat_session');
      }
    } catch (err: any) {
      console.error('Backend connection error:', err);
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: `⚠️ **AI Copilot Connection Notice**\n\nUnable to reach the legal AI backend at \`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}\`.\n\n*Error details:* ${err?.message || 'Network request failed'}\n\nPlease ensure the backend server is running at port 8000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        jurisdiction,
        confidenceScore: 0,
        requiresEscalation: true,
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearChatMessages();
    const freshWelcome = createWelcomeMessage();
    setChatMessages([freshWelcome]);
    if (freshWelcome.citations) {
      addSavedCitations(freshWelcome.citations, 'canonical');
    }
    setIsConfirmingClear(false);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const displayMessages = (!isHydrated || chatMessages.length === 0) 
    ? [createWelcomeMessage()] 
    : chatMessages;

  const sampleQueries = isIntl
    ? [
        "How does US FDA Botanical Drug Guidance regulate Ayurvedic IND/NDA?",
        "What are WIPO GRATK Treaty 2024 mandatory patent disclosure rules?",
        "How does EMA THMPD 30-year traditional use rule apply to botanical exports?",
        "Can an Indian classical formula qualify for PCT international patent filing?",
      ]
    : classificationState?.category?.includes('Classical')
    ? [
        "Can I patent an altered delivery method for this classical formula?",
        "Does Section 3(p) permit extracting active fractions?",
        "What are my BDA 2023 ABS exemptions as an Indian manufacturer?",
        "How do I cite CSIR-TKDL textual prior art in patent applications?",
      ]
    : [
        "Can I patent a ginger and honey cough syrup under Section 3(p)?",
        "What are my ABS royalty requirements under BDA 2023 for Ashwagandha?",
        "How does Section 3(e) apply to synergistic herbal admixtures?",
        "What approvals are required from National Biodiversity Authority (Form III)?",
      ];

  const placeholderText = isIntl
    ? "Ask about WIPO GRATK, PCT, US FDA Botanical Drug guidance, or EMA THMPD..."
    : "Ask about patentability, Section 3 bars, TKDL, or ABS compliance in English...";

  return (
    <div className={`flex-1 flex flex-col bg-white border shadow-xs relative ${
      isIntl ? 'border-[#1d70b8]' : 'border-[#b1b4b6]'
    }`}>
      {/* 1. Active Formulation Dossier / Triage Recommendation Banner */}
      {classificationState ? (
        <div className="bg-[#f4fbf7] border-b-2 border-[#00703c] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#00703c] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#00703c] flex-shrink-0" />
            <span className="font-bold text-[#0b0c0c]">Active Case Formulation:</span>
            <span className="gds-tag gds-tag-green">
              {classificationState.category}
            </span>
            <span className="text-[#505a5f] hidden lg:inline text-xs">
              &bull; {classificationState.patentability?.slice(0, 60)}...
            </span>
          </div>
          <Link
            href="/wizard"
            className="text-xs font-bold text-[#1d70b8] hover:underline flex items-center gap-1"
          >
            <span>Modify Triage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="bg-[#fff7e6] border-b-2 border-[#ffdd00] px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#0b0c0c]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <span className="font-bold">Step 1 Recommended:</span>
            <span className="text-[#505a5f]">Classify your formulation first to help the AI apply tailored Section 3(p)/(e)/(d) and ABS rules.</span>
          </div>
          <Link
            href="/wizard"
            className="text-xs font-bold text-white bg-[#00703c] hover:bg-[#005a30] px-3 py-1 rounded-none inline-flex items-center gap-1 shadow-xs"
          >
            <span>Launch Triage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 2. Top Toolbar */}
      <div className="px-4 py-3 border-b border-[#b1b4b6] bg-[#f8f8f8] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00703c]" />
          <h2 className="text-sm font-bold text-[#0b0c0c]">
            Statutory AI Copilot (Patents Act 1970 &amp; BDA 2023)
          </h2>
          <span className="gds-tag gds-tag-blue hidden sm:inline">
            BAAI Vector Grounded
          </span>
        </div>

        <div className="flex items-center gap-2">
          <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1 text-xs font-bold text-[#0b0c0c] bg-white border border-[#b1b4b6] hover:bg-[#f3f2f1] flex items-center gap-1.5 transition-colors"
            title="Print Official Legal Advice Record"
          >
            <Printer className="w-3.5 h-3.5 text-[#505a5f]" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {isConfirmingClear ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2 py-1 bg-[#d4351c] text-white text-xs font-bold transition-colors"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="px-1.5 py-1 text-xs text-[#505a5f] hover:text-[#0b0c0c]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingClear(true)}
              className="p-1.5 text-[#505a5f] hover:text-[#0b0c0c] border border-transparent hover:border-[#b1b4b6] transition-colors"
              title="Reset Assessment Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 min-h-[420px] max-h-[580px] bg-[#ffffff]">
        {displayMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-start gap-3.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 bg-[#0b0c0c] text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-xs">
                <Scale className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-none p-4 sm:p-5 shadow-xs transition-all ${
                msg.sender === 'user'
                  ? 'bg-[#1d70b8] text-white font-medium border border-[#1d70b8]'
                  : 'bg-white text-[#0b0c0c] border-2 border-[#b1b4b6]'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-[#e5e5e5] text-xs">
                <div className="flex items-center gap-2 font-bold">
                  {msg.sender === 'assistant' ? (
                    <span className="text-[#0b0c0c]">
                      IP-SAKTI Statutory Copilot
                    </span>
                  ) : (
                    <span className="text-white">Applicant / Practitioner</span>
                  )}
                  {msg.jurisdiction && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold ${
                      msg.sender === 'user'
                        ? 'bg-blue-800 text-white'
                        : 'bg-[#f3f2f1] text-[#0b0c0c] border border-[#b1b4b6]'
                    }`}>
                      {msg.jurisdiction === 'INTL' ? 'International WIPO' : 'Indian Jurisdiction'}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] ${msg.sender === 'user' ? 'text-blue-100' : 'text-[#505a5f]'}`}>
                  {msg.timestamp || 'Just now'}
                </span>
              </div>

              {/* Message Body */}
              <div className="text-sm leading-relaxed">
                {msg.sender === 'assistant' ? (
                  <MarkdownContent content={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>

              {/* Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#e5e5e5]">
                  <div className="text-xs font-bold text-[#505a5f] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[#0b0c0c]">
                      <Scale className="w-3.5 h-3.5 text-[#1d70b8]" />
                      Statutory Authority Citations ({msg.citations.length})
                    </span>
                    <span className="text-[10px] text-[#505a5f]">
                      Click citation badge to view full statute
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((c, cIdx) => {
                      const isSaved = isCitationSaved(c.act || '', c.section || '');
                      return (
                        <div
                          key={c.id || cIdx}
                          className="inline-flex items-center gap-1 bg-[#f3f2f1] border border-[#b1b4b6] px-2.5 py-1 text-xs transition-colors hover:border-[#1d70b8] hover:bg-white"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCitation(c)}
                            className="font-bold text-[#1d70b8] hover:underline"
                          >
                            {c.section || 'Statute'} &bull; {c.act?.slice(0, 24)}...
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSaved) {
                                removeSavedCitation(c.id || `${c.act}-${c.section}`);
                              } else {
                                addSavedCitations([c], 'user_saved');
                              }
                            }}
                            className="p-0.5 text-[#505a5f] hover:text-[#0b0c0c]"
                            title={isSaved ? 'Remove citation' : 'Save citation for export'}
                          >
                            {isSaved ? (
                              <BookMarked className="w-3 h-3 text-[#00703c]" />
                            ) : (
                              <Bookmark className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Escalation Warning */}
              {msg.requiresEscalation && (
                <div className="mt-4 p-3 bg-[#fff7e6] border-l-4 border-[#ffdd00] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#0b0c0c] flex-shrink-0" />
                    <p className="text-xs font-semibold text-[#0b0c0c]">
                      High-complexity statutory inquiry detected. Certified Patent Attorney verification recommended.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEscalationOpen(true)}
                    className="px-3 py-1.5 bg-[#0b0c0c] hover:bg-[#333333] text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    Escalate to IP Attorney
                  </button>
                </div>
              )}

              {/* Audio Listen & Facilitator Footer */}
              {msg.sender === 'assistant' && (
                <div className="mt-3.5 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#505a5f] border-t border-[#e5e5e5] print:hidden">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeech(msg.id, msg.text)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition-all border ${
                        speakingMessageId === msg.id
                          ? 'bg-[#fff7e6] border-[#ffdd00] text-[#0b0c0c]'
                          : 'bg-white hover:bg-[#f3f2f1] border-[#b1b4b6] text-[#0b0c0c]'
                      }`}
                      title={speakingMessageId === msg.id ? 'Stop listening' : 'Listen to legal assessment in audio'}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-[#d4351c] animate-pulse" />
                          <span>Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-[#1d70b8]" />
                          <span>Listen Audio</span>
                        </>
                      )}
                    </button>

                    {msg.confidenceScore !== undefined && (
                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#505a5f]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00703c]" />
                        <span>Statutory Grounding:</span>
                        <span className="text-[#00703c]">
                          {(msg.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsEscalationOpen(true)}
                    className="text-[#1d70b8] hover:underline flex items-center gap-1 font-bold text-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#ffdd00]" />
                    <span>Facilitator Escalation</span>
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 bg-[#1d70b8] text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-[#505a5f] text-xs max-w-4xl mx-auto">
            <div className="w-8 h-8 bg-[#0b0c0c] flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-white border border-[#b1b4b6] shadow-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#1d70b8] animate-pulse" />
              <span>Searching Qdrant Cloud BAAI vectors &amp; synthesizing legal clearance response...</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Suggested Prompts (GDS Quick Inquiries) */}
      <div className={`px-4 py-2.5 border-t border-[#b1b4b6] flex items-center gap-2 overflow-x-auto print:hidden ${
        isIntl ? 'bg-[#f4f7fc]' : 'bg-[#f8f8f8]'
      }`}>
        <span className="text-xs text-[#0b0c0c] whitespace-nowrap font-bold flex items-center gap-1.5 mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#1d70b8]" />
          <span>Quick Inquiries:</span>
        </span>
        {sampleQueries.map((sample, sIdx) => (
          <button
            key={sIdx}
            onClick={() => handleSend(sample)}
            className="text-xs px-3.5 py-1.5 bg-white border border-[#b1b4b6] text-[#0b0c0c] whitespace-nowrap transition-all font-medium hover:border-[#1d70b8] hover:bg-[#f3f2f1] shadow-2xs"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* 5. Input Bar with AudioRecorder */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-[#b1b4b6] flex items-center gap-2.5 print:hidden">
        <AudioRecorder onTranscription={(transcription) => handleSend(transcription)} lang="en" />

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholderText}
            className="w-full bg-[#f8f8f8] hover:bg-white focus:bg-white border-2 border-[#0b0c0c] px-4 py-2.5 text-sm text-[#0b0c0c] placeholder:text-[#505a5f] focus:outline-none focus:ring-4 focus:ring-[#ffdd00] transition-all shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-5 py-2.5 bg-[#00703c] hover:bg-[#005a30] text-white font-bold transition-all flex-shrink-0 disabled:opacity-40 shadow-xs flex items-center justify-center gap-1.5"
          aria-label="Send Query"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
