'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calculator, Leaf, Info, Printer, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { printLegalDocument } from '@/lib/printUtils';

export const ABSCalculator: React.FC = () => {
  const { setAbsCalculation, language } = useAppStore();
  const isHi = language === 'hi';

  const [turnover, setTurnover] = useState<number>(25000000); // 2.5 Crore default
  const [entityType, setEntityType] = useState<'INDIAN_AYUSH' | 'INDIAN_COMMERCIAL' | 'FOREIGN'>('INDIAN_COMMERCIAL');
  const [isCultivated, setIsCultivated] = useState<boolean>(false);

  // NBA Benefit Sharing Regulations calculation
  const calculateABS = () => {
    if (entityType === 'INDIAN_AYUSH') {
      return {
        rate: '0% (Statutory Exemption)',
        amount: 0,
        status: 'EXEMPT under BDA (Amendment) Act 2023 § 7',
        description: 'Codified traditional knowledge practitioners and registered Vaidyas/healers are exempt from prior SBB intimation and ABS fee sharing under Section 7.',
      };
    }

    if (isCultivated) {
      return {
        rate: '0% (Cultivated Bio-resource Exemption)',
        amount: 0,
        status: 'EXEMPT from ABS Fee under 2023 Amendments',
        description: 'Cultivated medicinal plants with authentic cultivation certificates are exempt from ABS benefit-sharing levies.',
      };
    }

    // Commercial turnover slabs under NBA regulations:
    let rate = 0;
    let rateStr = '';

    if (turnover <= 10000000) {
      rate = 0.001;
      rateStr = '0.1%';
    } else if (turnover <= 30000000) {
      rate = 0.002;
      rateStr = '0.2%';
    } else {
      rate = 0.005;
      rateStr = '0.5%';
    }

    const calculatedAmount = turnover * rate;

    return {
      rate: rateStr,
      amount: calculatedAmount,
      status: entityType === 'FOREIGN' 
        ? 'Mandatory National Biodiversity Authority (NBA) Approval (§6)' 
        : 'Mandatory State Biodiversity Board (SBB) Intimation',
      description: `Subject to ${rateStr} benefit sharing on ex-factory annual commercial sales of biological resources.`,
    };
  };

  const result = calculateABS();

  // Keep global store synchronized so Step 4 (Statutory Dossier) has accurate data
  useEffect(() => {
    setAbsCalculation({
      entityType: entityType,
      annualTurnover: turnover,
      rawMaterialPurchaseValue: turnover * 0.15,
      isRegisteredPractitioner: entityType === 'INDIAN_AYUSH',
      calculatedFee: result.amount,
      calculationMethod: isCultivated ? 'Cultivated Plant Exemption' : 'Tiered Commercial Turnover Slab',
      statutoryRateDescription: result.rate,
      status: result.status,
      exemptionNotes: result.description,
    });
  }, [turnover, entityType, isCultivated, result.amount, result.rate, result.status, result.description, setAbsCalculation]);

  const handlePrintABS = () => {
    const entityLabel = entityType === 'INDIAN_AYUSH'
      ? 'Registered Ayurvedic Practitioner / Healer'
      : entityType === 'FOREIGN'
      ? 'Foreign Entity / NRI / Foreign Controlled'
      : 'Indian Commercial Manufacturer';

    const provenanceLabel = isCultivated
      ? 'Certified Cultivated Medicinal Plant (Exempt)'
      : 'Wild Harvested Bio-Resource (Subject to ABS)';

    const markdown = `
### Biological Diversity Act (BDA 2023) Assessment
**Applicant Entity Category:** ${entityLabel}  
**Annual Ex-Factory Commercial Turnover:** ₹ ${turnover.toLocaleString('en-IN')} (${(turnover / 10000000).toFixed(2)} Crore)  
**Bio-Resource Source:** ${provenanceLabel}

---

### Statutory Liability & Determination

| Dimension | Finding & Requirement |
| :--- | :--- |
| **Statutory Benefit-Sharing Rate** | **${result.rate}** |
| **Estimated Annual ABS Liability** | **₹ ${result.amount.toLocaleString('en-IN')}** |
| **Statutory Posture / Status** | ${result.status} |
| **Regulatory Advisory** | ${result.description} |

---

### Governing Statutory Provisions
1. **The Biological Diversity (Amendment) Act, 2023:** Sections 3, 6, 7 & 19.
2. **Access and Benefit Sharing Regulations:** Commercial brackets of 0.1% (up to ₹1 Cr), 0.2% (₹1–3 Cr), and 0.5% (above ₹3 Cr).
3. **Section 7 Exemptions:** Codified traditional knowledge practitioners and AYUSH Vaidyas/Hakims are completely exempt from prior SBB intimation and benefit-sharing fees.
`;

    printLegalDocument({
      title: 'BDA 2023 Access & Benefit Sharing (ABS) Assessment',
      subtitle: 'Official Statutory Royalty Calculation & Exemption Verification Audit',
      jurisdiction: 'IN',
      language: isHi ? 'hi' : 'en',
      sections: [
        {
          heading: 'Access & Benefit Sharing (ABS) Determination',
          subheading: `Turnover: ₹ ${(turnover / 10000000).toFixed(2)} Cr | Rate: ${result.rate}`,
          bodyMarkdown: markdown,
        }
      ]
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 space-y-6">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <Calculator className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                {isHi ? 'एनबीए / एसबीबी लाभ-साझाकरण (ABS) कैलकुलेटर' : 'NBA / SBB Access & Benefit Sharing (ABS) Calculator'}
              </h2>
              <p className="text-xs text-slate-500">
                {isHi 
                  ? 'जैविक विविधता (संशोधन) अधिनियम, 2023 के तहत वैधानिक देयता की गणना' 
                  : 'Compute statutory benefit-sharing liability under the Biological Diversity (Amendment) Act, 2023'
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrintABS}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all bg-white shadow-2xs cursor-pointer"
            title="Print ABS Calculation"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHi ? 'प्रिंट' : 'Print'}</span>
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isHi ? 'वार्षिक एक्स-फैक्ट्री वाणिज्यिक कारोबार (₹ में)' : 'Annual Ex-Factory Commercial Turnover (in INR ₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-bold">₹</span>
              <input
                type="number"
                value={turnover}
                onChange={(e) => setTurnover(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              ₹ {turnover.toLocaleString('en-IN')} ({ (turnover / 10000000).toFixed(2) } Crore)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isHi ? 'आवेदक कानूनी श्रेणी' : 'Applicant Legal Entity Category'}
              </label>
              <select
                value={entityType}
                onChange={(e: any) => setEntityType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white"
              >
                <option value="INDIAN_COMMERCIAL">Indian Commercial Manufacturer (MSME / Pvt Ltd)</option>
                <option value="INDIAN_AYUSH">Ayurvedic Practitioner / Codified Healer (Individual)</option>
                <option value="FOREIGN">Foreign Entity / NRI / Non-Indian Control</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isHi ? 'जैव-संसाधन का स्रोत' : 'Biological Resource Provenance'}
              </label>
              <select
                value={isCultivated ? 'true' : 'false'}
                onChange={(e) => setIsCultivated(e.target.value === 'true')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white"
              >
                <option value="false">Wild Harvested Bio-Resource (Forest / Open Source)</option>
                <option value="true">Certified Cultivated Medicinal Plant (Exempt)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calculation Result */}
        <motion.div
          layout
          className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 shadow-inner"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {isHi ? 'वैधानिक ABS देयता दर' : 'Statutory ABS Liability Rate'}
              </span>
              <p className="text-2xl font-black text-emerald-800 font-mono">{result.rate}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {isHi ? 'अनुमानित वार्षिक लाभ-साझाकरण' : 'Estimated Annual Benefit Sharing'}
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                ₹ {result.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>{result.status}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{result.description}</p>
          </div>
        </motion.div>

        {/* Action Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrintABS}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all bg-white shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{isHi ? 'गणना प्रिंट करें' : 'Print Calculation'}</span>
          </button>

          <Link
            href="/?tab=dossier"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{isHi ? 'इस गणना के साथ वैधानिक डोजियर में जाएं' : 'Proceed to Statutory Dossier with this Result'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
          </Link>
        </div>

        {/* Regulatory Citation Notice */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">
            {isHi ? 'वैधानिक शासी प्रावधान:' : 'Statutory Governing Provisions:'}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500">
            <li>Biological Diversity (Amendment) Act, 2023 &bull; Sections 3, 6, 7 & 19.</li>
            <li>Guidelines on Access to Biological Resources and Associated Knowledge and Benefits Sharing Regulations.</li>
            <li>Commercial sales up to ₹1 Cr = 0.1%, ₹1–3 Cr = 0.2%, Above ₹3 Cr = 0.5%.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
