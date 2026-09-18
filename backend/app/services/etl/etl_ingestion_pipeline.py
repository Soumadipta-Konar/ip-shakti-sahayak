import csv
import logging
import uuid
from pathlib import Path
import pdfplumber
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from app.services.etl.chunker import LegalDocumentChunker
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
CSV_PATH = BASE_DIR.parent / "corpus_index.csv"
PROJECT_ROOT = BASE_DIR.parent

# Initialize Embedding Model
logger.info("Loading sentence-transformer model...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Qdrant Client
qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
COLLECTION_NAME = "legal_chunks"

try:
    qdrant.get_collection(collection_name=COLLECTION_NAME)
except Exception:
    logger.info(f"Creating Qdrant collection: {COLLECTION_NAME}")
    qdrant.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    )

def extract_text_from_pdf(pdf_path: Path) -> str:
    text = ""
    try:
        with pdfplumber.open(pdf_path) as doc:
            for page in doc.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"Error reading {pdf_path}: {e}")
    return text

def insert_to_qdrant(chunks):
    if not chunks:
        return
        
    texts = [chunk.text for chunk in chunks]
    logger.info(f"Embedding {len(texts)} chunks...")
    vectors = embed_model.encode(texts, show_progress_bar=False)
    
    points = []
    for i, chunk in enumerate(chunks):
        points.append(
            PointStruct(
                id=str(uuid.uuid4()),
                vector=vectors[i].tolist(),
                payload={
                    "text": chunk.text,
                    "doc_id": chunk.metadata.doc_id,
                    "act_name": chunk.metadata.act_name,
                    "jurisdiction": chunk.metadata.jurisdiction,
                    "language": chunk.metadata.language,
                }
            )
        )
        
    logger.info(f"-> Inserting {len(points)} points into Qdrant Cloud...")
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def mock_insert_to_bm25(chunks):
    logger.info(f"-> Inserted {len(chunks)} chunks into BM25 Search.")

def mock_insert_to_neo4j(chunks):
    logger.info(f"-> Inserted {len(chunks)} nodes into Neo4j Graph DB.")

def run_pipeline():
    logger.info("Starting ETL Ingestion Pipeline...")
    
    if not CSV_PATH.exists():
        logger.error(f"CSV not found at {CSV_PATH.resolve()}")
        return

    with open(CSV_PATH, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            file_path = row["file_path"]
            status = row["status"]
            
            if status == "Ingested":
                continue
                
            pdf_path = PROJECT_ROOT / file_path
            
            if not pdf_path.exists():
                logger.warning(f"File not found: {pdf_path}. Skipping.")
                continue
                
            logger.info(f"Processing: {row['document_title']} ({row['document_type']})")
            
            # 1. Extraction
            text = extract_text_from_pdf(pdf_path)
            
            # 2. Chunking
            chunker = LegalDocumentChunker(
                doc_id=row["document_title"].replace(" ", "_").lower(),
                act_name=row["act_name"],
                jurisdiction=row["jurisdiction"],
                language=row["language"]
            )
            chunks = chunker.chunk_document(text)
            
            # 3. Insertion
            insert_to_qdrant(chunks)
            mock_insert_to_bm25(chunks)
            mock_insert_to_neo4j(chunks)
            
            logger.info(f"Successfully processed {file_path}. Marking as Ingested.\n")

if __name__ == "__main__":
    run_pipeline()
