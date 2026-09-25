'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase,
  X
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ChatMessage, StatutoryCitation } from '@/lib/types';
import { askLegalQuestion } from '@/lib/apiClient';
import { JurisdictionToggle } from './JurisdictionToggle';
import { AudioRecorder } from '../voice/AudioRecorder';
import { MarkdownContent } from './MarkdownContent';
import { SessionContextSidebar } from './SessionContextSidebar';

const WELCOME_TEXT = `### Welcome to IP-SAKTI Sahayak

I am your **Statutory AI Legal Copilot**, grounded in **The Patents Act (1970)**, **The Biological Diversity (Amendment) Act (2023)**, and **CSIR Traditional Knowledge Digital Library (TKDL)**.

Ask any question regarding botanical patentability, Section 3(p) prior-art bars, synergistic admixtures, or BDA 2023 ABS royalties.`;

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
      act: 'Biological Diversity Act, 2023',
      section: 'Section 6',
      description: 'Prior NBA Approval for IPR on Biological Resources',
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
    addSavedCitations, 
    removeSavedCitation, 
    isCitationSaved,
    jurisdiction, 
    setJurisdiction, 
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isIntl = jurisdiction === 'INTL';

  useEffect(() => {
    setIsHydrated(true);
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

    const cleanText = text
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
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('en'));
    if (matchedVoice) utterance.voice = matchedVoice;

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
        text: `⚠️ **AI Copilot Connection Notice**\n\nUnable to reach the legal AI backend at \`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}\`.\n\nPlease verify that the backend is running.`,
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
        "Can an Indian classical formula qualify for PCT international patent filing?",
      ]
    : classificationState?.category?.includes('Classical')
    ? [
        "Can I patent an altered delivery method for this classical formula?",
        "Does Section 3(p) permit extracting active fractions?",
        "What are my BDA 2023 ABS exemptions as an Indian manufacturer?",
      ]
    : [
        "Can I patent a ginger and honey cough syrup under Section 3(p)?",
        "What are my ABS royalty requirements under BDA 2023 for Ashwagandha?",
        "How does Section 3(e) apply to synergistic herbal admixtures?",
      ];

  const placeholderText = isIntl
    ? "Ask about WIPO GRATK, PCT, US FDA Botanical Drug guidance, or EMA THMPD..."
    : "Ask about patentability, Section 3 bars, TKDL, or ABS compliance in English...";

  const completedSteps = [
    classificationState ? 1 : 0,
    0, // Prior art placeholder
    0, // ABS placeholder
    0, // Dossier placeholder
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full flex flex-col bg-white border border-[#b1b4b6] shadow-xs">
      {/* 1. Sleek, Compact Header Toolbar */}
      <div className="px-4 py-2.5 border-b border-[#b1b4b6] bg-[#f8f8f8] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Clean Title & Vector Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#00703c] animate-pulse" />
          <h2 className="text-sm font-bold text-[#0b0c0c]">
            Statutory AI Copilot
          </h2>
          <span className="text-[11px] text-[#505a5f] hidden sm:inline">
            &bull; Grounded in 8,936 Legal Chunks
          </span>
        </div>

        {/* Center/Right: Compact Jurisdiction Switch & Controls */}
        <div className="flex items-center gap-2.5">
          <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />

          {/* Case Dossier Slide-over Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isSidebarOpen || classificationState
                ? 'bg-[#0b0c0c] text-white border-[#0b0c0c]'
                : 'bg-white text-[#0b0c0c] border-[#b1b4b6] hover:bg-[#f3f2f1]'
            }`}
            title="Toggle Active Case Dossier Summary"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Case Dossier</span>
            <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
              classificationState ? 'bg-[#00703c] text-white' : 'bg-[#e5e5e5] text-[#0b0c0c]'
            }`}>
              {classificationState ? 'Triaged' : `${completedSteps}/4`}
            </span>
          </button>

          {/* Print Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 text-[#505a5f] hover:text-[#0b0c0c] border border-transparent hover:border-[#b1b4b6] transition-colors"
            title="Print Official Legal Advice Record"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Reset Action */}
          {isConfirmingClear ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2 py-0.5 bg-[#d4351c] text-white text-[11px] font-bold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="text-[11px] text-[#505a5f] hover:text-[#0b0c0c]"
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

      {/* 2. Chat Layout with Optional Slide-Over Drawer for Case Context */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Main Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[460px] max-h-[620px] bg-[#ffffff]">
          {displayMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 bg-[#0b0c0c] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <Scale className="w-3.5 h-3.5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] p-3.5 sm:p-4 text-sm leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-[#1d70b8] text-white font-medium'
                    : 'bg-[#f8f8f8] text-[#0b0c0c] border border-[#e5e5e5]'
                }`}
              >
                {/* Subtle Message Meta */}
                <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-[#e5e5e5]/80 text-[11px]">
                  <span className={`font-bold ${msg.sender === 'user' ? 'text-white' : 'text-[#0b0c0c]'}`}>
                    {msg.sender === 'assistant' ? 'IP-SAKTI Copilot' : 'Applicant'}
                  </span>
                  <span className={msg.sender === 'user' ? 'text-blue-100' : 'text-[#505a5f]'}>
                    {msg.timestamp || 'Just now'}
                  </span>
                </div>

                {/* Content */}
                {msg.sender === 'assistant' ? (
                  <MarkdownContent content={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}

                {/* Compact Inline Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#e5e5e5] flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-[#505a5f] uppercase tracking-wider mr-1">
                      Authorities:
                    </span>
                    {msg.citations.map((c, cIdx) => {
                      const isSaved = isCitationSaved(c.act || '', c.section || '');
                      return (
                        <button
                          key={c.id || cIdx}
                          type="button"
                          onClick={() => setSelectedCitation(c)}
                          className="inline-flex items-center gap-1 bg-white border border-[#b1b4b6] px-2 py-0.5 text-[11px] font-bold text-[#1d70b8] hover:border-[#1d70b8] hover:bg-[#f3f2f1] transition-colors"
                        >
                          <span>{c.section || 'Statute'}</span>
                          {isSaved && <BookMarked className="w-2.5 h-2.5 text-[#00703c]" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Minimal Footer for Assistant */}
                {msg.sender === 'assistant' && (
                  <div className="mt-2.5 pt-2 flex items-center justify-between text-xs text-[#505a5f] border-t border-[#e5e5e5] print:hidden">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSpeech(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                          speakingMessageId === msg.id ? 'text-[#d4351c]' : 'text-[#1d70b8] hover:underline'
                        }`}
                      >
                        {speakingMessageId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-[#d4351c] animate-pulse" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-[#1d70b8]" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      {msg.confidenceScore !== undefined && (
                        <span className="hidden sm:inline text-[11px] text-[#505a5f]">
                          Grounding: <strong className="text-[#00703c]">{(msg.confidenceScore * 100).toFixed(0)}%</strong>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setIsEscalationOpen(true)}
                      className="text-[11px] font-bold text-[#505a5f] hover:text-[#0b0c0c] hover:underline flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3 h-3 text-[#ffdd00]" />
                      <span>Escalate</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 bg-[#1d70b8] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-[#505a5f] text-xs">
              <div className="w-7 h-7 bg-[#0b0c0c] flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#b1b4b6] text-xs font-medium">
                <Sparkles className="w-3 h-3 text-[#1d70b8] animate-pulse" />
                <span>Searching statutory vectors &amp; synthesizing legal advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Slide-Over / Docked Case Dossier Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-80 sm:w-96 border-l border-[#b1b4b6] bg-white z-10 flex flex-col shadow-lg overflow-y-auto"
            >
              <div className="p-3 bg-[#f8f8f8] border-b border-[#b1b4b6] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0b0c0c] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#1d70b8]" />
                  Active Case Dossier
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-[#505a5f] hover:text-[#0b0c0c] text-xs font-bold"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <SessionContextSidebar onClose={() => setIsSidebarOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Sleek Quick Inquiries Chips */}
      <div className="px-4 py-2 border-t border-[#b1b4b6] bg-[#f8f8f8] flex items-center gap-2 overflow-x-auto print:hidden">
        <span className="text-[11px] text-[#505a5f] whitespace-nowrap font-bold flex items-center gap-1 mr-1">
          <HelpCircle className="w-3 h-3 text-[#1d70b8]" />
          <span>Quick Inquiries:</span>
        </span>
        {sampleQueries.map((sample, sIdx) => (
          <button
            key={sIdx}
            onClick={() => handleSend(sample)}
            className="text-[11px] px-2.5 py-1 bg-white border border-[#b1b4b6] text-[#0b0c0c] whitespace-nowrap font-medium hover:border-[#1d70b8] hover:bg-[#f3f2f1] transition-colors"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* 5. Minimalist Input Bar */}
      <div className="p-3 sm:p-3.5 bg-white border-t border-[#b1b4b6] flex items-center gap-2 print:hidden">
        <AudioRecorder onTranscription={(transcription) => handleSend(transcription)} lang="en" />

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholderText}
            className="w-full bg-[#f8f8f8] hover:bg-white focus:bg-white border border-[#b1b4b6] focus:border-[#0b0c0c] px-3.5 py-2 text-sm text-[#0b0c0c] placeholder:text-[#505a5f] focus:outline-none focus:ring-2 focus:ring-[#1d70b8] transition-all"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2 bg-[#00703c] hover:bg-[#005a30] text-white text-xs font-bold transition-all flex-shrink-0 disabled:opacity-40 shadow-xs flex items-center justify-center gap-1.5"
          aria-label="Send Query"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
