export type SupportedLanguage = 'en' | 'hi';

export interface TranslationDictionary {
  // Brand & Header
  brandTitle: string;
  serviceTitle: string;
  serviceSubtitle: string;
  ragStatus: string;
  enterpriseTag: string;
  languageButtonLabel: string;
  currentLanguageName: string;

  // Navigation
  navOverview: string;
  navCopilot: string;
  navTools: string;
  navHistory: string;
  workflowLabel: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;

  // Breadcrumbs & Common
  home: string;
  backToOverview: string;

  // Phase Banner
  phaseTag: string;
  phaseBannerText: string;

  // Copilot Page
  copilotTitle: string;
  copilotGrounded: string;
  indiaLaw: string;
  globalLaw: string;
  caseDossier: string;
  quickInquiries: string;
  sampleQueries: string[];
  inputPlaceholder: string;
  askButton: string;
  listening: string;
  transcribing: string;
  listenAction: string;
  stopAction: string;
  translateToHindi: string;
  translateToEnglish: string;
  showOriginal: string;
  translatingMessage: string;
  groundingLabel: string;
  escalateAction: string;
  authoritiesLabel: string;
  applicantLabel: string;
  assistantLabel: string;
  translatedBadge: string;
  resetSession: string;
  printRecord: string;
  searchingAdvice: string;
  saveThisResponse: string;
  savedResponse: string;
  sectionsDiscussed: string;
  sectionsDiscussedTitle: string;
  sectionsDiscussedDesc: string;
  savedCitationsTitle: string;
  savedCitationsSubtitle: string;

  // Welcome Message Content
  welcomeMarkdown: string;

  // Footer
  footerServicesTitle: string;
  footerStatutoryClearance: string;
  footerFormulationTriage: string;
  footerTkdlScreening: string;
  footerAbsCalculator: string;
  footerDossierExport: string;
  footerCitations: string;
  footerPlatformNote: string;
  footerDisclaimer: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    brandTitle: 'IP-SAKTI SAHAYAK',
    serviceTitle: 'Statutory Patent & Bio-Resource Intelligence Platform',
    serviceSubtitle: 'Clear botanical and pharmaceutical innovations against Section 3(p) TKDL bars, BDA 2023 ABS liabilities, and CDSCO Rule 122-E',
    ragStatus: 'Qdrant Cloud RAG • Synchronized',
    enterpriseTag: 'Enterprise B2B',
    languageButtonLabel: 'हिन्दी',
    currentLanguageName: 'English',

    navOverview: 'Overview & Guide',
    navCopilot: 'Legal AI Copilot',
    navTools: 'Compliance Tools',
    navHistory: 'Saved Citations',
    workflowLabel: 'Workflow: 4 Steps',
    step1: '1. Formulation Triage',
    step2: '2. TKDL Prior-Art Screen',
    step3: '3. BDA 2023 ABS Calculator',
    step4: '4. Compliance Dossier',

    home: 'Home',
    backToOverview: 'Back to Service Overview',

    phaseTag: 'GOVERNMENT DECISION SUPPORT SYSTEM',
    phaseBannerText: 'Enterprise legal intelligence grounded in statutory provisions from Indian Patents Act 1970, BDA 2023, and CSIR-TKDL.',

    copilotTitle: 'Statutory AI Copilot',
    copilotGrounded: 'Grounded in Statutory Law',
    indiaLaw: 'India Law',
    globalLaw: 'Global Law',
    caseDossier: 'Case Dossier',
    quickInquiries: 'Quick Inquiries:',
    sampleQueries: [
      'Can I patent a ginger and honey cough syrup under Section 3(p)?',
      'What are my ABS royalty requirements under BDA 2023 for Ashwagandha?',
      'How does Section 3(e) apply to synergistic herbal admixtures?',
    ],
    inputPlaceholder: 'Ask any legal question in English or Hindi (e.g. Can I patent Ashwagandha under Sec 3p?)...',
    askButton: 'Ask',
    listening: 'Listening...',
    transcribing: 'Transcribing audio...',
    listenAction: 'Listen',
    stopAction: 'Stop',
    translateToHindi: 'हिन्दी अनुवाद (Translate)',
    translateToEnglish: 'English (Translate)',
    showOriginal: 'Show Original (मूल)',
    translatingMessage: 'Translating...',
    groundingLabel: 'Grounding:',
    escalateAction: 'Escalate',
    authoritiesLabel: 'Authorities:',
    applicantLabel: 'Applicant',
    assistantLabel: 'IP-SAKTI Copilot',
    translatedBadge: 'Translated',
    resetSession: 'Reset Assessment Session',
    printRecord: 'Print Official Legal Advice Record',
    searchingAdvice: 'Searching statutory vectors & synthesizing legal advice...',
    saveThisResponse: 'Save this response',
    savedResponse: 'Saved',
    sectionsDiscussed: 'Sections Discussed',
    sectionsDiscussedTitle: 'Statutory Sections Discussed in Chat',
    sectionsDiscussedDesc: 'Real-time catalogue of statutory provisions, patent bars, and regulatory rules referenced during this consultation.',
    savedCitationsTitle: 'Saved Citations & Consultations Vault',
    savedCitationsSubtitle: 'Audited record of user queries, statutory responses, and cited legal sections. Persisted in your secure browser storage.',

    welcomeMarkdown: `### Welcome to IP-SAKTI Sahayak

I am your **Statutory AI Legal Copilot**, grounded in **The Patents Act (1970)**, **The Biological Diversity (Amendment) Act (2023)**, and **CSIR Traditional Knowledge Digital Library (TKDL)**.

Ask any question regarding botanical patentability, Section 3(p) prior-art bars, synergistic admixtures, or BDA 2023 ABS royalties.`,

    footerServicesTitle: 'ENTERPRISE PLATFORM SERVICES',
    footerStatutoryClearance: 'Statutory Clearance Engine',
    footerFormulationTriage: 'Formulation Triage',
    footerTkdlScreening: 'CSIR-TKDL Screening',
    footerAbsCalculator: 'BDA 2023 ABS Calculator',
    footerDossierExport: 'Audit Dossier Export',
    footerCitations: 'Statutory Citations',
    footerPlatformNote: 'Commercial LegalTech Platform • Qdrant Cloud RAG v1.5 Synced',
    footerDisclaimer: 'Built for Smart India Hackathon (SIH). Compliant with Indian DPDP Act 2023.',
  },
  hi: {
    brandTitle: 'आईपी-शक्ति सहायक',
    serviceTitle: 'वैधानिक पेटेंट एवं जैव-संसाधन आसूचना मंच',
    serviceSubtitle: 'धारा 3(p) पारंपरिक ज्ञान बाधाओं, बीडीए 2023 एबीएस देनदारियों और सीडीएससीओ नियम 122-E के विरुद्ध वानस्पतिक व औषधीय नवाचारों की जांच',
    ragStatus: 'क्वाड्रंट क्लाउड RAG • सक्रिय',
    enterpriseTag: 'उद्यम B2B',
    languageButtonLabel: 'English',
    currentLanguageName: 'हिन्दी',

    navOverview: 'अवलोकन एवं मार्गदर्शिका',
    navCopilot: 'कानूनी AI सहायक',
    navTools: 'अनुपालन उपकरण',
    navHistory: 'सहेजे गए उद्धरण',
    workflowLabel: 'कार्यप्रवाह: 4 चरण',
    step1: '1. फॉर्मूलेशन ट्राइएज',
    step2: '2. टीकेडीएल पूर्व-कला जांच',
    step3: '3. बीडीए 2023 रॉयल्टी कैलकुलेटर',
    step4: '4. अनुपालन डोजियर',

    home: 'होम',
    backToOverview: 'सेवा अवलोकन पर वापस जाएं',

    phaseTag: 'सरकारी निर्णय सहायता प्रणाली',
    phaseBannerText: 'भारतीय पेटेंट अधिनियम 1970, बीडीए 2023 और सीएसआईआर-टीकेडीएल के वैधानिक कानूनी प्रावधानों पर आधारित विधिक आसूचना।',

    copilotTitle: 'वैधानिक AI सहायक',
    copilotGrounded: 'वैधानिक संविधियों द्वारा सत्यापित',
    indiaLaw: 'भारतीय कानून',
    globalLaw: 'वैश्विक कानून',
    caseDossier: 'केस डोजियर',
    quickInquiries: 'त्वरित कानूनी प्रश्न:',
    sampleQueries: [
      'क्या मैं धारा 3(p) के तहत अदरक और शहद के कफ सिरप का पेटेंट करा सकता हूँ?',
      'अश्वगंधा के लिए बीडीए 2023 के तहत रॉयल्टी और एनबीए नियम क्या हैं?',
      'धारा 3(e) के तहत सहक्रियात्मक (synergistic) फॉर्मूलेशन के क्या नियम हैं?',
    ],
    inputPlaceholder: 'हिन्दी या अंग्रेज़ी में कोई भी कानूनी प्रश्न पूछें (उदा. क्या मैं धारा 3(p) के तहत अश्वगंधा का पेटेंट करा सकता हूँ?)...',
    askButton: 'पूछें',
    listening: 'सुन रहा हूँ...',
    transcribing: 'ऑडियो का लिप्यंतरण हो रहा है...',
    listenAction: 'सुनें',
    stopAction: 'रोकें',
    translateToHindi: 'हिन्दी अनुवाद',
    translateToEnglish: 'Translate to English',
    showOriginal: 'मूल संदेश दिखाएं',
    translatingMessage: 'अनुवाद हो रहा है...',
    groundingLabel: 'सटीकता:',
    escalateAction: 'अधिवक्ता परामर्श',
    authoritiesLabel: 'प्रासंगिक धाराएं:',
    applicantLabel: 'आवेदक',
    assistantLabel: 'आईपी-शक्ति सहायक',
    translatedBadge: 'अनुवादित',
    resetSession: 'सत्र रीसेट करें',
    printRecord: 'कानूनी रिकॉर्ड प्रिंट करें',
    searchingAdvice: 'वैधानिक धाराओं की खोज और कानूनी सलाह तैयार की जा रही है...',
    saveThisResponse: 'यह उत्तर सहेजें',
    savedResponse: 'सहेजा गया',
    sectionsDiscussed: 'चर्चा की गई धाराएं',
    sectionsDiscussedTitle: 'चैट में चर्चा की गई कानूनी धाराएं',
    sectionsDiscussedDesc: 'इस परामर्श के दौरान उद्धृत सभी वैधानिक प्रावधानों, पेटेंट बाधाओं और विनियामक नियमों की वास्तविक समय सूची।',
    savedCitationsTitle: 'सहेजे गए उद्धरण एवं परामर्श वॉल्ट',
    savedCitationsSubtitle: 'उपयोगकर्ता के प्रश्नों, वैधानिक उत्तरों और उद्धृत कानूनी धाराओं का ऑडिट रिकॉर्ड। सुरक्षित ब्राउज़र स्टोरेज में सुरक्षित।',

    welcomeMarkdown: `### आईपी-शक्ति सहायक में आपका स्वागत है

मैं आपका **वैधानिक AI कानूनी सहायक** हूँ, जो **भारतीय पेटेंट अधिनियम (1970)**, **जैविक विविधता (संशोधन) अधिनियम (2023)**, और **सीएसआईआर पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL)** के वैधानिक नियमों पर आधारित है।

वानस्पतिक पेटेंट पात्रता, धारा 3(p) पूर्व-कला आपत्तियों, सहक्रियात्मक मिश्रणों (Synergy), या बीडीए 2023 एबीएस रॉयल्टी संबंधी कोई भी प्रश्न पूछें।`,

    footerServicesTitle: 'उद्यम मंच सेवाएं',
    footerStatutoryClearance: 'वैधानिक मंजूरी इंजन',
    footerFormulationTriage: 'फॉर्मूलेशन ट्राइएज',
    footerTkdlScreening: 'सीएसआईआर-टीकेडीएल जांच',
    footerAbsCalculator: 'बीडीए 2023 एबीएस कैलकुलेटर',
    footerDossierExport: 'ऑडिट डोजियर निर्यात',
    footerCitations: 'वैधानिक उद्धरण',
    footerPlatformNote: 'वाणिज्यिक लीगलटेक प्लेटफॉर्म • क्वाड्रंट क्लाउड RAG v1.5 सिंक',
    footerDisclaimer: 'स्मार्ट इंडिया हैकाथॉन (SIH) के लिए निर्मित। भारतीय डीपीडीपी अधिनियम 2023 के अनुरूप।',
  },
};

export function getTranslations(lang?: string): TranslationDictionary {
  const code = (lang || 'en').toLowerCase().startsWith('hi') ? 'hi' : 'en';
  return TRANSLATIONS[code];
}
