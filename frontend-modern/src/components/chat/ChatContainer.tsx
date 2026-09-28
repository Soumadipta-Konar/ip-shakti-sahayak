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
  BookmarkCheck, 
  ShieldCheck, 
  Briefcase, 
  X, 
  Globe, 
  Languages,
  Clock,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ChatMessage, StatutoryCitation } from '@/lib/types';
import { askLegalQuestion, translateLegalText } from '@/lib/apiClient';
import { createWelcomeMessage } from '@/lib/welcome';
import { getTranslations } from '@/lib/translations';
import { extractDiscussedSections, extractSectionsFromText } from '@/lib/statutoryCatalog';
import { JurisdictionToggle } from './JurisdictionToggle';
import { AudioRecorder } from '../voice/AudioRecorder';
import { MarkdownContent } from './MarkdownContent';
import { SessionContextSidebar } from './SessionContextSidebar';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';
import { printLegalDocument } from '@/lib/printUtils';

export const ChatContainer: React.FC = () => {
  const { 
    chatMessages, 
    setChatMessages, 
    clearChatMessages, 
    addSavedCitations, 
    removeSavedCitation, 
    isCitationSaved,
    savedResponses,
    saveResponse,
    removeSavedResponse,
    isResponseSaved,
    jurisdiction, 
    setJurisdiction, 
    setSelectedCitation,
    sessionId,
    classificationState,
    setIsEscalationOpen,
    language,
    toggleLanguage,
    pendingQuery,
    setPendingQuery
  } = useAppStore();

  const t = getTranslations(language);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [translatingMsgId, setTranslatingMsgId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real-time catalog of statutory sections discussed in chat
  const discussedSections = React.useMemo(() => {
    return extractDiscussedSections(chatMessages);
  }, [chatMessages]);

  // Find preceding user query for any assistant message
  const getPrecedingQuery = (messageIndex: number): string => {
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (chatMessages[i] && chatMessages[i].sender === 'user') {
        return chatMessages[i].text;
      }
    }
    return inputQuery.trim() || 'General Statutory Assessment';
  };

  // Toggle saving this response + paired user query to Saved Citations
  const handleToggleSaveResponse = (msg: ChatMessage, msgIndex: number) => {
    const isSaved = isResponseSaved(msg.text);
    if (isSaved) {
      const existing = savedResponses.find(
        (sr) => sr.response.trim() === msg.text.trim() || sr.id === msg.id
      );
      if (existing) {
        removeSavedResponse(existing.id);
      }
    } else {
      const userQuery = getPrecedingQuery(msgIndex);
      const sections = extractSectionsFromText(msg.text, msg.citations);
      saveResponse({
        query: userQuery,
        response: msg.text,
        sectionsDiscussed: sections,
        citations: msg.citations,
        jurisdiction: msg.jurisdiction,
        detectedLanguage: msg.detectedLanguage,
      });
    }
  };

  const isIntl = jurisdiction === 'INTL';

  useEffect(() => {
    setIsHydrated(true);
    if (chatMessages.length === 0) {
      const welcome = createWelcomeMessage(language);
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
      .replace(/[#*`_\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/Section \d+(\([a-z]\))?/gi, (match) => match);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleMessageTranslation = async (msg: ChatMessage) => {
    if (msg.translatedText) {
      const updated = chatMessages.map((m) =>
        m.id === msg.id ? { ...m, isShowingTranslation: !m.isShowingTranslation } : m
      );
      setChatMessages(updated);
      return;
    }

    setTranslatingMsgId(msg.id);
    try {
      const isHindi = msg.detectedLanguage === 'hi' || /[\u0900-\u097F]/.test(msg.text);
      const targetLang: 'en' | 'hi' = isHindi ? 'en' : 'hi';
      const translatedStr = await translateLegalText(msg.text, targetLang);

      const updated = chatMessages.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              translatedText: translatedStr,
              isShowingTranslation: true,
            }
          : m
      );
      setChatMessages(updated);
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingMsgId(null);
    }
  };

  const handleSend = async (manualQuery?: string) => {
    const textToSend = manualQuery || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    if (speakingMessageId && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      jurisdiction: jurisdiction,
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const assistantMsg = await askLegalQuestion(
        textToSend,
        jurisdiction,
        language === 'hi' ? 'hi' : 'en',
        sessionId || 'default_session',
        classificationState
      );

      setChatMessages([...newMessages, assistantMsg]);

      if (assistantMsg.citations && assistantMsg.citations.length > 0) {
        addSavedCitations(assistantMsg.citations, 'chat_session');
      }
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `**Statutory Connectivity Notice**: Unable to reach backend RAG engine. Grounding response on local statutory knowledge:\n\n*Traditional Ayurvedic knowledge formulations are governed by **The Patents Act, 1970 § 3(p)**, which states that inventions based on publicly documented traditional knowledge cannot be granted patents. Additionally, **BDA 2023 § 6** requires prior approval from the National Biodiversity Authority before filing patent applications based on Indian biological resources.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        jurisdiction: jurisdiction,
      };
      setChatMessages([...newMessages, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pendingQuery && pendingQuery.trim()) {
      const q = pendingQuery.trim();
      setPendingQuery('');
      handleSend(q);
    }
  }, [pendingQuery]);

  const handleClearHistory = () => {
    if (speakingMessageId && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    const welcome = createWelcomeMessage(language);
    setChatMessages([welcome]);
    setIsConfirmingClear(false);
  };

  const handlePrint = () => {
    const sections: Array<{
      heading?: string;
      subheading?: string;
      timestamp?: string;
      bodyMarkdown: string;
      citations?: Array<{ section?: string; act?: string; snippet?: string }>;
      score?: number;
    }> = [];

    for (let i = 0; i < chatMessages.length; i++) {
      const msg = chatMessages[i];
      if (msg.sender === 'assistant') {
        const prevMsg = chatMessages[i - 1];
        const userQuery = prevMsg && prevMsg.sender === 'user' ? prevMsg.text : 'Statutory Legal Assessment';
        const textToPrint = (msg.isShowingTranslation && msg.translatedText) ? msg.translatedText : msg.text;

        sections.push({
          heading: `Inquiry: ${userQuery}`,
          subheading: `Assessed by IP-SAKTI Legal AI Copilot`,
          timestamp: msg.timestamp,
          bodyMarkdown: textToPrint,
          citations: msg.citations,
          score: msg.confidenceScore,
        });
      }
    }

    if (sections.length === 0) {
      sections.push({
        heading: 'Consultation Record',
        bodyMarkdown: chatMessages.map(m => `**${m.sender === 'user' ? 'Applicant Query' : 'Statutory AI Response'}:**\n\n${m.text}`).join('\n\n---\n\n'),
      });
    }

    printLegalDocument({
      title: 'Statutory AI Copilot Consultation Dossier',
      subtitle: 'Complete Legal Grounding & Assessment Audit Record',
      jurisdiction: jurisdiction,
      language: language === 'hi' ? 'hi' : 'en',
      sections,
    });
  };

  const handlePrintSingleResponse = (msg: ChatMessage, msgIdx: number) => {
    const prevMsg = chatMessages[msgIdx - 1];
    const userQuery = prevMsg && prevMsg.sender === 'user' ? prevMsg.text : 'Statutory Legal Assessment';
    const textToPrint = (msg.isShowingTranslation && msg.translatedText) ? msg.translatedText : msg.text;

    printLegalDocument({
      title: 'Statutory Legal Assessment Report',
      subtitle: 'Official AI Copilot Analysis Memo',
      jurisdiction: jurisdiction,
      language: language === 'hi' ? 'hi' : 'en',
      sections: [
        {
          heading: `Applicant Query: ${userQuery}`,
          subheading: `Legal Copilot Analysis`,
          timestamp: msg.timestamp,
          bodyMarkdown: textToPrint,
          citations: msg.citations,
          score: msg.confidenceScore,
        }
      ]
    });
  };

  const getAuthorityBadgeColor = (sec: string) => {
    return 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs';
  };

  const sampleQueries = isIntl
    ? [
        language === 'hi'
          ? "क्या अमेरिकी एफडीए वानस्पतिक दवाओं को पेटेंट देता है?"
          : "How does US FDA Botanical Drug Guidance handle classical extracts?",
        language === 'hi'
          ? "क्या धारा 3(p) सक्रिय अंश निकालने की अनुमति देती है?"
          : "Does Section 3(p) permit extracting active fractions?",
        language === 'hi'
          ? "एक भारतीय निर्माता के रूप में मेरी BDA 2023 ABS छूट क्या हैं?"
          : "What are my BDA 2023 ABS exemptions as an Indian manufacturer?",
      ]
    : t.sampleQueries;

  const placeholderText = isIntl
    ? "Ask about WIPO GRATK, PCT, US FDA Botanical Drug guidance, or EMA THMPD..."
    : t.inputPlaceholder;

  return (
    <div className="relative w-full flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md overflow-hidden min-h-[calc(100dvh-175px)] sm:min-h-[700px]">
      {/* 1. Modern Enterprise Frosted Header Toolbar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200/80 bg-slate-50/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand Identity & Vector Grounding Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 font-display">
                {t.copilotTitle}
              </h2>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
              Statutorily Grounded Citations &bull; CSIR-TKDL & Indian Patent Practice
            </p>
          </div>
        </div>

        {/* Right: Modern Segmented Switchers & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />

          {/* UI Language Switcher Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs cursor-pointer flex-shrink-0"
            title={language === 'hi' ? 'Switch interface to English' : 'सम्पूर्ण इंटरफ़ेस को हिन्दी में बदलें'}
          >
            <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-600" />
            <span>{t.languageButtonLabel}</span>
          </button>

          {/* Sections Discussed Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all shadow-2xs cursor-pointer border flex-shrink-0 ${
              isSidebarOpen
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
            }`}
            title={t.sectionsDiscussedTitle}
          >
            <Layers className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{t.sectionsDiscussed}</span>
            <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              discussedSections.length > 0 
                ? isSidebarOpen ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {discussedSections.length}
            </span>
          </button>

          {/* Print Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={t.printRecord}
          >
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Reset Action */}
          {isConfirmingClear ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-[11px] font-bold cursor-pointer"
              >
                {language === 'hi' ? 'रीसेट' : 'Reset'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="text-[10px] sm:text-[11px] text-slate-500 hover:text-slate-800 px-1 cursor-pointer"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingClear(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t.resetSession}
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Chat Layout with Conversation Stream & Slide-Over Drawer */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Ashoka Stambh Sovereign Watermark Background (nearly half screen, very low opacity, non-distracting) */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-hidden z-0"
        >
          <img
            src="/images/ashoka_emblem.svg"
            alt=""
            className="w-[48vw] max-w-[440px] max-h-[440px] object-contain opacity-[0.035] grayscale contrast-75"
          />
        </div>

        {/* Main Conversation Stream */}
        <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 min-h-[420px] sm:min-h-[460px] max-h-[72dvh] sm:max-h-[640px] bg-slate-50/20 touch-scroll">
          {chatMessages.map((msg, msgIdx) => {
            const isShowingTranslation = !!msg.isShowingTranslation;
            const displayedText = (isShowingTranslation && msg.translatedText) ? msg.translatedText : msg.text;
            const isHindiMessage = msg.detectedLanguage === 'hi' || /[\u0900-\u097F]/.test(msg.text);
            const isSaved = isResponseSaved(msg.text);

            const nextMsg = chatMessages[msgIdx + 1];
            const isMathOrNonDomain = 
              /(\b(2\s*[\+\-\*\/]\s*2|\d+\s*[\+\-\*\/\^=]\s*\d*|math|solve|calculate|addition|subtraction|multiplication|division|code|python|java|javascript|c\+\+|react|html|css)\b)|(^\s*[\d\s\+\-\*\/\=\.\(\)]+\s*$)/i.test(msg.text);

            const isNextMsgRefusal = 
              nextMsg && nextMsg.sender === 'assistant' && (
                nextMsg.text.includes('[!NOTE]') || 
                nextMsg.text.toLowerCase().includes('strictly limited to ayurveda') ||
                nextMsg.text.toLowerCase().includes('not solve general') ||
                nextMsg.text.toLowerCase().includes('connectivity notice') ||
                nextMsg.text.toLowerCase().includes('error')
              );

            const isOutDomainError = isMathOrNonDomain || Boolean(isNextMsgRefusal);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex items-start gap-2.5 sm:gap-3.5 ${
                  msg.sender === 'user' ? 'justify-end max-w-4xl ml-auto' : 'justify-start max-w-4xl'
                }`}
              >
                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`transition-all ${
                    msg.sender === 'user'
                      ? isOutDomainError
                        ? 'max-w-[90%] sm:max-w-[78%] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl rounded-tr-xs bg-red-50/50 text-red-950 border border-red-200/80 shadow-2xs'
                        : 'max-w-[90%] sm:max-w-[78%] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl rounded-tr-xs bg-purple-50/60 text-purple-950 border border-purple-200/80 shadow-2xs'
                      : 'flex-1 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl rounded-tl-xs bg-white border border-slate-200/90 shadow-sm text-slate-800 space-y-3 sm:space-y-3.5 max-w-full overflow-hidden'
                  }`}
                >
                  {/* Subtle Message Meta */}
                  <div className={`flex items-center justify-between gap-2 pb-2 border-b text-[11px] ${
                    msg.sender === 'user' 
                      ? isOutDomainError ? 'border-red-200/60 text-red-700' : 'border-purple-200/60 text-purple-700' 
                      : 'border-slate-100 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        msg.sender === 'user' 
                          ? isOutDomainError ? 'text-red-900 font-bold' : 'text-purple-900 font-bold' 
                          : 'text-slate-900'
                      }`}>
                        {msg.sender === 'assistant' ? t.assistantLabel : t.applicantLabel}
                      </span>
                      {isShowingTranslation && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-md">
                          {t.translatedBadge}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px]">
                      {msg.timestamp || 'Just now'}
                    </span>
                  </div>

                  {/* Content (Markdown or User text) */}
                  {msg.sender === 'assistant' ? (
                    <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed">
                      <MarkdownContent content={displayedText} />
                    </div>
                  ) : (
                    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${
                      isOutDomainError ? 'text-red-950 font-medium' : 'text-purple-950 font-medium'
                    }`}>
                      {msg.text}
                    </p>
                  )}

                  {/* Statutory Authorities Row */}
                  {msg.sender === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t.authoritiesLabel}:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {msg.citations.map((c, cIdx) => {
                          const isCitSaved = isCitationSaved(c.act || '', c.section || '');
                          const badgeColor = getAuthorityBadgeColor(c.section || '');
                          return (
                            <button
                              key={c.id || cIdx}
                              type="button"
                              onClick={() => setSelectedCitation(c)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${badgeColor}`}
                            >
                              <span>{c.section || 'Statute'}</span>
                              {isCitSaved && <BookMarked className="w-3 h-3 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assistant Footer Toolbar: Listen, Translate, Save this Response, Grounding, Escalate */}
                  {msg.sender === 'assistant' && (
                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-xs text-slate-500 print:hidden">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {/* Listen Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSpeech(msg.id, displayedText)}
                          className={`inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            speakingMessageId === msg.id 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                          }`}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-600 animate-pulse" />
                              <span>{t.stopAction}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500" />
                              <span>{t.listenAction}</span>
                            </>
                          )}
                        </button>

                        {/* Translation Button */}
                        <button
                          type="button"
                          disabled={translatingMsgId === msg.id}
                          onClick={() => handleToggleMessageTranslation(msg)}
                          className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-indigo-700 border border-slate-200/80 hover:border-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                          title={isShowingTranslation ? t.showOriginal : (isHindiMessage ? t.translateToEnglish : t.translateToHindi)}
                        >
                          <Languages className={`w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-600 ${translatingMsgId === msg.id ? 'animate-spin' : ''}`} />
                          <span>
                            {translatingMsgId === msg.id
                              ? t.translatingMessage
                              : isShowingTranslation
                                ? t.showOriginal
                                : isHindiMessage
                                  ? t.translateToEnglish
                                  : t.translateToHindi}
                          </span>
                        </button>

                        {/* Save this response Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSaveResponse(msg, msgIdx)}
                          className={`inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-slate-300'
                          }`}
                          title={isSaved ? 'Saved to Vault (Click to remove)' : 'Save this response and user query to Saved Citations Vault'}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600" />
                              <span>{t.savedResponse}</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500" />
                              <span>{t.saveThisResponse}</span>
                            </>
                          )}
                        </button>

                        {/* Print this response Button */}
                        <button
                          type="button"
                          onClick={() => handlePrintSingleResponse(msg, msgIdx)}
                          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                          title={language === 'hi' ? 'यह कानूनी उत्तर प्रिंट करें' : 'Print this statutory response'}
                        >
                          <Printer className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500" />
                          <span>{language === 'hi' ? 'प्रिंट' : 'Print'}</span>
                        </button>

                        {/* Grounding percentage */}
                        {msg.confidenceScore !== undefined && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 font-mono shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{t.groundingLabel}</span>
                            <strong className="text-slate-700 font-bold">{(msg.confidenceScore * 100).toFixed(0)}%</strong>
                          </span>
                        )}
                      </div>

                      {/* Escalate Button */}
                      <button
                        type="button"
                        onClick={() => setIsEscalationOpen(true)}
                        className="text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ShieldAlert className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-500" />
                        <span>{t.escalateAction}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs mt-1 ${
                    isOutDomainError
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-purple-50 border border-purple-200 text-purple-800'
                  }`}>
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Loading Animation */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-500 text-xs">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-xs font-medium text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
                <span>{t.searchingAdvice}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Slide-Over / Docked Sections Discussed Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full sm:w-80 md:w-96 border-l border-slate-200/80 bg-white z-20 flex flex-col shadow-xl overflow-y-auto"
            >
              <div className="p-4 sm:p-5 h-full">
                <SessionContextSidebar 
                  onClose={() => setIsSidebarOpen(false)} 
                  onSelectQuery={(q) => handleSend(q)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Quick Suggested Prompts Strip */}
      <div className="px-3 sm:px-6 py-2 border-t border-slate-200/80 bg-slate-50/80 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-scroll print:hidden">
        <span className="text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap font-bold flex items-center gap-1 mr-1 flex-shrink-0">
          <HelpCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
          <span>{t.quickInquiries}</span>
        </span>
        {sampleQueries.map((sample, sIdx) => (
          <button
            key={sIdx}
            type="button"
            onClick={() => handleSend(sample)}
            className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl whitespace-nowrap font-medium transition-all shadow-2xs cursor-pointer flex-shrink-0"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* 5. Minimalist Enterprise Floating Input Composer */}
      <div className="p-2 sm:p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-1.5 sm:gap-2.5 print:hidden">
        <AudioRecorder 
          onTranscription={(transcription) => handleSend(transcription)} 
          lang={language === 'hi' ? 'hi' : 'en'} 
        />

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholderText}
            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 transition-all shadow-inner"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white transition-all flex-shrink-0 disabled:opacity-40 shadow-md shadow-indigo-500/20 flex items-center justify-center cursor-pointer"
          aria-label={t.askButton}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
