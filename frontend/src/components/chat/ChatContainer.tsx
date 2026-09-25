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

const WELCOME_MESSAGES: Record<string, string> = {
  en: `### Namaste & Welcome to IP-SAKTI Sahayak\n\nI am your official **National Statutory AI Legal Copilot**, grounded in **The Indian Patents Act (1970)**, **The Biological Diversity (Amendment) Act (2023)**, **CSIR Traditional Knowledge Digital Library (TKDL)**, and international patent frameworks (WIPO / PCT).\n\nHow may I evaluate your formulation or patent inquiry today?`,
  bn: `### নমস্কার এবং আইপি-শক্তি সহায়ক-এ আপনাকে স্বাগতম\n\nআমি **ভারতীয় পেটেন্ট আইন (১৯৭০)**, **জৈব বৈচিত্র্য (সংশোধন) আইন (২০২৩)**, এবং **সিএসআইআর ঐতিহ্যবাহী জ্ঞান ডিজিটাল লাইব্রেরি (TKDL)**-এর ওপর ভিত্তি করে তৈরি আপনার সরকারি এআই আইনি সহকারী।\n\nআজ আমি কীভাবে আপনার উদ্ভাবন বা ফর্মুলেশনের মূল্যায়ন করতে পারি?`,
  hi: `### नमस्ते और आईपी-शक्ति सहायक में आपका स्वागत है\n\nमैं **भारतीय पेटेंट अधिनियम (1970)**, **जैविक विविधता (संशोधन) अधिनियम (2023)**, और **सीएसआईआर पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL)** पर आधारित आपका आधिकारिक एआई कानूनी सहायक हूँ।\n\nआज मैं आपके नवाचार या उत्पाद का कानूनी मूल्यांकन कैसे कर सकता हूँ?`,
  ml: `### നമസ്കാരം, ഐപി-ശക്തി സഹായക്കിലേക്ക് സ്വാഗതം\n\n**ഇന്ത്യൻ പേറ്റന്റ് നിയമം (1970)**, **ജൈവ വൈവിധ്യ (ഭേദഗതി) നിയമം (2023)**, **CSIR പരമ്പരാഗത വിജ്ഞാന ഡിജിറ്റൽ ലൈബ്രറി (TKDL)** എന്നിവ അടിസ്ഥാനമാക്കിയുള്ള നിങ്ങളുടെ ഔദ്യോഗിക AI നിയമ സഹായിയാണ് ഞാൻ.\n\nഇന്ന് നിങ്ങളുടെ ഉൽപ്പന്നം എങ്ങനെ വിലയിരുത്താം?`,
  ta: `### வணக்கம், ஐபி-சக்தி சஹாயக்கிற்கு நல்வரவு\n\nநான் **இந்திய காப்புரிமைச் சட்டம் (1970)**, **உயிரியல் பன்முகத்தன்மை சட்டம் (2023)**, மற்றும் **CSIR பாரம்பரிய அறிவு டிஜிட்டல் நூலகம் (TKDL)** அடிப்படையிலான உங்கள் சட்ட உதவியாளர்.\n\nஇன்று உங்கள் கண்டுபிடிப்பை எவ்வாறு மதிப்பீடு செய்யலாம்?`,
  te: `### నమస్కారం, ఐపీ-శక్తి సహాయక్‌కు స్వాగతం\n\nనేను **భారత పేటెంట్ చట్టం (1970)**, **జీవ వైవిధ్య చట్టం (2023)**, మరియు **CSIR సాంప్రదాయ జ్ఞాన డిజిటల్ లైబ్రరీ (TKDL)** ఆధారిత మీ అధికారిక AI చట్టపరమైన సహచరుడిని.\n\nఈరోజు మీ ఉత్పత్తుల పేటెంట్ అర్హతను ఎలా అంచనా వేయగలను?`,
};

function translateToIndicSpeech(text: string, targetLang: string): string {
  if (targetLang === 'bn') {
    if (/[\u0980-\u09FF]/.test(text)) return text;
    let bn = text;
    bn = bn.replace(/Namaste & Welcome to IP-SAKTI Sahayak/gi, 'নমস্কার, আইপি-শক্তি সহায়ক-এ আপনাকে স্বাগতম।');
    bn = bn.replace(/I am your official AI statutory legal copilot grounded in/gi, 'আমি আপনার সরকারি এআই আইনি সহকারী, যা ভিত্তি করে তৈরি');
    bn = bn.replace(/The Indian Patents Act \(1970\)/gi, 'ভারতীয় পেটেন্ট আইন ১৯৭০');
    bn = bn.replace(/The Biological Diversity \(Amendment\) Act \(2023\)/gi, 'জৈব বৈচিত্র্য আইন ২০২৩');
    bn = bn.replace(/CSIR Traditional Knowledge Digital Library \(TKDL\)/gi, 'সিএসআইআর ঐতিহ্যবাহী জ্ঞান ডিজিটাল লাইব্রেরি');
    return bn;
  }
  if (targetLang === 'hi') {
    if (/[\u0900-\u097F]/.test(text)) return text;
    let hi = text;
    hi = hi.replace(/Namaste & Welcome to IP-SAKTI Sahayak/gi, 'नमस्ते, आईपी-शक्ति सहायक में आपका स्वागत है।');
    hi = hi.replace(/I am your official AI statutory legal copilot/gi, 'मैं आपका आधिकारिक एআই कानूनी सहायक हूँ।');
    hi = hi.replace(/The Indian Patents Act \(1970\)/gi, 'भारतीय पेटेंट अधिनियम 1970');
    hi = hi.replace(/The Biological Diversity \(Amendment\) Act \(2023\)/gi, 'जैविक विविधता संशोधन अधिनियम 2023');
    return hi;
  }
  return text;
}

const createWelcomeMessage = (lang: string): ChatMessage => ({
  id: 'welcome',
  sender: 'assistant',
  text: WELCOME_MESSAGES[lang] || WELCOME_MESSAGES['en'],
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
      alert('Speech synthesis is not supported on this browser.');
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

    cleanText = translateToIndicSpeech(cleanText, language);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const localeMap: Record<string, string> = {
      hi: 'hi-IN',
      ml: 'ml-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      en: 'en-IN',
    };

    utterance.lang = localeMap[language] || 'en-IN';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = localeMap[language] || 'en-IN';
    const targetLangShort = language;

    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vName = v.name.toLowerCase();
      if (targetLangShort === 'bn') {
        return vLang.startsWith('bn') || vName.includes('bengali') || vName.includes('bangla');
      }
      if (targetLangShort === 'hi') {
        return vLang.startsWith('hi') || vName.includes('hindi');
      }
      return vLang.startsWith(targetLangCode.toLowerCase());
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

      const response = await askLegalQuestion(contextualizedQuery, jurisdiction, language, sessionId, classificationState);
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
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 4000);
      return;
    }
    clearChatMessages();
    const freshWelcome = createWelcomeMessage(language);
    setChatMessages([freshWelcome]);
    if (freshWelcome.citations) {
      addSavedCitations(freshWelcome.citations, 'canonical');
    }
    setIsConfirmingClear(false);
  };

  const displayMessages = (!isHydrated || chatMessages.length === 0) 
    ? [createWelcomeMessage(language)] 
    : chatMessages;

  const sampleQueries = language === 'bn'
    ? [
        "আদা এবং মধুর কাশির সিরাপ কি পেটেন্ট করা সম্ভব?",
        "অশ্বগন্ধার জন্য BDA 2023 অনুসারে ABS প্রদেয় কত?",
        "FSSAI 2022 এর অধীনে আয়ুর্বেদ-আহার কি পেটেন্টযোগ্য?",
        "চরক সংহিতার রেসিপিতে ধারা ৩(p) কীভাবে প্রযোজ্য?",
      ]
    : language === 'hi'
    ? [
        "क्या मैं अदरक और शहद की खांसी की दवा पेटेंट करवा सकता हूँ?",
        "अश्वगंधा के लिए BDA 2023 के तहत ABS नियम क्या हैं?",
        "क्या FSSAI 2022 के तहत आयुर्वेद-आहार को पेटेंट किया जा सकता है?",
        "शास्त्रीय नुस्खे पर धारा 3(p) कैसे लागू होती है?",
      ]
    : isIntl
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
        "What are my BDA 2023 ABS exemptions as an Indian Vaidya?",
        "How to cite CSIR-TKDL textual prior art?",
      ]
    : [
        "Can I patent a ginger and honey cough syrup under Section 3(p)?",
        "What are my ABS royalty requirements under BDA 2023 for Ashwagandha?",
        "How does Section 3(e) apply to synergistic admixtures?",
        "What approvals are required from National Biodiversity Authority (Form III)?",
      ];

  const placeholderText = language === 'bn'
    ? "পেটেন্টযোগ্যতা, ধারা ৩, TKDL, বা ABS সম্মতি সম্পর্কে বাংলায় অথবা ইংরেজিতে প্রশ্ন করুন..."
    : language === 'hi'
    ? "पेटेंट योग्यता, धारा 3, TKDL या ABS नियमों के बारे में हिन्दी या अंग्रेजी में पूछें..."
    : isIntl
    ? "Ask about WIPO GRATK, PCT, US FDA Botanical Drug guidance, or EMA THMPD..."
    : `Ask about patentability, Section 3 bars, TKDL, or ABS compliance in ${language.toUpperCase()} or English...`;

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
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="bg-[#fffdf2] border-b-2 border-[#ffdd00] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <span className="font-bold text-amber-950">Step 1 Recommended:</span>
            <span className="text-amber-800 font-medium text-xs">
              Classify your formulation first to help the AI apply tailored Section 3(p)/(e)/(d) and ABS rules.
            </span>
          </div>
          <Link
            href="/wizard"
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Launch Triage</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* 2. Top Toolbar */}
      <div className="p-3.5 sm:p-4 bg-[#f3f2f1] border-b border-[#b1b4b6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              {isIntl 
                ? 'International IPR & Botanical Frameworks (WIPO GRATK & PCT)' 
                : 'National Statutory AI Copilot (Patents Act 1970 & BDA 2023)'}
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              BAAI Vector Grounded
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Saved Citations Quick Counter */}
          <Link
            href="/history"
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="View collected statutory citations in Session History"
          >
            <BookMarked className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Citations Vault</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
              {savedCitations.length}
            </span>
          </Link>

          {/* Clear / New Consultation */}
          <button
            type="button"
            onClick={handleClearHistory}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all shadow-2xs ${
              isConfirmingClear
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Start fresh consultation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isConfirmingClear ? 'Confirm?' : 'New Chat'}</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Print or Save Consultation as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          <JurisdictionToggle value={jurisdiction} onChange={setJurisdiction} />
        </div>
      </div>

      {/* 3. Message Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#fafafa]">
        {displayMessages.map((msg, idx) => (
          <motion.div
            key={msg.id || idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-3 max-w-4xl mx-auto ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white flex-shrink-0 shadow-2xs mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`p-4 sm:p-5 rounded-2xl transition-all ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs max-w-xl rounded-tr-xs'
                : 'bg-white text-slate-900 border border-slate-200/90 shadow-xs flex-1 rounded-tl-xs'
            }`}>
              {/* Parse Markdown & Inline Citations */}
              {msg.sender === 'assistant' ? (
                <MarkdownContent content={msg.text} />
              ) : (
                <p className="whitespace-pre-wrap font-medium text-sm leading-relaxed">{msg.text}</p>
              )}

              {/* Citations Badges with Auto-Collector & Bookmark Toggle */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600 mb-2 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      <span>Statutory Law References (Click to inspect):</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Saved in Session Vault
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((cit, cIdx) => {
                      const isSaved = isCitationSaved(cit.act, cit.section);
                      return (
                        <div
                          key={cIdx}
                          className="inline-flex items-stretch rounded-xl border border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50 transition-all overflow-hidden shadow-2xs"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedCitation(cit)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-slate-800 text-xs font-semibold transition-colors"
                            title="Click to view verbatim statutory provision"
                          >
                            <span className="text-blue-700 font-mono">§ {cit.section}</span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              ({cit.act})
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (isSaved) {
                                removeSavedCitation(cit.id || `${cit.act}::${cit.section}`);
                              } else {
                                addSavedCitations([cit], 'user_saved');
                              }
                            }}
                            className={`px-2 py-1 border-l text-xs transition-colors flex items-center justify-center ${
                              isSaved
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-white'
                            }`}
                            title={isSaved ? "Saved (Click to remove)" : "Save citation"}
                          >
                            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-amber-600 text-amber-700' : 'text-slate-400'}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prominent Escalation Banner for Low Confidence */}
              {msg.sender === 'assistant' && (msg.requiresEscalation || (msg.confidenceScore !== undefined && msg.confidenceScore < 0.7)) && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-md">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      <span>Statutory Ambiguity Flagged</span>
                    </div>
                    <p className="text-xs text-amber-800 leading-snug">
                      This question touches complex overlapping provisions. We recommend professional review by an empanelled Patent &amp; IPR Facilitator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEscalationOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors whitespace-nowrap"
                  >
                    Escalate to IP Attorney
                  </button>
                </div>
              )}

              {/* Audio Listen & Facilitator Footer */}
              {msg.sender === 'assistant' && (
                <div className="mt-3.5 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100 print:hidden">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeech(msg.id, msg.text)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all border ${
                        speakingMessageId === msg.id
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                      title={speakingMessageId === msg.id ? 'Stop listening' : 'Listen to legal assessment in audio'}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                          <span>{language === 'bn' ? 'অডিও থামান' : language === 'hi' ? 'ऑडियो रोकें' : 'Stop Audio'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>{language === 'bn' ? 'বাংলায় শুনুন' : language === 'hi' ? 'आवाज़ सुनें' : 'Listen Audio'}</span>
                        </>
                      )}
                    </button>

                    {msg.confidenceScore !== undefined && (
                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Statutory Grounding:</span>
                        <span className="text-emerald-700 font-bold">
                          {(msg.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsEscalationOpen(true)}
                    className="text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold text-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Facilitator Escalation</span>
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5 font-bold shadow-2xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-600 text-xs max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-2xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>
                {language === 'bn'
                  ? 'পেটেন্ট আইন ১৯৭০ এবং টিকেডিএল অনুসারে উত্তর প্রস্তুত করা হচ্ছে...'
                  : 'Searching Qdrant Cloud BAAI vectors & synthesizing response...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Suggested Prompts (Modern Pill Chips) */}
      <div className={`px-4 py-2.5 border-t border-slate-200 flex items-center gap-2 overflow-x-auto print:hidden ${
        isIntl ? 'bg-blue-50/50' : 'bg-slate-50/70'
      }`}>
        <span className="text-xs text-slate-500 whitespace-nowrap font-semibold flex items-center gap-1.5 mr-1">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'bn' ? 'সাধারণ প্রশ্নসমূহ:' : language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Quick Inquiries:'}</span>
        </span>
        {sampleQueries.map((sample, sIdx) => (
          <button
            key={sIdx}
            onClick={() => handleSend(sample)}
            className="text-xs px-3.5 py-1.5 bg-white border border-slate-200/90 rounded-full text-slate-700 whitespace-nowrap transition-all font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 shadow-2xs"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* 5. Input Bar with Bhashini AudioRecorder */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 print:hidden">
        <AudioRecorder onTranscription={(transcription) => handleSend(transcription)} lang={language} />

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholderText}
            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all shadow-2xs"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || isLoading}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex-shrink-0 disabled:opacity-40 shadow-xs flex items-center justify-center"
          aria-label="Send Query"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
