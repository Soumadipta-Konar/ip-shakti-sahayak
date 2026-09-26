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
  Languages
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
    toggleLanguage
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
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/§\s*/g, 'Section ')
      .replace(/[•\*\-]\s+/g, ', ')
      .trim();

    const isHindiText = /[\u0900-\u097F]/.test(cleanText);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isHindiText ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => 
      isHindiText
        ? v.lang.toLowerCase().replace('_', '-').startsWith('hi')
        : v.lang.toLowerCase().replace('_', '-').startsWith('en')
    );
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(msgId);
  };

  const handleToggleMessageTranslation = async (msg: ChatMessage) => {
    // If translation is already cached, instantly toggle display view
    if (msg.translatedText) {
      setChatMessages((prev) =>
        prev.map((m) => {
          if (m.id === msg.id) {
            return {
              ...m,
              isShowingTranslation: !m.isShowingTranslation,
            };
          }
          return m;
        })
      );
      return;
    }

    // Determine target language: opposite of current message language
    const isHindiMsg = msg.detectedLanguage === 'hi' || /[\u0900-\u097F]/.test(msg.text);
    const targetLang: 'en' | 'hi' = isHindiMsg ? 'en' : 'hi';

    setTranslatingMsgId(msg.id);
    try {
      const translated = await translateLegalText(msg.text, targetLang);
      setChatMessages((prev) =>
        prev.map((m) => {
          if (m.id === msg.id) {
            return {
              ...m,
              translatedText: translated,
              isShowingTranslation: true,
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Failed to translate message:', err);
      alert('Translation service unavailable. Please ensure the backend is running.');
    } finally {
      setTranslatingMsgId(null);
    }
  };

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const isHindiQuery = /[\u0900-\u097F]/.test(query);

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      jurisdiction,
      detectedLanguage: isHindiQuery ? 'hi' : 'en',
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askLegalQuestion(query, jurisdiction, language, sessionId, classificationState);
      setChatMessages((prev) => [...prev, response]);

      if (response.citations && response.citations.length > 0) {
        addSavedCitations(response.citations, 'chat_session');
      }
    } catch (err: any) {
      console.error('Backend connection error:', err);
      const isHi = language === 'hi';
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: isHi
          ? `⚠️ **AI सहायक कनेक्शन सूचना**\n\n\`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}\` पर कानूनी AI बैकएंड से संपर्क नहीं हो सका।\n\nकृपया सुनिश्चित करें कि बैकएंड सर्वर सक्रिय है।`
          : `⚠️ **AI Copilot Connection Notice**\n\nUnable to reach the legal AI backend at \`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}\`.\n\nPlease verify that the backend is running.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        jurisdiction,
        confidenceScore: 0,
        requiresEscalation: true,
        detectedLanguage: isHi ? 'hi' : 'en',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearChatMessages();
    const freshWelcome = createWelcomeMessage(language);
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
    ? [createWelcomeMessage(language)] 
    : chatMessages;

  const sampleQueries = isIntl
    ? [
        "How does US FDA Botanical Drug Guidance regulate Ayurvedic IND/NDA?",
        "What are WIPO GRATK Treaty 2024 mandatory patent disclosure rules?",
        "Can an Indian classical formula qualify for PCT international patent filing?",
      ]
    : classificationState?.category?.includes('Classical')
    ? [
        language === 'hi' 
          ? "क्या मैं इस शास्त्रीय फॉर्मूले के लिए नई डिलीवरी विधि का पेटेंट करा सकता हूँ?"
          : "Can I patent an altered delivery method for this classical formula?",
        language === 'hi'
          ? "क्या धारा 3(p) सक्रिय अंशों (Active fractions) के निष्कर्षण की अनुमति देती है?"
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
    <div className="relative w-full flex flex-col bg-white border border-[#b1b4b6] shadow-xs">
      {/* 1. Sleek, Compact Header Toolbar with Global UI Translate Button */}
      <div className="px-4 py-2.5 border-b border-[#b1b4b6] bg-[#f8f8f8] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Clean Title & Vector Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#00703c] animate-pulse" />
          <h2 className="text-sm font-bold text-[#0b0c0c]">
            {t.copilotTitle}
          </h2>
          <span className="text-[11px] text-[#505a5f] hidden sm:inline">
            &bull; {t.copilotGrounded}
          </span>
        </div>

        {/* Center/Right: Compact Jurisdiction Switch, Language Switch & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />

          {/* UI Language Switcher Button in Chat Toolbar */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors border bg-white text-[#0b0c0c] border-[#b1b4b6] hover:bg-[#f3f2f1]"
            title={language === 'hi' ? 'Switch whole interface to English' : 'सम्पूर्ण इंटरफ़ेस को हिन्दी में बदलें'}
          >
            <Globe className="w-3.5 h-3.5 text-[#1d70b8]" />
            <span>{t.languageButtonLabel}</span>
          </button>

          {/* Sections Discussed Slide-over Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isSidebarOpen
                ? 'bg-[#002147] text-white border-[#002147]'
                : 'bg-white text-[#0b0c0c] border-[#b1b4b6] hover:bg-[#f3f2f1]'
            }`}
            title={t.sectionsDiscussedTitle}
          >
            <Scale className="w-3.5 h-3.5 text-[#1d70b8]" />
            <span className="hidden sm:inline">{t.sectionsDiscussed}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              discussedSections.length > 0 
                ? 'bg-[#1d70b8] text-white' 
                : 'bg-[#e5e5e5] text-[#0b0c0c]'
            }`}>
              {discussedSections.length}
            </span>
          </button>

          {/* Print Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 text-[#505a5f] hover:text-[#0b0c0c] border border-transparent hover:border-[#b1b4b6] transition-colors"
            title={t.printRecord}
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
                {language === 'hi' ? 'रीसेट' : 'Reset'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="text-[11px] text-[#505a5f] hover:text-[#0b0c0c]"
              >
                {language === 'hi' ? 'रद्द' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingClear(true)}
              className="p-1.5 text-[#505a5f] hover:text-[#0b0c0c] border border-transparent hover:border-[#b1b4b6] transition-colors"
              title={t.resetSession}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Chat Layout with Slide-Over Drawer for Case Context */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Main Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[460px] max-h-[620px] bg-[#ffffff]">
          {displayMessages.map((msg, msgIdx) => {
            const isShowingTranslation = !!msg.isShowingTranslation;
            const displayedText = (isShowingTranslation && msg.translatedText) ? msg.translatedText : msg.text;
            const isHindiMessage = msg.detectedLanguage === 'hi' || /[\u0900-\u097F]/.test(msg.text);
            const isSaved = isResponseSaved(msg.text);

            return (
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
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${msg.sender === 'user' ? 'text-white' : 'text-[#0b0c0c]'}`}>
                        {msg.sender === 'assistant' ? t.assistantLabel : t.applicantLabel}
                      </span>
                      {isShowingTranslation && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#00703c] text-white font-bold rounded-2xs">
                          {t.translatedBadge}
                        </span>
                      )}
                    </div>
                    <span className={msg.sender === 'user' ? 'text-blue-100' : 'text-[#505a5f]'}>
                      {msg.timestamp || 'Just now'}
                    </span>
                  </div>

                  {/* Content (shows translatedText if toggled on, else original text) */}
                  {msg.sender === 'assistant' ? (
                    <MarkdownContent content={displayedText} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Compact Inline Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#e5e5e5] flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-[11px] font-bold text-[#505a5f] uppercase tracking-wider mr-1">
                        {t.authoritiesLabel}
                      </span>
                      {msg.citations.map((c, cIdx) => {
                        const isCitSaved = isCitationSaved(c.act || '', c.section || '');
                        return (
                          <button
                            key={c.id || cIdx}
                            type="button"
                            onClick={() => setSelectedCitation(c)}
                            className="inline-flex items-center gap-1 bg-white border border-[#b1b4b6] px-2 py-0.5 text-[11px] font-bold text-[#1d70b8] hover:border-[#1d70b8] hover:bg-[#f3f2f1] transition-colors"
                          >
                            <span>{c.section || 'Statute'}</span>
                            {isCitSaved && <BookMarked className="w-2.5 h-2.5 text-[#00703c]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Assistant Footer Toolbar: Listen, Translate, Save this Response, Grounding, Escalate */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-2.5 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#505a5f] border-t border-[#e5e5e5] print:hidden">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Listen Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSpeech(msg.id, displayedText)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                            speakingMessageId === msg.id ? 'text-[#d4351c]' : 'text-[#1d70b8] hover:underline'
                          }`}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-[#d4351c] animate-pulse" />
                              <span>{t.stopAction}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#1d70b8]" />
                              <span>{t.listenAction}</span>
                            </>
                          )}
                        </button>

                        {/* Translation Button at bottom of each response */}
                        <button
                          type="button"
                          disabled={translatingMsgId === msg.id}
                          onClick={() => handleToggleMessageTranslation(msg)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1d70b8] hover:text-[#005a30] hover:underline transition-colors disabled:opacity-50"
                          title={isShowingTranslation ? t.showOriginal : (isHindiMessage ? t.translateToEnglish : t.translateToHindi)}
                        >
                          {translatingMsgId === msg.id ? (
                            <>
                              <Languages className="w-3 h-3 text-[#1d70b8] animate-spin" />
                              <span>{t.translatingMessage}</span>
                            </>
                          ) : (
                            <>
                              <Languages className="w-3 h-3 text-[#1d70b8]" />
                              <span>
                                {isShowingTranslation
                                  ? t.showOriginal
                                  : isHindiMessage
                                    ? t.translateToEnglish
                                    : t.translateToHindi}
                              </span>
                            </>
                          )}
                        </button>

                        {/* Save this response Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSaveResponse(msg, msgIdx)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 border transition-colors ${
                            isSaved
                              ? 'bg-[#eef7ee] text-[#00703c] border-[#00703c]/40 shadow-2xs'
                              : 'bg-white text-[#1d70b8] border-[#b1b4b6] hover:bg-[#f3f2f1] hover:border-[#1d70b8]'
                          }`}
                          title={isSaved ? 'Saved to Saved Citations (Click to remove)' : 'Save this response and query to Saved Citations'}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3 h-3 text-[#00703c]" />
                              <span>{t.savedResponse}</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3 h-3 text-[#1d70b8]" />
                              <span>{t.saveThisResponse}</span>
                            </>
                          )}
                        </button>

                        {/* Grounding percentage */}
                        {msg.confidenceScore !== undefined && (
                          <span className="hidden sm:inline text-[11px] text-[#505a5f]">
                            {t.groundingLabel} <strong className="text-[#00703c]">{(msg.confidenceScore * 100).toFixed(0)}%</strong>
                          </span>
                        )}
                      </div>

                      {/* Escalate Button */}
                      <button
                        onClick={() => setIsEscalationOpen(true)}
                        className="text-[11px] font-bold text-[#505a5f] hover:text-[#0b0c0c] hover:underline flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3 text-[#ffdd00]" />
                        <span>{t.escalateAction}</span>
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
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-[#505a5f] text-xs">
              <div className="w-7 h-7 bg-[#0b0c0c] flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#b1b4b6] text-xs font-medium">
                <Sparkles className="w-3 h-3 text-[#1d70b8] animate-pulse" />
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
              className="w-80 sm:w-96 border-l border-[#b1b4b6] bg-white z-10 flex flex-col shadow-lg overflow-y-auto"
            >
              <div className="p-4 sm:p-5 h-full">
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
          <span>{t.quickInquiries}</span>
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
        <AudioRecorder onTranscription={(transcription) => handleSend(transcription)} lang={language === 'hi' ? 'hi' : 'en'} />

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
          aria-label={t.askButton}
        >
          <span>{t.askButton}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
