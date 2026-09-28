'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  Leaf, 
  FileCheck2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Layers, 
  ExternalLink,
  BookMarked,
  Fingerprint,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getTranslations } from '@/lib/translations';
import { StatutoryTooltip } from '@/components/ui/StatutoryExplainer';

interface ModernOverviewProps {
  onSelectTab: (tab: string) => void;
}

export const ModernOverview: React.FC<ModernOverviewProps> = ({ onSelectTab }) => {
  const { language, savedResponses, setPendingQuery } = useAppStore();
  const t = getTranslations(language);
  const isHi = language === 'hi';

  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    setPendingQuery(quickQuery.trim());
    onSelectTab('copilot');
  };

  const clearanceSteps = [
    {
      step: '01',
      id: 'wizard',
      title: isHi ? 'फॉर्मूलेशन ट्राइएज' : 'Formulation Triage',
      statute: 'D&C Act 1940 & Rule 158-B',
      desc: isHi 
        ? 'शास्त्रीय जेनेरिक, P&P, अथवा फाइटोफार्मास्युटिकल में 3 त्वरित प्रश्नों में वर्गीकरण।'
        : 'Classify into Classical Generic, P&P, or Phytopharmaceutical in 3 quick statutory questions.',
      tag: isHi ? 'अनुपालन वर्गीकरण' : 'Regulatory Classification',
      tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-900',
      borderHover: 'hover:border-slate-300 hover:shadow-sm',
      arrowColor: 'text-slate-700 group-hover:text-slate-950',
      icon: Layers,
      termId: 'step-1-formulation',
      metric: isHi ? '6 वैधानिक श्रेणियां' : '6 Legal Categories',
      href: '/?tab=wizard'
    },
    {
      step: '02',
      id: 'prior-art',
      title: isHi ? 'सीएसआईआर-टीकेडीएल जांच' : 'CSIR-TKDL Screen',
      statute: 'Patents Act 1970 § 3(p) & 3(e)',
      desc: isHi
        ? 'शास्त्रीय आयुर्वेदिक ग्रंथों के विरुद्ध सामग्री की जांच और सहक्रियात्मक प्रभाव का विश्लेषण।'
        : 'Screen botanical ingredients against codified traditional knowledge in the TKDL and evaluate synergistic non-obviousness.',
      tag: isHi ? 'पेटेंट योग्यता जांच' : 'Patentability Screen',
      tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-900',
      borderHover: 'hover:border-slate-300 hover:shadow-sm',
      arrowColor: 'text-slate-700 group-hover:text-slate-950',
      icon: BookOpen,
      termId: 'step-2-tkdl',
      metric: isHi ? 'पारंपरिक ज्ञान जांच' : 'Prior-Art Clearance',
      href: '/?tab=prior-art'
    },
    {
      step: '03',
      id: 'abs',
      title: isHi ? 'बीडीए 2023 रॉयल्टी' : 'BDA 2023 ABS Royalty',
      statute: 'Biological Diversity Act 2023 § 7 & 19',
      desc: isHi
        ? 'भारतीय और विदेशी संस्थाओं के लिए सटीक राज्य जैव-विविधता बोर्ड (SBB) रॉयल्टी स्लैब की गणना।'
        : 'Compute exact tiered Access & Benefit Sharing (ABS) commercial royalties for Indian & foreign entities.',
      tag: isHi ? 'रॉयल्टी कैलकुलेटर' : 'ABS Calculator',
      tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-900',
      borderHover: 'hover:border-slate-300 hover:shadow-sm',
      arrowColor: 'text-slate-700 group-hover:text-slate-950',
      icon: Leaf,
      termId: 'step-3-abs',
      metric: isHi ? '0.1% - 0.5% स्लैब' : '0.1% - 0.5% Slabs',
      href: '/?tab=abs'
    },
    {
      step: '04',
      id: 'dossier',
      title: isHi ? 'वैधानिक डोजियर' : 'Statutory Dossier',
      statute: 'Patent Office & NBA Filings',
      desc: isHi
        ? 'पेटेंट नियंत्रक एवं एनबीए अनुमोदन के लिए प्रमाणिक कानूनी संदर्भों सहित संपूर्ण ऑडिट रिपोर्ट।'
        : 'Comprehensive compliance dossier with verified statutory references ready for Form 1/2/3 filings.',
      tag: isHi ? 'ऑडिट-रेडी रिपोर्ट' : 'Audit Ready Report',
      tagColor: 'bg-slate-100 text-slate-700 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-900',
      borderHover: 'hover:border-slate-300 hover:shadow-sm',
      arrowColor: 'text-slate-700 group-hover:text-slate-950',
      icon: FileCheck2,
      termId: 'step-4-dossier',
      metric: isHi ? 'पीडीएफ / प्रिंट तैयार' : 'PDF / Print Ready',
      href: '/?tab=dossier'
    },
  ];

  const precedentCases = [
    {
      title: isHi ? 'हल्दी घाव-रोपण पेटेंट निरस्तीकरण' : 'Turmeric (Curcuma longa) Revocation',
      jurisdiction: 'USPTO Patent #5,401,504',
      result: isHi ? 'सफलतापूर्वक रद्द (धारा 3(p) बाधा)' : 'Revoked (§3(p) Statutory Bar)',
      summary: isHi 
        ? 'सीएसआईआर ने 18वीं सदी के संस्कृत ग्रंथों के प्रमाण पेश कर मिसिसिपी विश्वविद्यालय के पेटेंट को निरस्त करवाया।'
        : 'CSIR cited 18th-century Sanskrit classical treatises to revoke University of Mississippi’s claimed wound-healing patent.',
      termId: 'section-3p',
      accentBorder: 'border border-slate-200/90 border-l-4 border-l-red-400 bg-red-50/20 hover:bg-red-50/40',
      tagBadge: 'bg-red-50 text-red-700 border-red-200 font-semibold text-[10px]'
    },
    {
      title: isHi ? 'नीम कवकनाशी पेटेंट रद्द' : 'Neem (Azadirachta indica) Revocation',
      jurisdiction: 'EPO Patent #0436257',
      result: isHi ? '10-वर्षीय कानूनी संघर्ष के बाद निरस्त' : 'Revoked after 10-Yr European Legal Battle',
      summary: isHi
        ? 'यूरोपीय पेटेंट कार्यालय ने डब्ल्यू.आर. ग्रेस के कीटनाशक दावे को भारतीय पारंपरिक ज्ञान के आधार पर रद्द किया।'
        : 'The European Patent Office revoked W.R. Grace’s antifungal neem patent based on unadulterated Indian traditional prior art.',
      termId: 'csir-tkdl',
      accentBorder: 'border border-slate-200/90 border-l-4 border-l-red-400 bg-red-50/20 hover:bg-red-50/40',
      tagBadge: 'bg-red-50 text-red-700 border-red-200 font-semibold text-[10px]'
    },
    {
      title: isHi ? 'अश्वगंधा बहु-वानस्पतिक सहक्रिया' : 'Ashwagandha Synergistic Formulations',
      jurisdiction: 'Indian Patent Office Practice § 3(e)',
      result: isHi ? 'सहक्रियात्मक प्रभाव स्वीकृत' : 'Synergy Approved (Patentable)',
      summary: isHi
        ? 'धारा 3(e) के तहत सांख्यिकीय तालमेल (Combination Index CI < 1.0) साबित होने पर पेटेंट मंजूरी संभव है।'
        : 'Demonstrable non-additive statistical synergy indices (CI < 1.0) successfully clear Section 3(e) hurdles.',
      termId: 'section-3e',
      accentBorder: 'border border-slate-200/90 border-l-4 border-l-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/40',
      tagBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[10px]'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Hero Command Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-md p-6 sm:p-10 lg:p-12">
        {/* Multi-tonal ambient glow elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-br from-indigo-100/60 via-violet-100/40 to-sky-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-80 h-80 bg-gradient-to-tr from-emerald-100/40 via-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Badge Tag with Tooltip */}
          <StatutoryTooltip termId="workflow-steps">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-slate-100 text-xs font-bold tracking-wide shadow-xs cursor-help">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {isHi ? 'वैधानिक जैव-संसाधन आसूचना मंच' : 'STATUTORY BIO-RESOURCE CLEARANCE & PATENT INTELLIGENCE'}
              </span>
            </div>
          </StatutoryTooltip>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] font-display">
              {isHi ? (
                <>आयुर्वेदिक एवं वानस्पतिक नवाचारों के लिए <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-violet-600 to-emerald-600">वैधानिक मंजूरी मंच</span></>
              ) : (
                <>Statutory Clearance & Legal AI for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-violet-600 to-emerald-600">Botanical & Ayurvedic Innovations</span></>
              )}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl">
              {isHi ? (
                'सीएसआईआर-टीकेडीएल के शास्त्रीय ग्रंथों, पेटेंट्स एक्ट 1970 की धारा 3(p)/3(e) एवं जैविक विविधता अधिनियम 2023 के तहत सत्यापित विधिक साक्ष्य एवं वैधानिक ग्राउंडिंग पर आधारित परामर्श।'
              ) : (
                'Screen formulations against codified classical texts in the CSIR-TKDL, navigate Section 3(p) & 3(e) patentability barriers, and calculate exact BDA 2023 ABS royalties before filing.'
              )}
            </p>
          </div>

          {/* Quick Assessment Launchpad */}
          <div className="pt-2 max-w-2xl">
            <form onSubmit={handleQuickSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder={isHi 
                  ? "वानस्पतिक घटक या फॉर्मूलेशन दर्ज करें (उदा. Curcuma longa + Piper nigrum)..." 
                  : "Enter botanical ingredients or formulation (e.g. Curcuma longa + Piper nigrum for bioavailability)..."
                }
                className="w-full pl-12 pr-36 py-3.5 rounded-2xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{isHi ? 'जांच शुरू करें' : 'Verify Clearance'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[11px] text-slate-500 mt-2.5 pl-2 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-600">{isHi ? 'लोकप्रिय नमूने:' : 'Try popular queries:'}</span>
              <button 
                type="button"
                onClick={() => {
                  setPendingQuery('Ashwagandha + Brahmi synergistic cognitive formulation');
                  onSelectTab('copilot');
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer font-medium shadow-2xs"
              >
                Ashwagandha + Brahmi
              </button>
              <button 
                type="button"
                onClick={() => {
                  setPendingQuery('Form-III BDA approval for foreign patent filing');
                  onSelectTab('copilot');
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer font-medium shadow-2xs"
              >
                BDA Form-III
              </button>
              <button 
                type="button"
                onClick={() => {
                  setPendingQuery('Phytopharmaceutical drug Rule 122-E requirements');
                  onSelectTab('copilot');
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer font-medium shadow-2xs"
              >
                Phyto Rule 122-E
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive 4-Step Statutory Clearance Pipeline */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                {isHi ? '4-चरणीय वैधानिक मंजूरी कार्यप्रवाह' : '4-Step Statutory Clearance Pipeline'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isHi 
                ? 'प्रत्येक चरण पर माउस ले जाकर समझें कि वह आपके पेटेंट या उत्पाद के लिए क्यों आवश्यक है।'
                : 'Hover over any step to see its legal significance, statutory authority, and patent impact.'
              }
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/?tab=copilot"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-300" />
              <span>{isHi ? 'एआई कोपायलट से परामर्श' : 'Ask AI Copilot'}</span>
            </Link>
          </div>
        </div>

        {/* The 4 Pipeline Cards with distinct multi-color identities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clearanceSteps.map((step) => {
            const Icon = step.icon;
            return (
              <StatutoryTooltip key={step.id} termId={step.termId}>
                <div 
                  onClick={() => onSelectTab(step.id)}
                  className={`group h-full p-5 rounded-3xl bg-white border border-slate-200/90 ${step.borderHover} hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden`}
                >
                  <div className="space-y-3">
                    {/* Step badge + Icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                        STEP {step.step}
                      </span>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${step.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Step Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950 transition-colors flex items-center gap-1.5">
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {step.statute}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {step.desc}
                    </p>
                  </div>

                  {/* Card Footer Tag & Action */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${step.tagColor}`}>
                      {step.metric}
                    </span>
                    <span className={`text-xs font-bold ${step.arrowColor} group-hover:translate-x-1 transition-transform flex items-center gap-1`}>
                      <span>{isHi ? 'खोलें' : 'Launch'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </StatutoryTooltip>
            );
          })}
        </div>
      </section>

      {/* 3. Dual Section: Statutory Precedents & Legal Terms Glossary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Landmark Traditional Knowledge Revocations (2 Cols) */}
        <section className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {isHi ? 'ऐतिहासिक पारंपरिक ज्ञान बचाव मिसालें' : 'Landmark Traditional Knowledge Precedents'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi 
                    ? 'सीएसआईआर-टीकेडीएल द्वारा अंतरराष्ट्रीय पेटेंट कार्यालयों में सफल कानूनी बचाव' 
                    : 'Historical CSIR-TKDL defensive legal revocations across USPTO, EPO & IPO'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {precedentCases.map((pc, idx) => (
              <StatutoryTooltip key={idx} termId={pc.termId}>
                <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${pc.accentBorder}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                    <span className="font-bold text-sm text-slate-900">
                      {pc.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        {pc.jurisdiction}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pc.tagBadge}`}>
                        {pc.result}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pc.summary}
                  </p>
                </div>
              </StatutoryTooltip>
            ))}
          </div>
        </section>

        {/* Right Column: Key Statutory Clauses Explainer Quick Reference */}
        <section className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {isHi ? 'प्रमुख वैधानिक धाराएं' : 'Statutory Reference Strip'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">HOVER TO INSPECT</span>
            </div>

            <p className="text-xs text-slate-600">
              {isHi 
                ? 'किसी भी कानूनी धारा पर माउस ले जाकर उसकी संपूर्ण परिभाषा एवं प्रभाव देखें।' 
                : 'Hover over any statutory citation below to inspect why it applies to your case.'
              }
            </p>

            <div className="space-y-2 pt-1">
              {[
                { termId: 'section-3p', label: 'Section 3(p)', title: 'Traditional Knowledge Bar' },
                { termId: 'section-3e', label: 'Section 3(e)', title: 'Mere Admixture Bar' },
                { termId: 'section-3d', label: 'Section 3(d)', title: 'Enhanced Efficacy Threshold' },
                { termId: 'bda-2023', label: 'BDA 2023 §6', title: 'Mandatory Prior NBA Clearance' },
                { termId: 'rule-158b', label: 'Rule 158-B', title: 'ASU Manufacturing Licensing' },
                { termId: 'rule-122e', label: 'Rule 122-E', title: 'Phytopharmaceutical Drug Regime' },
              ].map((item) => (
                <StatutoryTooltip key={item.termId} termId={item.termId}>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800 flex items-center justify-between transition-colors cursor-pointer group shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {item.label}
                      </span>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </StatutoryTooltip>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/?tab=history"
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <BookMarked className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {isHi ? 'सहेजे गए उद्धरण वॉल्ट देखें' : 'View Saved Citations Vault'}
                {' '}({savedResponses.length})
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
