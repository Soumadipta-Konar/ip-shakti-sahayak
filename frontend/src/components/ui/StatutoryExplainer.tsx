'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Scale, BookOpen, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export interface GlossaryDefinition {
  id: string;
  titleEn: string;
  titleHi: string;
  statute: string;
  badge: string;
  whatIsItEn: string;
  whatIsItHi: string;
  whyItMattersEn: string;
  whyItMattersHi: string;
  statutoryRef?: string;
}

export const STATUTORY_GLOSSARY: Record<string, GlossaryDefinition> = {
  // Workflow Steps
  'workflow-steps': {
    id: 'workflow-steps',
    titleEn: '4-Step Statutory Clearance Process',
    titleHi: '4-चरणीय वैधानिक मंजूरी प्रक्रिया',
    statute: 'Indian Regulatory Pipeline',
    badge: 'CLEARANCE PIPELINE',
    whatIsItEn: 'A structured, end-to-end statutory clearance workflow required before commercializing or filing patents on Ayurvedic, herbal, and bio-resource innovations in India.',
    whatIsItHi: 'भारत में आयुर्वेदिक, वानस्पतिक और जैव-संसाधन नवाचारों के व्यवसायीकरण या पेटेंट दाखिल करने से पूर्व आवश्यक 4-चरणीय वैधानिक अनुपालन कार्यप्रवाह।',
    whyItMattersEn: 'Prevents costly patent rejections, biopiracy prosecution, and non-compliance fines from NBA and CDSCO.',
    whyItMattersHi: 'महंगे पेटेंट अस्वीकरण, जैव-तस्करी के मुकदमों और एनबीए व सीडीएससीओ के भारी जुर्मानों से बचाता है।',
    statutoryRef: 'IPO Guidelines & BDA Rules 2023',
  },
  'step-1-formulation': {
    id: 'step-1-formulation',
    titleEn: '1. Formulation Triage & Pathway',
    titleHi: '1. फॉर्मूलेशन ट्राइएज एवं नियामक मार्ग',
    statute: 'Drugs & Cosmetics Act, 1940 / FSSAI Act',
    badge: 'STEP 1: TRIAGE',
    whatIsItEn: 'Diagnoses your recipe into 1 of 6 legal classifications: Classical Generic, Patent & Proprietary (P&P), Phytopharmaceutical, or Food/Nutraceutical.',
    whatIsItHi: 'आपकी औषधि/उत्पाद का 6 कानूनी श्रेणियों में वर्गीकरण: शास्त्रीय जेनेरिक, पेटेंट या प्रोप्राइटरी (P&P), फाइटोफार्मास्युटिकल, अथवा आहार/न्यूट्रास्यूटिकल।',
    whyItMattersEn: 'Dictates whether your innovation requires animal safety trials, human clinical studies, or can be licensed purely on classical textual authority.',
    whyItMattersHi: 'यह तय करता है कि आपकी दवा को क्लिनिकल ट्रायल की आवश्यकता है अथवा इसे सीधे शास्त्रीय ग्रंथों के आधार पर लाइसेंस मिल सकता है।',
    statutoryRef: 'Rule 158-B & Rule 122-E',
  },
  'step-2-tkdl': {
    id: 'step-2-tkdl',
    titleEn: '2. CSIR-TKDL Prior-Art Screen',
    titleHi: '2. सीएसआईआर-टीकेडीएल पूर्व-कला जांच',
    statute: 'The Patents Act, 1970 § 3(p) & 3(e)',
    badge: 'STEP 2: PRIOR ART',
    whatIsItEn: 'Screens botanical ingredients and indications against 54 classical Ayurveda texts in the CSIR Traditional Knowledge Digital Library (TKDL) and evaluates Section 3(e) synergistic hurdles.',
    whatIsItHi: 'सीएसआईआर पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) के 54 शास्त्रीय ग्रंथों के विरुद्ध सामग्री की जांच और धारा 3(e) सहक्रियात्मक प्रभाव (Synergy) का मूल्यांकन।',
    whyItMattersEn: 'Identifies Section 3(p) non-patentability bars before spending ₹2-5 Lakhs on patent filing and examination fees.',
    whyItMattersHi: 'पेटेंट फाइलिंग शुल्क खर्च करने से पहले ही धारा 3(p) पारंपरिक ज्ञान बाधाओं की पहचान कर लेता है।',
    statutoryRef: 'Patents Act 1970, Section 3(p)',
  },
  'step-3-abs': {
    id: 'step-3-abs',
    titleEn: '3. BDA 2023 ABS Calculator',
    titleHi: '3. बीडीए 2023 एबीएस रॉयल्टी कैलकुलेटर',
    statute: 'Biological Diversity (Amendment) Act, 2023',
    badge: 'STEP 3: BIO-RESOURCES',
    whatIsItEn: 'Calculates mandatory Access and Benefit Sharing (ABS) fees (0.1% to 0.5% turnover) payable to State Biodiversity Boards or verifies registered practitioner exemptions under Section 7.',
    whatIsItHi: 'राज्य जैव विविधता बोर्ड को देय वैधानिक लाभ-साझाकरण शुल्क (टर्नओवर का 0.1% से 0.5%) की गणना अथवा धारा 7 पंजीकृत वैद्य छूट का सत्यापन।',
    whyItMattersEn: 'Eliminates legal liabilities, notices, and criminal sanctions under Section 55 of the Biological Diversity Act.',
    whyItMattersHi: 'जैविक विविधता अधिनियम के तहत कानूनी नोटिसों, मुकदमों और दंडात्मक कार्रवाइयों से सुरक्षा प्रदान करता है।',
    statutoryRef: 'BDA 2023 § 7 & § 21(2)',
  },
  'step-4-dossier': {
    id: 'step-4-dossier',
    titleEn: '4. Statutory Compliance Dossier',
    titleHi: '4. वैधानिक अनुपालन डोजियर एवं निर्यात',
    statute: 'IPO, NBA, CDSCO Evidence Audit',
    badge: 'STEP 4: AUDIT DOSSIER',
    whatIsItEn: 'Generates a tamper-proof, verified digital compliance audit report in PDF format ready for submission to patent examiners, NBA committees, and state drug controllers.',
    whatIsItHi: 'पेटेंट परीक्षकों, एनबीए समितियों और राज्य औषधि नियंत्रकों के समक्ष प्रस्तुत करने हेतु एक आधिकारिक डिजिटल ऑडिट रिपोर्ट (PDF) तैयार करता है।',
    whyItMattersEn: 'Serves as authoritative legal evidence during patent prosecution and regulatory licensing audits.',
    whyItMattersHi: 'पेटेंट परीक्षण और विनियामक लाइसेंसिंग के दौरान आधिकारिक कानूनी प्रमाण के रूप में कार्य करता है।',
    statutoryRef: 'Formal Statutory Filing Record',
  },

  // Difficult Legal & Scientific Concepts
  'classical-generic': {
    id: 'classical-generic',
    titleEn: 'Classical Generic Formulation',
    titleHi: 'शास्त्रीय जेनेरिक औषधि',
    statute: 'Drugs & Cosmetics Act, 1940 (First Schedule)',
    badge: 'REGULATORY CATEGORY',
    whatIsItEn: 'An Ayurvedic, Siddha, or Unani formulation manufactured strictly in accordance with the exact formulations described in the 54 classical authoritative texts listed in the First Schedule.',
    whatIsItHi: 'औषधि एवं प्रसाधन सामग्री अधिनियम की प्रथम अनुसूची में सूचीबद्ध 54 शास्त्रीय प्रामाणिक ग्रंथों में वर्णित नुस्खे के अनुसार निर्मित पारंपरिक दवा।',
    whyItMattersEn: 'Exempt from animal safety and human efficacy trials under Rule 158-B. Cannot be patented under Section 3(p) as it is public traditional knowledge.',
    whyItMattersHi: 'नियम 158-B के तहत सुरक्षा ट्रायल से छूट प्राप्त। सार्वजनिक पारंपरिक ज्ञान होने के कारण धारा 3(p) के तहत इसका पेटेंट नहीं हो सकता।',
    statutoryRef: 'First Schedule, Drugs & Cosmetics Act',
  },
  'patent-proprietary': {
    id: 'patent-proprietary',
    titleEn: 'Patent or Proprietary (P&P) Medicine',
    titleHi: 'पेटेंट या प्रोप्राइटरी (P&P) औषधि',
    statute: 'Drugs & Cosmetics Rules, 1945 Rule 158-B',
    badge: 'REGULATORY CATEGORY',
    whatIsItEn: 'An AYUSH medicine containing classical ingredients but formulated with altered ratios, novel excipients, or modern dosage delivery forms (e.g. effervescent tablets, sprays).',
    whatIsItHi: 'एक ऐसी आयुष दवा जिसमें शास्त्रीय जड़ी-बूटियां तो हैं, लेकिन उनका अनुपात, रूप या सहायक तत्व (Excipients) आधुनिक तकनीक द्वारा तैयार किए गए हैं।',
    whyItMattersEn: 'Requires published pilot safety and clinical efficacy data under Rule 158-B. Patentable only if demonstrable pharmacological synergy is proven under Section 3(e).',
    whyItMattersHi: 'नियम 158-B के तहत सुरक्षा डेटा आवश्यक। पेटेंट तभी संभव है जब धारा 3(e) के तहत सहक्रियात्मक प्रभाव (Synergy) सिद्ध हो।',
    statutoryRef: 'Rule 158-B(1)(b)',
  },
  'phytopharmaceutical': {
    id: 'phytopharmaceutical',
    titleEn: 'Phytopharmaceutical Drug (Rule 122-E)',
    titleHi: 'फाइटोफार्मास्युटिकल औषधि (नियम 122-E)',
    statute: 'Drugs & Cosmetics Rules, 1945 Rule 122-E',
    badge: 'ADVANCED PHARMA',
    whatIsItEn: 'A purified and standardized fraction with at least 4 validated bioactive chemical markers extracted from a medicinal plant, intended for modern clinical applications.',
    whatIsItHi: 'औषधीय पौधे से निकाला गया एक शुद्ध और मानकीकृत अंश, जिसमें कम से कम 4 सत्यापित बायोएक्टिव रासायनिक मार्कर होते हैं।',
    whyItMattersEn: 'Follows rigorous CDSCO allopathic-style Phase I-III clinical trials. Eligible for standard pharmaceutical patent claims and global FDA Botanical Drug pathways.',
    whyItMattersHi: 'सीडीएससीओ के आधुनिक फेज 1-3 क्लिनिकल ट्रायल का पालन करती है। इसके पेटेंट और वैश्विक निर्यात के सबसे मजबूत अवसर होते हैं।',
    statutoryRef: 'CDSCO Rule 122-E',
  },
  'csir-tkdl': {
    id: 'csir-tkdl',
    titleEn: 'CSIR-TKDL (Traditional Knowledge Digital Library)',
    titleHi: 'सीएसआईआर-टीकेडीएल (पारंपरिक ज्ञान डिजिटल लाइब्रेरी)',
    statute: 'CSIR & Ministry of AYUSH Repository',
    badge: 'PRIOR-ART DATABASE',
    whatIsItEn: 'A pioneer Indian digital database translating and cataloguing over 2.5 lakh medicinal formulations from 54 ancient Sanskrit, Arabic, Persian, and Tamil classical medical texts.',
    whatIsItHi: 'सीएसआईआर और आयुष मंत्रालय द्वारा 54 प्राचीन शास्त्रीय ग्रंथों के 2.5 लाख से अधिक नुस्खों का डिजिटल डेटाबेस, जो 5 अंतरराष्ट्रीय भाषाओं में उपलब्ध है।',
    whyItMattersEn: 'Examiners at the Indian Patent Office, USPTO, and EPO search TKDL to instantly reject patent applications citing prior knowledge under Section 3(p).',
    whyItMattersHi: 'विश्व भर के पेटेंट परीक्षक भारतीय जड़ी-बूटियों पर पेटेंट आवेदन खारिज करने के लिए टीकेडीएल का उपयोग करते हैं।',
    statutoryRef: 'CSIR-TKDL Access Agreement',
  },
  'section-3p': {
    id: 'section-3p',
    titleEn: 'Section 3(p) - Traditional Knowledge Bar',
    titleHi: 'धारा 3(p) - पारंपरिक ज्ञान पेटेंट बाधा',
    statute: 'The Patents Act, 1970 § 3(p)',
    badge: 'STATUTORY BAR',
    whatIsItEn: 'A statutory provision in Indian Patent Law declaring that an invention which is traditional knowledge or an aggregation/duplication of known traditional properties is NOT patentable.',
    whatIsItHi: 'भारतीय पेटेंट अधिनियम का वैधानिक नियम, जिसके अनुसार कोई भी आविष्कार जो पारंपरिक ज्ञान है या पारंपरिक गुणों का मात्र दोहराव है, पेटेंट योग्य नहीं है।',
    whyItMattersEn: 'Direct cause of >85% of patent rejections for herbal, Ayurvedic, and cosmetic formulations filed in India.',
    whyItMattersHi: 'भारत में हर्बल और आयुर्वेदिक पेटेंट आवेदनों के 85% से अधिक खारिज होने का मुख्य कारण यही धारा है।',
    statutoryRef: 'Section 3(p), Patents Act 1970',
  },
  'section-3e': {
    id: 'section-3e',
    titleEn: 'Section 3(e) - Synergistic Efficacy Hurdle',
    titleHi: 'धारा 3(e) - सहक्रियात्मक प्रभाव (Synergy) बाधा',
    statute: 'The Patents Act, 1970 § 3(e)',
    badge: 'STATUTORY BAR',
    whatIsItEn: 'Bars patenting of substances obtained by a mere admixture resulting only in aggregation of properties. Innovators must prove super-additive synergy.',
    whatIsItHi: 'जड़ी-बूटियों के साधारण मिश्रण (Mere Admixture) का पेटेंट रोकता है। आवेदक को प्रयोगशाला डेटा से साबित करना होता है कि घटक मिलकर चमत्कारी सहक्रिया (Synergy) दिखाते हैं।',
    whyItMattersEn: 'Combining Ginger + Honey or Turmeric + Black Pepper is unpatentable without empirical synergy data (Combination Index CI < 1.0).',
    whyItMattersHi: 'अदरक और शहद या हल्दी और काली मिर्च का साधारण मिश्रण बिना वैज्ञानिक सिनर्जी डेटा के पेटेंट नहीं हो सकता।',
    statutoryRef: 'Section 3(e), Patents Act 1970',
  },
  'bda-2023': {
    id: 'bda-2023',
    titleEn: 'Biological Diversity Act, 2023 (BDA 2023)',
    titleHi: 'जैविक विविधता (संशोधन) अधिनियम, 2023',
    statute: 'National Biodiversity Legislation',
    badge: 'STATUTORY ACT',
    whatIsItEn: 'India’s paramount legal framework regulating commercial access to biological resources, mandating equitable benefit sharing, and protecting sovereign bio-heritage.',
    whatIsItHi: 'भारतीय जैविक संसाधनों के व्यावसायिक उपयोग को नियंत्रित करने, लाभ-साझाकरण सुनिश्चित करने और जैव-संसाधनों की रक्षा करने वाला प्रमुख भारतीय कानून।',
    whyItMattersEn: 'Section 6 requires mandatory National Biodiversity Authority (NBA) approval before any patent grant based on Indian biological resources.',
    whyItMattersHi: 'धारा 6 के अनुसार भारतीय जैव-संसाधनों पर आधारित पेटेंट प्राप्त करने से पूर्व राष्ट्रीय जैव विविधता प्राधिकरण (NBA) की मंजूरी अनिवार्य है।',
    statutoryRef: 'Act No. 10 of 2023',
  },
  'abs-liability': {
    id: 'abs-liability',
    titleEn: 'ABS (Access and Benefit Sharing)',
    titleHi: 'एबीएस (पहुंच एवं लाभ साझाकरण)',
    statute: 'Biological Diversity Act, 2002 & 2023',
    badge: 'STATUTORY FEE',
    whatIsItEn: 'A statutory fee requiring commercial entities utilizing Indian biological resources to share 0.1% to 0.5% of ex-factory turnover with Biodiversity Management Committees (BMCs).',
    whatIsItHi: 'भारतीय जैव-संसाधनों का व्यावसायिक उपयोग करने वाली कंपनियों द्वारा अपने टर्नओवर का 0.1% से 0.5% स्थानीय जैव विविधता प्रबंधन समितियों के साथ साझा करने का शुल्क।',
    whyItMattersEn: 'Non-payment leads to compliance notices, revocation of commercial rights, and financial penalties.',
    whyItMattersHi: 'भुगतान न करने पर व्यापारिक अनुमति रद्द हो सकती है और भारी वित्तीय जुर्माना लग सकता है।',
    statutoryRef: 'Rule 21(2), BDA 2023',
  },
  'section-7-exemption': {
    id: 'section-7-exemption',
    titleEn: 'Section 7 Codified Practitioner Exemption',
    titleHi: 'धारा 7 वैद्य एवं पारंपरिक चिकित्सक छूट',
    statute: 'Biological Diversity (Amendment) Act, 2023 § 7',
    badge: 'LEGAL EXEMPTION',
    whatIsItEn: 'A statutory exemption under BDA 2023 exempting registered Vaidyas, Hakims, Ayush practitioners, and codified traditional healers from SBB prior intimation and ABS fees.',
    whatIsItHi: 'बीडीए 2023 के तहत पंजीकृत वैद्यों, हकीमों और पारंपरिक चिकित्सकों को राज्य जैव विविधता बोर्ड को पूर्व सूचना देने और एबीएस शुल्क देने से पूर्ण वैधानिक छूट।',
    whyItMattersEn: 'Allows traditional AYUSH clinics and local doctors to prepare and dispense classical remedies without commercial ABS burdens.',
    whyItMattersHi: 'पारंपरिक वैद्यों को बिना किसी सरकारी टैक्स या रॉयल्टी के रोगियों हेतु दवाइयां तैयार करने की स्वतंत्रता देता है।',
    statutoryRef: 'Section 7 Proviso, BDA 2023',
  },
  'nba': {
    id: 'nba',
    titleEn: 'NBA (National Biodiversity Authority)',
    titleHi: 'एनबीए (राष्ट्रीय जैव विविधता प्राधिकरण)',
    statute: 'Ministry of Environment, Forest & Climate Change',
    badge: 'STATUTORY AUTHORITY',
    whatIsItEn: 'The autonomous statutory regulatory body established in Chennai that grants approvals for foreign access to Indian bio-resources and Section 6 patent clearances.',
    whatIsItHi: 'पर्यावरण मंत्रालय के अधीन चेन्नई में स्थित वैधानिक निकाय, जो भारतीय जैव-संसाधनों के विदेशी उपयोग और धारा 6 के तहत पेटेंट मंजूरी प्रदान करता है।',
    whyItMattersEn: 'Applying for an Indian or international patent on bio-resources without prior NBA approval is a cognizable legal violation.',
    whyItMattersHi: 'एनबीए की पूर्व अनुमति के बिना भारतीय जैव-संसाधनों पर पेटेंट आवेदन करना कानूनन अपराध है।',
    statutoryRef: 'Section 8, BDA 2002',
  },
  'ipo': {
    id: 'ipo',
    titleEn: 'IPO (Indian Patent Office)',
    titleHi: 'आईपीओ (भारतीय पेटेंट कार्यालय)',
    statute: 'Controller General of Patents (CGPDTM)',
    badge: 'PATENT AUTHORITY',
    whatIsItEn: 'The government agency under DPIIT, Ministry of Commerce and Industry, responsible for the examination and grant of patents in India.',
    whatIsItHi: 'वाणिज्य एवं उद्योग मंत्रालय के अधीन भारतीय पेटेंट, डिजाइन और ट्रेडमार्क महानियंत्रक कार्यालय, जो पेटेंट की जांच और आवंटन करता है।',
    whyItMattersEn: 'Conducts formal statutory examination under Section 3 and requires NBA clearance before sealing any botanical patent grant.',
    whyItMattersHi: 'पेटेंट आवेदनों की वैधानिक जांच करता है और किसी भी वानस्पतिक पेटेंट को अंतिम मंजूरी देने से पूर्व एनबीए प्रमाण पत्र मांगता है।',
    statutoryRef: 'The Patents Act, 1970',
  },
  'sla': {
    id: 'sla',
    titleEn: 'SLA (State Licensing Authority)',
    titleHi: 'एसएलए (राज्य लाइसेंसिंग प्राधिकरण)',
    statute: 'State AYUSH / Drug Administration',
    badge: 'LICENSING AUTHORITY',
    whatIsItEn: 'The state government regulatory authority responsible for issuing manufacturing licenses (Form 25-D) for Ayurvedic, Siddha, and Unani drugs.',
    whatIsItHi: 'राज्य सरकार का आयुष औषधि नियंत्रण प्राधिकरण, जो आयुर्वेदिक दवाओं के निर्माण और बिक्री हेतु लाइसेंस (फॉर्म 25-D) जारी करता है।',
    whyItMattersEn: 'Determines whether your product requires animal safety data, clinical trials, or First Schedule textual justification.',
    whyItMattersHi: 'यह तय करता है कि आपकी दवा को निर्माण लाइसेंस हेतु क्लिनिकल परीक्षण चाहिए अथवा शास्त्रीय ग्रंथ का प्रमाण।',
    statutoryRef: 'Rule 152, Drugs & Cosmetics Rules',
  },
};

interface StatutoryTooltipProps {
  termId?: string;
  customTitle?: string;
  customContent?: string;
  customStatute?: string;
  position?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const StatutoryTooltip: React.FC<StatutoryTooltipProps> = ({
  termId,
  customTitle,
  customContent,
  customStatute,
  position = 'top',
  align = 'center',
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useAppStore();
  const isHi = language === 'hi';
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const def: GlossaryDefinition | undefined = termId ? STATUTORY_GLOSSARY[termId] : undefined;
  const title = customTitle || (def ? (isHi ? def.titleHi : def.titleEn) : 'Statutory Information');
  const whatIsIt = customContent || (def ? (isHi ? def.whatIsItHi : def.whatIsItEn) : '');
  const whyItMatters = def ? (isHi ? def.whyItMattersHi : def.whyItMattersEn) : '';
  const statute = customStatute || def?.statute;
  const badge = def?.badge || 'LEGAL EXPLAINER';

  const positionClasses = position === 'bottom' 
    ? 'top-full mt-2' 
    : 'bottom-full mb-2';

  const alignClasses = align === 'left'
    ? 'left-0'
    : align === 'right'
    ? 'right-0'
    : 'left-1/2 -translate-x-1/2';

  const arrowClasses = position === 'bottom'
    ? 'bottom-full -mb-[2px] border-x-6 border-x-transparent border-b-6 border-b-[#002147]'
    : 'top-full -mt-[2px] border-x-6 border-x-transparent border-t-6 border-t-[#002147]';

  const arrowAlignClasses = align === 'left'
    ? 'left-4'
    : align === 'right'
    ? 'right-4'
    : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      className={`relative inline-block ${className}`}
    >
      {children}

      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={`absolute z-50 ${positionClasses} ${alignClasses} w-72 sm:w-84 p-3.5 bg-white border-2 border-[#002147] shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 select-none`}
        >
          {/* Top Badge & Statute */}
          <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-[#e5e5e5] text-[10px]">
            <span className="font-bold text-[#002147] bg-[#eef4f9] px-1.5 py-0.5 border border-[#1d70b8]/30 font-mono">
              {badge}
            </span>
            {statute && (
              <span className="text-[#505a5f] font-mono truncate max-w-[150px]" title={statute}>
                {statute}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#1d70b8] flex-shrink-0" />
            <h4 className="text-xs font-bold text-[#002147] leading-tight">
              {title}
            </h4>
          </div>

          {/* What is it? */}
          <div className="mt-1.5 text-[11px] text-[#0b0c0c] leading-relaxed">
            <span className="font-bold text-[#1d70b8]">{isHi ? 'यह क्या है: ' : 'What is it: '}</span>
            <span>{whatIsIt}</span>
          </div>

          {/* Why it matters */}
          {whyItMatters && (
            <div className="mt-1.5 pt-1.5 border-t border-[#f3f2f1] text-[10px] text-[#505a5f] leading-snug">
              <span className="font-bold text-[#00703c]">{isHi ? 'महत्व: ' : 'Why it matters: '}</span>
              <span>{whyItMatters}</span>
            </div>
          )}

          {/* Pointer triangle arrow */}
          <div className={`absolute ${arrowClasses} ${arrowAlignClasses} w-0 h-0`} />
        </div>
      )}
    </div>
  );
};

interface StatutoryHelpIconProps {
  termId: string;
  className?: string;
  label?: string;
}

export const StatutoryHelpIcon: React.FC<StatutoryHelpIconProps> = ({
  termId,
  className = '',
  label,
}) => {
  return (
    <StatutoryTooltip termId={termId} className={className}>
      <button
        type="button"
        tabIndex={0}
        aria-label={label || 'Explain this legal term'}
        className="inline-flex items-center justify-center w-4 h-4 ml-1 rounded-full bg-[#f3f2f1] text-[#1d70b8] border border-[#b1b4b6] hover:bg-[#002147] hover:text-white hover:border-[#002147] text-[10px] font-bold cursor-help transition-all shadow-2xs select-none align-middle"
      >
        ?
      </button>
    </StatutoryTooltip>
  );
};
