from typing import Literal, Dict, List, Optional
from pydantic import BaseModel, Field


class StatutoryCitation(BaseModel):
    id: Optional[str] = None
    act: str
    section: str
    description: str
    snippet: Optional[str] = None
    url: Optional[str] = None
    jurisdiction: Literal["IN", "INTL"] = "IN"


class ClassificationInput(BaseModel):
    is_first_schedule: bool = False
    is_modified: bool = False
    intended_use: Literal["medicinal", "food"] = "medicinal"
    is_purified: bool = False


class ClassificationResult(BaseModel):
    category: str
    title: str
    statute: str
    authority: str
    patentability: str
    section_3_risk: Literal["HIGH_BAR_SEC_3P", "CONDITIONAL_SEC_3E", "PATENTABLE_SEC_3D", "NOT_APPLICABLE"]
    patentRiskDescription: str
    tkdl_status: str
    abs_posture: str
    clinical_requirements: str
    claims_rule: str
    citations: List[StatutoryCitation] = Field(default_factory=list)
    export_clearance: Dict[str, str] = Field(default_factory=dict)
    classification_title: str = ""
    patent_risk: str = ""


class FormulationEngine:
    """
    Deterministic statutory classification engine for Ayurvedic formulations.
    Grounded in:
      - Drugs & Cosmetics Act 1940 & Rules 1945 (Rule 158-B, Rule 122-E)
      - The Indian Patents Act 1970 (Sec 3(p), 3(e), 3(d))
      - Biological Diversity Act 2002 / Biological Diversity (Amendment) Act 2023
      - FSSAI Ayurveda Aahara Regulations 2022
      - AYUSH Guidelines for Examination of Patent Applications (2025)
    """

    @staticmethod
    def classify(data: ClassificationInput) -> ClassificationResult:
        # Category 1: Generic Classical Ayurvedic Medicine
        if data.is_first_schedule and not data.is_modified:
            return ClassificationResult(
                category="1. Classical Generic Ayurvedic Medicine",
                title="Generic Classical Ayurvedic Medicine (First Schedule)",
                classification_title="Generic Classical Medicine",
                patent_risk="BARRED (Section 3p). Protected by TKDL.",
                statute="Drugs & Cosmetics Act 1940 §3(a) & Rule 158-B(1)",
                authority="State AYUSH Licensing Authority (SLA)",
                patentability="STATUTORILY BARRED UNDER SECTION 3(p) & 3(e). Protected as Traditional Knowledge.",
                section_3_risk="HIGH_BAR_SEC_3P",
                patentRiskDescription="Strict statutory non-patentability bar under Section 3(p) as traditional knowledge. Any attempt to patent will be challenged by CSIR-TKDL pre-grant opposition.",
                tkdl_status="100% Codified in CSIR Traditional Knowledge Digital Library (TKDL) and authoritative First Schedule texts (e.g. Charaka Samhita, Sushruta Samhita, API).",
                abs_posture="EXEMPT from prior SBB intimation for Indian entities/vaidyas (BDA 2023 §7). Foreign entities require mandatory prior NBA clearance (§6).",
                clinical_requirements="No modern clinical trial required. Textual citations and classical method of preparation from First Schedule texts suffice.",
                claims_rule="Product claims statutorily rejected. May protect brand name via Trademarks Act 1999 and novel packaging via Designs Act 2000.",
                citations=[
                    StatutoryCitation(
                        id="cit-pat-3p",
                        act="The Patents Act, 1970",
                        section="Section 3(p)",
                        description="Inventions based on traditional knowledge or aggregation of known properties are barred from patentability.",
                        snippet="An invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.",
                        url="https://www.ipindia.gov.in",
                        jurisdiction="IN"
                    ),
                    StatutoryCitation(
                        id="cit-dca-158b1",
                        act="Drugs and Cosmetics Rules, 1945",
                        section="Rule 158-B(1)",
                        description="Licensing criteria for classical ayurvedic medicines based purely on First Schedule authoritative texts.",
                        snippet="Issue of licence for classical Ayurvedic drugs requires submission of authoritative book citations and conformity with official pharmacopoeial standards.",
                        url="https://ayush.gov.in",
                        jurisdiction="IN"
                    ),
                    StatutoryCitation(
                        id="cit-bda-7",
                        act="Biological Diversity Act, 2023",
                        section="Section 7",
                        description="Prior intimation to State Biodiversity Board and exemption for codified traditional knowledge users.",
                        snippet="Registered practitioners of indigenous systems of medicine are exempt from prior intimation to the State Biodiversity Board for commercial utilization.",
                        url="http://nbaindia.org",
                        jurisdiction="IN"
                    ),
                ],
                export_clearance={
                    "US_FDA": "Exportable as Dietary Supplement under DSHEA 1994 (Structure/Function claims only; no disease claims).",
                    "EU_EMA": "Exportable under Traditional Herbal Medicinal Products Directive (THMPD 2004/24/EC) requiring 30-year bibliographic evidence.",
                    "ASEAN": "Traditional medicine product registration with heavy metal & microbiological contaminant testing.",
                }
            )

        # Category 2: Phytopharmaceutical Drug
        if data.is_purified:
            return ClassificationResult(
                category="3. Phytopharmaceutical Drug (Rule 122-E)",
                title="Phytopharmaceutical Drug with Purified Fractions",
                classification_title="Phytopharmaceutical Drug (Rule 122-E)",
                patent_risk="HIGHLY PATENTABLE. Complies with Sec 3(d).",
                statute="Drugs & Cosmetics Rules Rule 122-E & Schedule Y-A; Patents Act §3(d)",
                authority="Central Drugs Standard Control Organization (CDSCO / DCGI)",
                patentability="HIGHLY PATENTABLE. Composition-of-matter and extraction process patentable if ≥4 bioactive markers characterized and therapeutic efficacy proven.",
                section_3_risk="PATENTABLE_SEC_3D",
                patentRiskDescription="Favorable patent eligibility posture. Overcomes Section 3(d) by demonstrating significant enhancement of therapeutic efficacy over crude plant extract.",
                tkdl_status="Overcomes TKDL barrier if the fractionated profile, specific chemical ratio, and novel therapeutic indication diverge from traditional codified uses.",
                abs_posture="MANDATORY National Biodiversity Authority (NBA) approval (BDA 2023 §6) PRIOR to patent grant. Form III mandatory condition precedent.",
                clinical_requirements="Full randomized controlled clinical trials (Phase I safety/PK, Phase II dose ranging, Phase III efficacy) required under Schedule Y-A.",
                claims_rule="Draft composition claims specifying chromatography fractions, specific marker ratios, and method-of-treatment claims internationally (PCT).",
                citations=[
                    StatutoryCitation(
                        id="cit-dca-122e",
                        act="Drugs and Cosmetics Rules, 1945",
                        section="Rule 122-E",
                        description="Regulatory pathway for Phytopharmaceutical drugs derived from medicinal plants.",
                        snippet="A drug of purified and standardized fraction with defined minimum 4 bioactive or phytochemical marker compounds of an extract of a medicinal plant.",
                        url="https://cdsco.gov.in",
                        jurisdiction="IN"
                    ),
                    StatutoryCitation(
                        id="cit-pat-3d",
                        act="The Patents Act, 1970",
                        section="Section 3(d)",
                        description="Enhanced therapeutic efficacy standard for derivatives and known substances.",
                        snippet="The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance is not patentable.",
                        url="https://www.ipindia.gov.in",
                        jurisdiction="IN"
                    ),
                    StatutoryCitation(
                        id="cit-bda-6",
                        act="Biological Diversity Act, 2023",
                        section="Section 6",
                        description="Mandatory prior approval of NBA before applying for IPR based on biological resources.",
                        snippet="No person shall apply for any intellectual property right, in or outside India, for any invention based on biological resource obtained from India without previous approval of NBA.",
                        url="http://nbaindia.org",
                        jurisdiction="IN"
                    ),
                ],
                export_clearance={
                    "US_FDA": "Botanical Drug Guidance (CDER IND/NDA route). Eligible for 5-year New Chemical Entity (NCE) exclusivity.",
                    "EU_EMA": "Centralised Marketing Authorisation Application (MAA) as Well-Established Use or Stand-Alone Herbal Drug.",
                    "JAPAN_PMDA": "Kampo/Ethnomedicine pharmaceutical monograph submission.",
                }
            )

        # Category 3: Ayurveda-Aahar (Food/Nutraceutical)
        if data.intended_use == "food":
            return ClassificationResult(
                category="5. Ayurveda-Aahar (Nutraceutical / Food)",
                title="Ayurveda Aahara Food Product",
                classification_title="Ayurveda-Aahar (Nutraceutical)",
                patent_risk="Recipe Not Patentable. Use Trademarks.",
                statute="FSSAI Ayurveda Aahar Regulations, 2022 & Patents Act §3(p)",
                authority="Food Safety and Standards Authority of India (FSSAI)",
                patentability="Recipe non-patentable under §3(p). Focus on Trademark, Trade Dress, and Packaging Design registration.",
                section_3_risk="NOT_APPLICABLE",
                patentRiskDescription="Patents Act Section 3(p) and Section 3(e) bar recipes combining traditional dietary items. IP protection pivots to Branding, Logo Trademarks, and Industrial Design.",
                tkdl_status="Ingredients codified under recognized traditional dietary usage. No patent exclusivity available for the dietary formulation per se.",
                abs_posture="Standard State Biodiversity Board (SBB) notification for commercial procurement of wild raw biological commodities.",
                clinical_requirements="No clinical trial needed. Must comply with FSSAI limits on heavy metals, aflatoxins, and microbiological criteria.",
                claims_rule="Labels must bear official Ayurveda Aahar logo. No disease treatment or cure claims allowed under FSSAI Advertising Regulations.",
                citations=[
                    StatutoryCitation(
                        id="cit-fssai-ayurveda",
                        act="FSSAI (Ayurveda Aahar) Regulations, 2022",
                        section="Regulation 4 & 5",
                        description="Standards for foods prepared in accordance with the recipes or processes described in the authoritative books of Ayurveda.",
                        snippet="Ayurveda Aahar products shall specify target demographic and conform to heavy metal and microbiological specifications.",
                        url="https://fssai.gov.in",
                        jurisdiction="IN"
                    ),
                    StatutoryCitation(
                        id="cit-tm-28",
                        act="Trade Marks Act, 1999",
                        section="Section 28",
                        description="Exclusive proprietary rights conferred by registration of trademark for brand identity.",
                        snippet="Registration of a trade mark gives the registered proprietor exclusive right to use the mark in relation to goods or services.",
                        url="https://www.ipindia.gov.in",
                        jurisdiction="IN"
                    ),
                ],
                export_clearance={
                    "US_FDA": "Conventional Food or Dietary Supplement under 21 CFR Part 111 (C-GMP compliance).",
                    "EU_EFSA": "Novel Food Regulation (EU) 2015/2283 if not consumed in EU prior to 15 May 1997, or Traditional Food from Third Countries.",
                    "FSSAI_GLOBAL": "Export Health Certificate from FSSAI.",
                }
            )

        # Category 4: Patent-or-Proprietary (P&P) Medicine
        return ClassificationResult(
            category="2. Patent-or-Proprietary (P&P) Ayurvedic Medicine",
            title="Patent or Proprietary (P&P) Ayurvedic Medicine",
            classification_title="Patent-or-Proprietary (P&P) Medicine",
            patent_risk="High Sec 3(e) risk unless clinical synergy proven.",
            statute="Drugs & Cosmetics Act 1940 §3(h) & Rule 158-B(2); Patents Act §3(e)",
            authority="State AYUSH Licensing Authority (SLA) & Patent Office (IP India)",
            patentability="CONDITIONAL ON SYNERGY. Severe Section 3(e) hurdle unless supra-additive biological synergy (CI < 1.0) is proven with experimental animal/in-vitro assay data.",
            section_3_risk="CONDITIONAL_SEC_3E",
            patentRiskDescription="High statutory rejection risk under Section 3(e) (mere admixture). Must file robust experimental data proving that combination of extracts has synergistic bioactivity exceeding the sum of parts.",
            tkdl_status="CSIR-TKDL will oppose if combination of ingredients is cited in classical texts for similar therapeutic indications.",
            abs_posture="Mandatory prior intimation to State Biodiversity Board (SBB Form I) under Section 7 of Biological Diversity Act 2023.",
            clinical_requirements="Published safety literature and pilot clinical efficacy study required by State Licensing Authority under Rule 158-B(2).",
            claims_rule="Claim must be limited to specific synergistic weight ratios (e.g. 1:3:0.5) showing unexpected technical effect under Indian Patent Office AYUSH Guidelines 2025.",
            citations=[
                StatutoryCitation(
                    id="cit-pat-3e",
                    act="The Patents Act, 1970",
                    section="Section 3(e)",
                    description="Mere admixture resulting in aggregation of properties is not an invention.",
                    snippet="A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable.",
                    url="https://www.ipindia.gov.in",
                    jurisdiction="IN"
                ),
                StatutoryCitation(
                    id="cit-dca-158b2",
                    act="Drugs and Cosmetics Rules, 1945",
                    section="Rule 158-B(2)",
                    description="Requirements for Patent and Proprietary Ayurvedic medicines.",
                    snippet="Issue of licence for Patent or Proprietary medicine requires proof of effectiveness and safety data as per Schedule E-1 and pharmacopoeial monograph compliance.",
                    url="https://ayush.gov.in",
                    jurisdiction="IN"
                ),
                StatutoryCitation(
                    id="cit-ayush-guidelines-2025",
                    act="AYUSH Invention Examination Guidelines 2025",
                    section="Guiding Principles 3.4 & 3.5",
                    description="Assessment of inventive step and synergy in herbal poly-formulations.",
                    snippet="Mere combination of known herbs is non-patentable under 3(e) unless specific quantitative ratios demonstrate unexpected biological synergy supported by comparative experimental data.",
                    url="https://www.ipindia.gov.in",
                    jurisdiction="IN"
                ),
            ],
            export_clearance={
                "US_FDA": "Dietary Supplement with substantiation dossier for structure/function claims.",
                "EU_EMA": "THMPD or Food Supplement directive compliance.",
                "GCC_DR": "Herbal medicine dossier with stability studies in Zone IVb.",
            }
        )
