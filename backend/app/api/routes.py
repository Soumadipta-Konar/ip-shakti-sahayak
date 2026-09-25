import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field

from app.core.security import DPDPComplianceEngine
from app.services.agent import process_query_via_langgraph
from app.services.classification_engine import FormulationEngine, ClassificationInput, ClassificationResult
from app.services.prior_art_service import PriorArtService, PriorArtAnalysisResult
from app.services.dossier_service import DossierService, DossierResult
from app.services.transcription_service import TranscriptionService

logger = logging.getLogger(__name__)

router = APIRouter()


# --- Request and Response Schemas ---

class AskRequest(BaseModel):
    query: str
    jurisdiction: str = "IN"
    session_id: Optional[str] = "default_session"
    language: Optional[str] = "en"
    context: Optional[Dict[str, Any]] = None
    session_metadata: Optional[Dict[str, Any]] = None


class AskResponse(BaseModel):
    query_processed: str
    jurisdiction: str
    answer: str
    confidence_score: float = 0.95
    requires_escalation: bool = False
    citations: List[Dict[str, Any]] = Field(default_factory=list)


class PriorArtRequest(BaseModel):
    formulation_name: str
    ingredients: List[str]
    extraction_type: str = "Aqueous"
    therapeutic_claims: str = ""
    has_synergy_data: bool = False
    is_fractionated: bool = False


class DossierRequest(BaseModel):
    applicant_name: str
    organization: str
    formulation_name: str
    classification_data: Optional[Dict[str, Any]] = None
    abs_data: Optional[Dict[str, Any]] = None
    prior_art_data: Optional[Dict[str, Any]] = None


# --- Endpoints ---

@router.post("/ask", response_model=AskResponse)
async def ask_ip_assistant(request: AskRequest):
    """
    Core Multi-Agent RAG Legal Query Endpoint.
    Grounded strictly in 8,495 ingested statutory chunks in Qdrant Cloud.
    Applies DPDP compliance PII scrubbing, query decomposition, and interactive citation formatting.
    """
    safe_query = DPDPComplianceEngine.strip_pii(request.query)

    # Route through LangGraph orchestrator
    result = process_query_via_langgraph(
        query=safe_query,
        jurisdiction=request.jurisdiction,
        language=request.language or "en",
        session_id=request.session_id or "default_session",
        context=request.context,
        session_metadata=request.session_metadata,
    )

    return AskResponse(
        query_processed=safe_query,
        jurisdiction=request.jurisdiction,
        answer=result.get("answer", ""),
        confidence_score=result.get("confidence_score", 0.95),
        requires_escalation=result.get("requires_escalation", False),
        citations=result.get("citations", []),
    )


@router.post("/classify", response_model=ClassificationResult)
async def classify_formulation(request: ClassificationInput):
    """
    Deterministic Statutory Classification Engine.
    Categorizes Ayurvedic innovations into Classical, Phytopharmaceutical, Ayurveda-Aahar, or P&P Medicine.
    Provides authoritative citations, clinical requirements, Section 3 risks, and export guidance.
    """
    return FormulationEngine.classify(request)


@router.post("/prior-art/analyze", response_model=PriorArtAnalysisResult)
async def analyze_prior_art(request: PriorArtRequest):
    """
    TKDL & Ayurvedic Prior-Art Scrutiny Engine.
    Correlates ingredients with classical Ayurvedic treatises (Charaka, Sushruta, API monographs)
    and CSIR Traditional Knowledge Digital Library pre-grant opposition barriers.
    """
    return PriorArtService.analyze(
        formulation_name=request.formulation_name,
        ingredients=request.ingredients,
        extraction_type=request.extraction_type,
        therapeutic_claims=request.therapeutic_claims,
        has_synergy_data=request.has_synergy_data,
        is_fractionated=request.is_fractionated,
    )


@router.post("/dossier/generate", response_model=DossierResult)
async def generate_dossier(request: DossierRequest):
    """
    Statutory Compliance Dossier Generator.
    Produces a certified digital audit dossier with SHA-256 integrity hash,
    cataloging all mandatory NBA Form I/III, IPO Form 1, and SBB filings.
    """
    return DossierService.generate_dossier(
        applicant_name=request.applicant_name,
        organization=request.organization,
        formulation_name=request.formulation_name,
        classification_data=request.classification_data,
        abs_data=request.abs_data,
        prior_art_data=request.prior_art_data,
    )


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Multilingual Indic Audio Speech-to-Text Transcription.
    Powered by Groq Whisper-large-v3-turbo for crystal-clear voice legal queries.
    """
    try:
        content = await audio.read()
        filename = audio.filename or "speech.webm"
        text = TranscriptionService.transcribe_audio(content, filename=filename)
        return {
            "transcription": text,
            "translated_english_text": text,
            "text": text,
        }
    except Exception as e:
        logger.error(f"Error handling audio upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))
