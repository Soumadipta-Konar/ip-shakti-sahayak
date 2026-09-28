import hashlib
import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class StatutoryFormItem(BaseModel):
    form_code: str
    authority: str
    statutory_act: str
    purpose: str
    deadline: str
    status: str


class ApplicantInfo(BaseModel):
    name: str
    organization: str
    jurisdiction: str = "IN"


class FormulationDossierInfo(BaseModel):
    name: str
    triage_category: str
    regulatory_authority: str
    patent_risk_score: str
    prior_art_status: str


class BdaAbsCompliance(BaseModel):
    assessment: str
    statutory_rate: str
    exemptions_applicable: str


class DossierResult(BaseModel):
    dossier_ref: str
    created_at: str
    applicant: ApplicantInfo
    formulation: FormulationDossierInfo
    bda_abs_compliance: BdaAbsCompliance
    statutory_forms: List[StatutoryFormItem]
    digital_verification_hash: str
    compliance_verdict: str
    regulatory_disclaimer: str


class DossierService:
    @staticmethod
    def generate_dossier(
        applicant_name: str,
        organization: str,
        formulation_name: str,
        classification_data: Optional[Dict[str, Any]] = None,
        abs_data: Optional[Dict[str, Any]] = None,
        prior_art_data: Optional[Dict[str, Any]] = None,
    ) -> DossierResult:
        """
        Synthesizes a certified statutory compliance dossier with SHA-256 digital verification hash.
        Includes all required NBA, Patent Office, and SBB compliance filings.
        """
        now_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        dossier_ref = f"DOS-AYUSH-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')}-{abs(hash(applicant_name + formulation_name)) % 10000:04d}"

        clf = classification_data or {}
        abs_info = abs_data or {}
        pa = prior_art_data or {}

        triage_cat = clf.get("category") or "Classical Generic Ayurvedic Medicine (First Schedule)"
        reg_auth = clf.get("authority") or "State AYUSH Licensing Authority (SLA)"
        raw_score = pa.get("patentability_risk_score")
        if raw_score is None:
            risk_score = "75/100 (Moderate-High Bar)"
        elif isinstance(raw_score, (int, float)):
            risk_score = f"{int(raw_score)}/100"
        else:
            raw_str = str(raw_score).strip()
            if "/" in raw_str:
                risk_score = raw_str
            else:
                clean_num = raw_str.replace("%", "").strip()
                risk_score = f"{clean_num}/100"

        pa_status = pa.get("overall_status") or "TKDL_MONITORED_ADMIXTURE"

        # ABS assessment
        fee = abs_info.get("calculatedFee", 0)
        fee_str = f"₹{fee:,.2f}" if fee else "Exempted / Nil under Sec 7"
        rate_desc = abs_info.get("statutoryRateDescription") or "0.1% to 0.5% of ex-factory sale price for commercial utilization"
        exemption = abs_info.get("exemptionNotes") or "Codified traditional knowledge users / registered practitioners exempt from SBB fee under BDA 2023 §7."

        # Compile Statutory Forms
        forms = [
            StatutoryFormItem(
                form_code="NBA Form I",
                authority="National Biodiversity Authority (NBA)",
                statutory_act="Biological Diversity Act 2023, Sec 19",
                purpose="Approval for access to Indian biological resources for commercial utilization or bio-survey.",
                deadline="Prior to commercial collection/production",
                status="Mandatory for Non-Indian Entities"
            ),
            StatutoryFormItem(
                form_code="NBA Form III",
                authority="National Biodiversity Authority (NBA)",
                statutory_act="Biological Diversity Act 2023, Sec 6(1)",
                purpose="Mandatory prior statutory permission required before the grant of any Patent on biological resources.",
                deadline="Before Patent Grant (Condition precedent)",
                status="Strict Mandatory Requirement"
            ),
            StatutoryFormItem(
                form_code="SBB Form I",
                authority="State Biodiversity Board (SBB)",
                statutory_act="Biological Diversity Act 2023, Sec 7",
                purpose="Prior intimation to the concerned State Biodiversity Board for accessing biological resources.",
                deadline="30 days prior to commercial sourcing",
                status="Mandatory for Indian Commercial Entities"
            ),
            StatutoryFormItem(
                form_code="IPO Form 1",
                authority="Indian Patent Office (IPO)",
                statutory_act="The Patents Act 1970, Sec 7 & 54",
                purpose="Application for grant of patent with mandatory declaration of source and geographical origin of biological material under Sec 10(4)(d)(ii).",
                deadline="At initial filing",
                status="Mandatory"
            ),
            StatutoryFormItem(
                form_code="AYUSH SLA Form 24-D",
                authority="State AYUSH Licensing Authority",
                statutory_act="Drugs and Cosmetics Rules 1945, Rule 153",
                purpose="Application for manufacture of Ayurvedic, Siddha, or Unani drugs under Good Manufacturing Practice (Schedule T).",
                deadline="Prior to commercial manufacturing",
                status="Mandatory for Commercialization"
            )
        ]

        # Calculate verifiable SHA-256 fingerprint
        raw_payload = f"{dossier_ref}|{applicant_name}|{organization}|{formulation_name}|{triage_cat}|{now_str}|IP-SAKTI-SAHAYAK-SIH045"
        v_hash = hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

        verdict = (
            f"STATUTORY ASSESSMENT: Formulation '{formulation_name}' categorized under {triage_cat}. "
            f"To secure intellectual property and regulatory compliance, submit NBA Form III before patent grant "
            f"and satisfy Rule 158-B quality monograph requirements. All access to Indian biological materials must adhere to BDA 2023 provisions."
        )

        disclaimer = (
            "STATUTORY LEGAL NOTICE: This dossier is algorithmically generated by IP-SAKTI Sahayak (SIH 045) "
            "based on The Indian Patents Act 1970 (as amended 2024), The Biological Diversity Act 2023, "
            "and Drugs & Cosmetics Rules 1945. It provides official statutory triage and procedural guidance "
            "and does not constitute formal legal representation."
        )

        return DossierResult(
            dossier_ref=dossier_ref,
            created_at=now_str,
            applicant=ApplicantInfo(name=applicant_name, organization=organization, jurisdiction="IN"),
            formulation=FormulationDossierInfo(
                name=formulation_name,
                triage_category=triage_cat,
                regulatory_authority=reg_auth,
                patent_risk_score=risk_score,
                prior_art_status=pa_status
            ),
            bda_abs_compliance=BdaAbsCompliance(
                assessment="Compliant subject to statutory filings",
                statutory_rate=rate_desc,
                exemptions_applicable=exemption
            ),
            statutory_forms=forms,
            digital_verification_hash=v_hash,
            compliance_verdict=verdict,
            regulatory_disclaimer=disclaimer
        )
