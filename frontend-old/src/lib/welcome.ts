import { ChatMessage } from './types';

export const createWelcomeMessage = (lang: string = 'en'): ChatMessage => {
  const isHi = (lang || 'en').toLowerCase().startsWith('hi');
  const text = isHi
    ? `### आईपी-शक्ति सहायक में आपका स्वागत है\n\nमैं आपका **वैधानिक AI कानूनी सहायक** हूँ, जो **भारतीय पेटेंट अधिनियम (1970)**, **जैविक विविधता (संशोधन) अधिनियम (2023)**, और **सीएसआईआर पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL)** के वैधानिक नियमों पर आधारित है।\n\nवानस्पतिक पेटेंट पात्रता, धारा 3(p) पूर्व-कला आपत्तियों, सहक्रियात्मक मिश्रणों (Synergy), या बीडीए 2023 एबीएस रॉयल्टी संबंधी कोई भी प्रश्न पूछें।`
    : `### Welcome to IP-SAKTI Sahayak\n\nI am your **Statutory AI Legal Copilot**, grounded in **The Patents Act (1970)**, **The Biological Diversity (Amendment) Act (2023)**, and **CSIR Traditional Knowledge Digital Library (TKDL)**.\n\nAsk any question regarding botanical patentability, Section 3(p) prior-art bars, synergistic admixtures, or BDA 2023 ABS royalties.`;

  return {
    id: 'welcome',
    sender: 'assistant',
    text,
    timestamp: '10:00 AM',
    jurisdiction: 'IN',
    confidenceScore: 0.98,
    detectedLanguage: isHi ? 'hi' : 'en',
    citations: [
      {
        id: 'welcome-cit-1',
        act: isHi ? 'भारतीय पेटेंट अधिनियम, 1970' : 'The Patents Act, 1970',
        section: isHi ? 'धारा 3(p)' : 'Section 3(p)',
        description: isHi ? 'पारंपरिक ज्ञान पेटेंट-अपात्रता वैधानिक रोक' : 'Traditional Knowledge Non-Patentability Bar',
        jurisdiction: 'IN',
        url: 'https://www.ipindia.gov.in',
        source: 'canonical',
      },
      {
        id: 'welcome-cit-2',
        act: isHi ? 'जैविक विविधता अधिनियम, 2023' : 'Biological Diversity Act, 2023',
        section: isHi ? 'धारा 6' : 'Section 6',
        description: isHi ? 'जैविक संसाधनों पर आईपीआर हेतु पूर्व एनबीए अनुमोदन' : 'Prior NBA Approval for IPR on Biological Resources',
        jurisdiction: 'IN',
        url: 'http://nbaindia.org/',
        source: 'canonical',
      },
      {
        id: 'welcome-cit-3',
        act: isHi ? 'भारतीय पेटेंट अधिनियम, 1970' : 'The Patents Act, 1970',
        section: isHi ? 'धारा 3(e)' : 'Section 3(e)',
        description: isHi ? 'साधारण मिश्रण एवं सहक्रियात्मक प्रभाव सीमा' : 'Mere Admixture Synergistic Efficacy Threshold',
        jurisdiction: 'IN',
        url: 'https://www.ipindia.gov.in',
        source: 'canonical',
      },
    ],
  };
};
