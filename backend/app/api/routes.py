from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.core.security import DPDPComplianceEngine
from app.services.agent import process_query_via_langgraph
from app.services.classification_engine import FormulationEngine, ClassificationInput, ClassificationResult
from app.core.config import settings
from groq import Groq
import pytesseract
from PIL import Image
from fpdf import FPDF
import io
import os

router = APIRouter()
groq_client = Groq(api_key=settings.GROQ_API_KEY)

class AskRequest(BaseModel):
    query: str
    jurisdiction: str = "IN"

class AskResponse(BaseModel):
    query_processed: str
    jurisdiction: str
    answer: str
    citations: list

class PDFExportRequest(BaseModel):
    query: str
    answer: str

@router.post("/ask", response_model=AskResponse)
async def ask_ip_assistant(request: AskRequest):
    safe_query = DPDPComplianceEngine.strip_pii(request.query)
    result = process_query_via_langgraph(safe_query, request.jurisdiction)
    return AskResponse(
        query_processed=safe_query,
        jurisdiction=request.jurisdiction,
        answer=result["answer"],
        citations=result["citations"]
    )

@router.post("/classify", response_model=ClassificationResult)
async def classify_formulation(request: ClassificationInput):
    return FormulationEngine.classify(request)

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio using Groq Whisper model."""
    audio_bytes = await file.read()
    try:
        transcription = groq_client.audio.transcriptions.create(
            file=(file.filename, audio_bytes),
            model="whisper-large-v3",
            response_format="json"
        )
        return {"text": transcription.text}
    except Exception as e:
        return {"error": str(e)}

@router.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """Extract text from uploaded images using Tesseract."""
    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return {"text": text.strip()}
    except Exception as e:
        return {"error": str(e)}

@router.post("/export-pdf")
async def export_pdf(request: PDFExportRequest):
    """Generate a PDF report of the answer."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    pdf.cell(200, 10, txt="IP-SAKTI Sahayak Report", ln=True, align='C')
    pdf.ln(10)
    pdf.multi_cell(0, 10, txt=f"Query: {request.query}")
    pdf.ln(5)
    pdf.multi_cell(0, 10, txt=f"Answer:\n{request.answer}")
    
    pdf_path = "report_export.pdf"
    pdf.output(pdf_path)
    return FileResponse(path=pdf_path, filename="IP_SAKTI_Report.pdf", media_type="application/pdf")
