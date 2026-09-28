'use client';

import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Search, 
  Calculator, 
  Sparkles, 
  ShieldCheck, 
  Bot,
  Scale
} from 'lucide-react';
import { ActiveWorkspaceTab } from '@/app/page';
import { useAppStore } from '@/lib/store';
import { StatutoryTooltip, StatutoryHelpIcon } from '@/components/ui/StatutoryExplainer';

interface GdsStartPageProps {
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
}

export const GdsStartPage: React.FC<GdsStartPageProps> = ({ onSelectTab }) => {
  const { classificationState, priorArtAnalysis, absCalculation, language } = useAppStore();
  const isHi = language === 'hi';

  return (
    <div className="w-full space-y-10">
      {/* 1. Main Service Purpose & Value Proposition (GOV.UK Start Page Pattern) */}
      <div className="bg-white border border-[#b1b4b6] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-3 max-w-3xl">
          <span className="gds-tag gds-tag-blue font-bold">
            {isHi ? 'वैधानिक पेटेंट आसूचना मंच' : 'STATUTORY PATENT INTELLIGENCE'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0b0c0c] tracking-tight">
            {isHi 
              ? 'वानस्पतिक व हर्बल नवाचारों की पेटेंट एवं वाणिज्यिक मंजूरी'
              : 'Clear Botanical Innovations for Patenting & Commercialization'}
          </h2>
          <p className="text-base sm:text-lg text-[#505a5f] leading-relaxed">
            {isHi ? (
              <>
                भारतीय वानस्पतिक पेटेंट आवेदनों में से <strong>76% से अधिक आवेदन</strong> धारा <strong>3(p)</strong><StatutoryHelpIcon termId="section-3p" /> (पारंपरिक ज्ञान) या <strong>3(e)</strong><StatutoryHelpIcon termId="section-3e" /> (साधारण मिश्रण) के तहत खारिज या निरस्त हो जाते हैं, क्योंकि आवेदक बिना सीएसआईआर-टीकेडीएल<StatutoryHelpIcon termId="csir-tkdl" /> जांच या जैव विविधता अधिनियम BDA 2023<StatutoryHelpIcon termId="bda-2023" /> मंजूरी के फाइल करते हैं।
              </>
            ) : (
              <>
                Over <strong>76% of Indian botanical patent applications</strong> face critical rejection or revocation under <strong>Section 3(p)</strong><StatutoryHelpIcon termId="section-3p" /> (Traditional Knowledge) or <strong>Section 3(e)</strong><StatutoryHelpIcon termId="section-3e" /> (Mere Admixture) because applicants file without checking CSIR-TKDL<StatutoryHelpIcon termId="csir-tkdl" /> citations or securing prior Biodiversity Act (BDA 2023)<StatutoryHelpIcon termId="bda-2023" /> clearance.
              </>
            )}
          </p>
        </div>

        {/* GOV.UK Inset Warning / Notice Box */}
        <div className="gds-inset-text">
          <p className="font-bold text-[#0b0c0c] mb-1">
            {isHi ? 'इस उद्यम मंच का मुख्य उद्देश्य:' : 'Why this enterprise platform was built:'}
          </p>
          <p className="text-[#505a5f] text-sm leading-relaxed">
            {isHi ? (
              <>
                आईपी-शक्ति सहायक दवा कंपनियों, जैव प्रौद्योगिकी प्रयोगशालाओं और पेटेंट वकीलों के लिए प्री-फाइलिंग कानूनी ट्राइएज को स्वचालित करता है। 3 मिनट से भी कम समय में यह <strong>500,000+ सीएसआईआर-टीकेडीएल<StatutoryHelpIcon termId="csir-tkdl" /> अभिलेखों</strong> के विरुद्ध घटकों का विश्लेषण करता है, धारा 3(p)/(e)/(d) की बाधाओं की जांच करता है, और <strong>BDA 2023 एक्सेस एवं बेनिफिट शेयरिंग (ABS)<StatutoryHelpIcon termId="abs-liability" /> रॉयल्टी</strong> की गणना करता है।
              </>
            ) : (
              <>
                IP-SAKTI Sahayak automates pre-filing legal triage for pharmaceutical companies, biotech laboratories, and patent attorneys. In under 3 minutes, it analyzes botanical ingredients against <strong>500,000+ CSIR-TKDL<StatutoryHelpIcon termId="csir-tkdl" /> records</strong>, checks statutory Section 3(p)/(e)/(d) barriers, computes <strong>BDA 2023 Access &amp; Benefit Sharing (ABS)<StatutoryHelpIcon termId="abs-liability" /> fees</strong>, and generates audit-ready statutory compliance dossiers.
              </>
            )}
          </p>
        </div>

        {/* Primary CTA (Iconic GOV.UK Green Start Button) */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => onSelectTab('wizard')}
            className="gds-btn-start"
          >
            <span>{isHi ? 'वैधानिक ट्राइएज मूल्यांकन प्रारंभ करें' : 'Start Statutory Triage Assessment'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('copilot')}
            className="gds-btn-secondary"
          >
            <Bot className="w-4 h-4 text-[#1d70b8]" />
            <span>{isHi ? 'कानूनी AI सहायक से परामर्श लें' : 'Consult Legal AI Copilot'}</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Task List (Signature GOV.UK Service Workflow) */}
      <div className="space-y-4">
        <div className="border-b-2 border-[#0b0c0c] pb-2">
          <div className="flex items-center gap-2">
            <StatutoryTooltip termId="workflow-steps" position="top" align="left">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0b0c0c] hover:text-[#1d70b8] cursor-help transition-colors">
                {isHi ? 'वैधानिक मंजूरी कार्यप्रवाह' : 'Statutory Clearance Workflow'}
              </h3>
            </StatutoryTooltip>
            <StatutoryHelpIcon termId="workflow-steps" />
          </div>
          <p className="text-xs sm:text-sm text-[#505a5f] mt-1 leading-relaxed">
            {isHi ? (
              <>
                भारतीय पेटेंट कार्यालय (IPO)<StatutoryHelpIcon termId="ipo" /> अथवा राज्य लाइसेंसिंग प्राधिकरण (SLA)<StatutoryHelpIcon termId="sla" /> के समक्ष आवेदन करने से पूर्व 4-चरणीय वैधानिक मंजूरी प्रक्रिया पूर्ण करें।
              </>
            ) : (
              <>
                Complete the 4-step statutory clearance process before filing with the Indian Patent Office (IPO)<StatutoryHelpIcon termId="ipo" /> or State Licensing Authority (SLA)<StatutoryHelpIcon termId="sla" />.
              </>
            )}
          </p>
        </div>

        <ol className="space-y-3">
          {/* Step 1: Formulation Classification */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatutoryTooltip termId="step-1-formulation" position="top" align="left">
                  <span className="font-bold text-[#0b0c0c] text-sm sm:text-base hover:text-[#1d70b8] cursor-help transition-colors">
                    {isHi ? '1. फॉर्मूलेशन वर्गीकरण एवं नियामक मार्ग' : '1. Formulation Classification & Regulatory Pathway'}
                  </span>
                </StatutoryTooltip>
                <StatutoryHelpIcon termId="step-1-formulation" />
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f] leading-relaxed">
                {isHi ? (
                  <>
                    रेसिपी का 6 कानूनी श्रेणियों में वर्गीकरण: शास्त्रीय जेनेरिक<StatutoryHelpIcon termId="classical-generic" />, पेटेंट या प्रोप्राइटरी (P&P)<StatutoryHelpIcon termId="patent-proprietary" />, फाइटोफार्मास्युटिकल (नियम 122-E)<StatutoryHelpIcon termId="phytopharmaceutical" /> अथवा आहार।
                  </>
                ) : (
                  <>
                    Diagnose recipe into 1 of 6 legal buckets: Classical Generic<StatutoryHelpIcon termId="classical-generic" />, Patent or Proprietary (P&P)<StatutoryHelpIcon termId="patent-proprietary" />, Phytopharmaceutical (Rule 122-E)<StatutoryHelpIcon termId="phytopharmaceutical" />, or Food.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {classificationState ? (
                <span className="gds-tag gds-tag-green">{isHi ? 'पूर्ण' : 'COMPLETED'}</span>
              ) : (
                <span className="gds-tag gds-tag-yellow">{isHi ? 'अप्रांरभिक' : 'NOT STARTED'}</span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('wizard')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {classificationState ? (isHi ? 'देखें / बदलें' : 'View / Change') : (isHi ? 'शुरू करें' : 'Start')}
              </button>
            </div>
          </li>

          {/* Step 2: TKDL & Section 3(p) Prior-Art Screen */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatutoryTooltip termId="step-2-tkdl" position="top" align="left">
                  <span className="font-bold text-[#0b0c0c] text-sm sm:text-base hover:text-[#1d70b8] cursor-help transition-colors">
                    {isHi ? '2. सीएसआईआर-टीकेडीएल एवं धारा 3(p) पूर्व-कला जांच' : '2. CSIR-TKDL & Section 3(p) Prior-Art Risk Analyzer'}
                  </span>
                </StatutoryTooltip>
                <StatutoryHelpIcon termId="step-2-tkdl" />
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f] leading-relaxed">
                {isHi ? (
                  <>
                    शास्त्रीय ग्रंथों (चरक, सुश्रुत संहिता) के विरुद्ध CSIR-TKDL<StatutoryHelpIcon termId="csir-tkdl" /> जांच, धारा 3(p)<StatutoryHelpIcon termId="section-3p" /> जोखिम, और धारा 3(e) सहक्रियात्मक प्रभाव (Synergy)<StatutoryHelpIcon termId="section-3e" /> बाधाओं का मूल्यांकन।
                  </>
                ) : (
                  <>
                    Screen individual herbs against classical texts (Charaka, Sushruta Samhita) in CSIR-TKDL<StatutoryHelpIcon termId="csir-tkdl" />, evaluate Section 3(p)<StatutoryHelpIcon termId="section-3p" /> bars, and Section 3(e) synergistic efficacy hurdles<StatutoryHelpIcon termId="section-3e" />.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {priorArtAnalysis ? (
                <span className={`gds-tag ${priorArtAnalysis.patentability_risk_score >= 80 ? 'gds-tag-red' : 'gds-tag-green'}`}>
                  {isHi ? 'जोखिम:' : 'RISK:'} {priorArtAnalysis.patentability_risk_score}%
                </span>
              ) : (
                <span className="gds-tag gds-tag-grey">{isHi ? 'प्रतीक्षित' : 'PENDING'}</span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('prior-art')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {priorArtAnalysis ? (isHi ? 'रिपोर्ट देखें' : 'View Report') : (isHi ? 'विश्लेषण करें' : 'Analyze')}
              </button>
            </div>
          </li>

          {/* Step 3: Biological Diversity Act (BDA 2023) Assessment */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatutoryTooltip termId="step-3-abs" position="top" align="left">
                  <span className="font-bold text-[#0b0c0c] text-sm sm:text-base hover:text-[#1d70b8] cursor-help transition-colors">
                    {isHi ? '3. जैविक विविधता अधिनियम (BDA 2023) ABS देयता' : '3. Biological Diversity Act (BDA 2023) ABS Liability'}
                  </span>
                </StatutoryTooltip>
                <StatutoryHelpIcon termId="step-3-abs" />
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f] leading-relaxed">
                {isHi ? (
                  <>
                    जैविक विविधता अधिनियम BDA 2023<StatutoryHelpIcon termId="bda-2023" /> के तहत वाणिज्यिक ABS लाभ-साझाकरण शुल्क<StatutoryHelpIcon termId="abs-liability" /> (टर्नओवर का 0.1% से 0.5%) की गणना अथवा धारा 7 वैद्य छूट<StatutoryHelpIcon termId="section-7-exemption" /> का सत्यापन।
                  </>
                ) : (
                  <>
                    Calculate commercial ABS benefit-sharing fees<StatutoryHelpIcon termId="abs-liability" /> (0.1% to 0.5% turnover) under Biological Diversity Act (BDA 2023)<StatutoryHelpIcon termId="bda-2023" /> or verify Section 7 codified practitioner exemptions<StatutoryHelpIcon termId="section-7-exemption" />.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              {absCalculation ? (
                <span className="gds-tag gds-tag-green">{isHi ? 'गणना पूर्ण' : 'CALCULATED'}</span>
              ) : (
                <span className="gds-tag gds-tag-grey">{isHi ? 'प्रतीक्षित' : 'PENDING'}</span>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('abs')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {absCalculation ? (isHi ? 'पुनः गणना' : 'Recalculate') : (isHi ? 'गणना करें' : 'Compute')}
              </button>
            </div>
          </li>

          {/* Step 4: Statutory Compliance Dossier */}
          <li className="bg-white border border-[#b1b4b6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0b0c0c] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <StatutoryTooltip termId="step-4-dossier" position="top" align="left">
                  <span className="font-bold text-[#0b0c0c] text-sm sm:text-base hover:text-[#1d70b8] cursor-help transition-colors">
                    {isHi ? '4. वैधानिक अनुपालन डोजियर एवं निर्यात' : '4. Statutory Compliance Dossier & Export'}
                  </span>
                </StatutoryTooltip>
                <StatutoryHelpIcon termId="step-4-dossier" />
              </div>
              <p className="text-xs sm:text-sm text-[#505a5f] leading-relaxed">
                {isHi ? (
                  <>
                    पेटेंट परीक्षकों (IPO)<StatutoryHelpIcon termId="ipo" />, राष्ट्रीय जैव विविधता प्राधिकरण (NBA)<StatutoryHelpIcon termId="nba" /> और राज्य लाइसेंसिंग प्राधिकरण (SLA)<StatutoryHelpIcon termId="sla" /> के समक्ष प्रस्तुति हेतु सत्यापित डिजिटल ऑडिट डोजियर।
                  </>
                ) : (
                  <>
                    Download official, verified statutory audit dossier in PDF format for submission to patent examiners (IPO)<StatutoryHelpIcon termId="ipo" />, NBA<StatutoryHelpIcon termId="nba" />, and state regulators (SLA)<StatutoryHelpIcon termId="sla" />.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
              <span className="gds-tag gds-tag-blue">{isHi ? 'ऑडिट तैयार' : 'AUDIT READY'}</span>
              <button
                type="button"
                onClick={() => onSelectTab('dossier')}
                className="text-xs font-bold text-[#1d70b8] hover:underline"
              >
                {isHi ? 'डोजियर खोलें' : 'Export PDF'}
              </button>
            </div>
          </li>
        </ol>
      </div>

      {/* 3. Commercial Impact Cards */}
      <div className="space-y-4 pt-4">
        <div className="border-b border-[#b1b4b6] pb-2">
          <h3 className="text-lg sm:text-xl font-bold text-[#0b0c0c]">
            {isHi ? 'वाणिज्यिक प्रभाव एवं कानूनी सुरक्षा' : 'Commercial Impact & Risk Mitigation'}
          </h3>
          <p className="text-xs sm:text-sm text-[#505a5f]">
            {isHi 
              ? 'फार्मास्यूटिकल निर्माताओं, जैव-प्रौद्योगिकी नवप्रवर्तकों और पेटेंट वकीलों को प्रदत्त सटीक मूल्य।'
              : 'Quantifiable value delivered to pharmaceutical manufacturers, biotech innovators, and patent counsels.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#b1b4b6] p-5 space-y-2">
            <span className="gds-tag gds-tag-red">{isHi ? 'लागत बचत' : 'Cost Avoidance'}</span>
            <h4 className="text-base font-bold text-[#0b0c0c]">
              {isHi ? 'धारा 3(p) अस्वीकृति से बचाव' : 'Prevent Section 3(p) Rejections'}
            </h4>
            <p className="text-xs text-[#505a5f] leading-relaxed">
              {isHi 
                ? 'अस्वीकृत होने वाले पेटेंट को दाखिल करने पर ₹1,50,000 से ₹5,00,000 तक का अपव्यय होता है। पूर्व-स्क्रीनिंग से इस व्यर्थ खर्चे की शत-प्रतिशत बचत होती है।'
                : 'Filing a barred polyherbal patent costs an enterprise ₹1,50,000 to ₹5,00,000 in official IPO fees, examination responses, and attorney hearings. Pre-screening saves 100% of this wasted expenditure.'}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#b1b4b6] p-5 space-y-2">
            <span className="gds-tag gds-tag-green">{isHi ? 'त्वरित बाजार प्रवेश' : 'Time to Market'}</span>
            <h4 className="text-base font-bold text-[#0b0c0c]">
              {isHi ? 'सीडीएससीओ नियम 122-E गति' : 'Fast-Track CDSCO Rule 122-E'}
            </h4>
            <p className="text-xs text-[#505a5f] leading-relaxed">
              {isHi 
                ? 'तुरंत पहचानें कि क्या परिष्कृत वानस्पतिक अर्क ≥4 बायो-एक्टिव मार्करों के साथ फाइटोफार्मास्युटिकल मार्ग के लिए अर्हता प्राप्त करता है।'
                : 'Instantly identify whether a purified botanical extract qualifies for the Phytopharmaceutical pathway with ≥4 bioactive markers, accelerating clinical trial authorization by 6–12 months.'}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#b1b4b6] p-5 space-y-2">
            <span className="gds-tag gds-tag-blue">{isHi ? 'नियामक संरक्षण' : 'Regulatory Immunity'}</span>
            <h4 className="text-base font-bold text-[#0b0c0c]">
              {isHi ? 'BDA 2023 जुर्माना सुरक्षा' : 'BDA 2023 Penalty Shield'}
            </h4>
            <p className="text-xs text-[#505a5f] leading-relaxed">
              {isHi 
                ? 'राष्ट्रीय जैव विविधता प्राधिकरण (NBA) अनुमोदन और एसबीबी पूर्व-सूचना के माध्यम से गैर-अनुपालन एवं विधिक दंडों से पूर्ण सुरक्षा सुनिश्चित करें।'
                : 'Ensure complete legal compliance with National Biodiversity Authority Form III approval to eliminate penalties and revocation risks.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
