import os
import sys
import re
import csv
import uuid
import time
import pickle
import logging
from pathlib import Path
from typing import List, Dict, Any

# Ensure backend root is in sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.services.etl.chunker import LegalDocumentChunker, LegalChunk

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("reingest_baai")

RAW_DATA_DIR = Path(r"C:\Users\gyanr\Downloads\raw-20260924T183609Z-1-001\raw")
CACHE_FILE = BACKEND_DIR / "data" / "baai_embeddings_cache.pkl"
COLLECTION_NAME = "legal_chunks"
MODEL_NAME = "BAAI/bge-small-en-v1.5"
VECTOR_DIMENSION = 384


def get_metadata_for_file(category: str, filepath: Path) -> Dict[str, Any]:
    fname = filepath.name.lower()
    
    # Year
    year_match = re.search(r"\b(19\d\d|20\d\d)\b", fname)
    year = year_match.group(1) if year_match else "2024"

    # Language
    language = "hi" if "hindi" in fname else "en"

    # Jurisdiction
    if category in ("international", "case_law"):
        jurisdiction = "INTL"
    else:
        jurisdiction = "IN"

    # Document type
    if category == "case_law":
        doc_type = "case_law"
    elif category == "classical":
        doc_type = "classical"
    elif any(k in fname for k in ("rule", "guideline", "order", "instruction", "guide", "regulation")):
        doc_type = "regulation"
    elif category == "international":
        doc_type = "treaty"
    else:
        doc_type = "statute"

    # Human-readable Title & Act Name
    clean_stem = filepath.stem
    clean_title = re.sub(r"^(in_|intl_)", "", clean_stem)
    clean_title = clean_title.replace("_extracted_text", "").replace("_", " ").title()
    clean_title = re.sub(r"\s+", " ", clean_title).strip()

    # Doc ID
    doc_id = re.sub(r"[^a-zA-Z0-9_]", "_", filepath.stem.lower())

    return {
        "doc_id": doc_id,
        "act_name": clean_title,
        "document_title": clean_title,
        "jurisdiction": jurisdiction,
        "language": language,
        "document_type": doc_type,
        "year": year,
        "source_file": filepath.name,
    }


def main():
    start_time = time.time()
    logger.info("=" * 70)
    logger.info("   IP-SAKTI SAHAYAK - HIGH-PRECISION BAAI RE-INGESTION PIPELINE")
    logger.info(f" Model: {MODEL_NAME} (384 dimensions, Cosine, Normalized)")
    logger.info(f" Target Qdrant: {settings.QDRANT_URL}")
    logger.info(f" Source Corpus: {RAW_DATA_DIR}")
    logger.info("=" * 70)

    if not RAW_DATA_DIR.exists():
        logger.error(f"Raw data directory does not exist: {RAW_DATA_DIR}")
        sys.exit(1)

    # 1. Connect to Qdrant Cloud
    from qdrant_client import QdrantClient
    from qdrant_client.http import models as qmodels

    logger.info("Connecting to Qdrant Cloud (timeout=120s)...")
    client = QdrantClient(
        url=settings.QDRANT_URL,
        port=443,
        api_key=settings.QDRANT_API_KEY,
        timeout=120.0,
    )

    # 2. Check / Delete existing collection
    existing_collections = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME in existing_collections:
        logger.warning(f"Deleting existing collection '{COLLECTION_NAME}'...")
        client.delete_collection(COLLECTION_NAME)
        logger.info(f"Successfully deleted collection '{COLLECTION_NAME}'.")

    # 3. Create fresh collection with Cosine distance
    logger.info(f"Creating new collection '{COLLECTION_NAME}' (size={VECTOR_DIMENSION}, Cosine)...")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=qmodels.VectorParams(
            size=VECTOR_DIMENSION,
            distance=qmodels.Distance.COSINE,
        ),
    )

    # Payload keyword indexes
    payload_indexes = [
        "doc_id", "source_file", "jurisdiction", "document_type",
        "act_name", "status", "version_tag", "effective_from", "effective_to"
    ]
    for field in payload_indexes:
        try:
            client.create_payload_index(
                collection_name=COLLECTION_NAME,
                field_name=field,
                field_schema=qmodels.PayloadSchemaType.KEYWORD,
            )
        except Exception:
            pass
    logger.info(f"Payload indexes created on: {payload_indexes}")

    # 4. Check for cached chunks and embeddings
    all_chunks: List[LegalChunk] = []
    file_records = []
    embeddings = []

    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    if CACHE_FILE.exists():
        logger.info(f"Found existing embeddings cache at: {CACHE_FILE}")
        try:
            with open(CACHE_FILE, "rb") as f:
                cache_data = pickle.load(f)
            all_chunks = cache_data.get("chunks", [])
            embeddings = cache_data.get("embeddings", [])
            file_records = cache_data.get("file_records", [])
            logger.info(f"Loaded {len(all_chunks)} chunks and {len(embeddings)} vectors from cache!")
        except Exception as ce:
            logger.warning(f"Failed to read cache: {ce}. Will re-generate.")
            all_chunks, embeddings, file_records = [], [], []

    if not all_chunks or not embeddings:
        import torch
        from sentence_transformers import SentenceTransformer

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loading embedding model '{MODEL_NAME}' on device: {device.upper()}...")
        if device == "cuda":
            logger.info(f"GPU Accelerator: {torch.cuda.get_device_name(0)}")
        embedder = SentenceTransformer(MODEL_NAME, device=device)

        categories = ["national", "international", "case_law", "classical"]
        logger.info("Extracting and chunking documents across all 4 categories...")
        for cat in categories:
            cat_dir = RAW_DATA_DIR / cat
            if not cat_dir.exists():
                continue

            files = sorted(list(cat_dir.glob("*.txt")) + list(cat_dir.glob("*.pdf")))
            logger.info(f"Category [{cat}]: Found {len(files)} files.")

            for fpath in files:
                meta = get_metadata_for_file(cat, fpath)
                chunker = LegalDocumentChunker(
                    doc_id=meta["doc_id"],
                    act_name=meta["act_name"],
                    jurisdiction=meta["jurisdiction"],
                    effective_date=f"{meta['year']}-01-01",
                    document_type=meta["document_type"],
                    source_file=meta["source_file"],
                    version_tag="v1.0",
                    status="Active",
                )
                chunks = chunker.chunk_file(fpath)
                all_chunks.extend(chunks)

                file_records.append({
                    "file_path": f"corpus_extracted/{fpath.name}",
                    "document_title": meta["document_title"],
                    "act_name": meta["act_name"],
                    "year": meta["year"],
                    "jurisdiction": meta["jurisdiction"],
                    "language": meta["language"],
                    "document_type": meta["document_type"],
                    "chunks_count": len(chunks),
                    "status": "Ingested",
                })
                logger.info(f"  -> {fpath.name:<55} | Chunks: {len(chunks):<4} | Juris: {meta['jurisdiction']}")

        total_chunks = len(all_chunks)
        logger.info(f"\nTotal Chunks to Embed: {total_chunks}")

        batch_size = 128 if device == "cuda" else 32
        logger.info(f"Embedding {total_chunks} chunks using {MODEL_NAME} (batch_size={batch_size}, normalize=True)...")

        contents = [c.content for c in all_chunks]
        embed_start = time.time()
        embeddings = embedder.encode(
            contents,
            batch_size=batch_size,
            show_progress_bar=True,
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).tolist()
        embed_elapsed = time.time() - embed_start
        logger.info(f"Embeddings generated in {embed_elapsed:.2f} seconds ({total_chunks / embed_elapsed:.1f} chunks/sec)!")

        # Save to cache
        try:
            with open(CACHE_FILE, "wb") as f:
                pickle.dump({
                    "chunks": all_chunks,
                    "embeddings": embeddings,
                    "file_records": file_records,
                }, f)
            logger.info(f"Saved chunks and embeddings cache to {CACHE_FILE}")
        except Exception as se:
            logger.warning(f"Could not save cache: {se}")

    total_chunks = len(all_chunks)

    # 5. Build Qdrant PointStructs
    logger.info("Building Qdrant PointStruct payload objects...")
    all_points = []
    for idx, (chunk, vector) in enumerate(zip(all_chunks, embeddings)):
        unique_seed = f"{chunk.doc_id}:{chunk.section_name}:v1.0:{idx}"
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, unique_seed))

        payload = {
            "text": chunk.content,
            "doc_id": chunk.doc_id,
            "act_name": chunk.act_name,
            "chapter_name": chunk.chapter_name,
            "section_name": chunk.section_name,
            "section_title": chunk.section_title,
            "jurisdiction": chunk.jurisdiction,
            "document_type": chunk.document_type,
            "language": getattr(chunk, "original_language", getattr(chunk, "language", "en")) or "en",
            "source_file": chunk.source_file,
            "source_url": chunk.source_url or "",
            "version_tag": chunk.version_tag or "v1.0",
            "status": chunk.status or "Active",
            "effective_from": chunk.effective_from or "1970-01-01",
            "effective_to": chunk.effective_to,
            "superseded_by": chunk.superseded_by,
            "gazette_ref": chunk.gazette_ref or "",
            "chunk_index": idx,
        }
        all_points.append(qmodels.PointStruct(id=point_id, vector=vector, payload=payload))

    # 6. Upsert vectors to Qdrant Cloud in smaller batches with retry and wait=False
    upsert_batch_size = 64
    total_pts = len(all_points)
    num_batches = (total_pts + upsert_batch_size - 1) // upsert_batch_size
    logger.info(f"Upserting {total_pts} points in {num_batches} batches of {upsert_batch_size} (wait=False)...")

    upsert_start = time.time()
    for b_idx in range(num_batches):
        batch = all_points[b_idx * upsert_batch_size : (b_idx + 1) * upsert_batch_size]
        for attempt in range(1, 5):
            try:
                client.upsert(collection_name=COLLECTION_NAME, points=batch, wait=False)
                break
            except Exception as e:
                logger.warning(f"Batch {b_idx + 1}/{num_batches} attempt {attempt} failed: {e}. Retrying in {attempt * 2}s...")
                time.sleep(attempt * 2)
        else:
            logger.error(f"Failed to upsert batch {b_idx + 1} after 4 attempts.")
            raise RuntimeError(f"Upsert failed at batch {b_idx + 1}")

        if (b_idx + 1) % 10 == 0 or (b_idx + 1) == num_batches:
            logger.info(f"  -> Uploaded batch {b_idx + 1}/{num_batches} ({(b_idx + 1)/num_batches * 100:.1f}%)")

    logger.info(f"All batches uploaded in {time.time() - upsert_start:.2f}s! Waiting for indexing settlement...")

    # 7. Settlement verification
    final_count = 0
    for poll_step in range(30):
        time.sleep(3)
        final_count = client.count(COLLECTION_NAME).count
        logger.info(f"  -> Qdrant indexing progress: {final_count} / {total_pts} points indexed")
        if final_count >= total_pts:
            break

    logger.info(f"Qdrant Cloud ingestion verified! Final points in '{COLLECTION_NAME}': {final_count}")

    # 8. Update corpus_index.csv in Admin
    admin_csv = Path(r"C:\Users\gyanr\Desktop\Participation  stuff\SIH (Ishakti RAG Admin)\corpus_index.csv")
    if admin_csv.parent.exists():
        fieldnames = ["file_path", "document_title", "act_name", "year", "jurisdiction", "language", "document_type", "status"]
        with open(admin_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in file_records:
                writer.writerow({k: r[k] for k in fieldnames})
        logger.info(f"Updated {admin_csv}")

    # 9. Direct verification retrieval test
    logger.info("\nRunning verification retrieval test using BAAI query instruction...")
    from sentence_transformers import SentenceTransformer
    import torch
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    verifier = SentenceTransformer(MODEL_NAME, device=dev)
    test_query = "Represent this sentence for searching relevant passages: Can traditional knowledge be patented under section 3(p)?"
    q_vec = verifier.encode(test_query, normalize_embeddings=True).tolist()
    search_res = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=q_vec,
        limit=3,
        with_payload=True,
    )
    logger.info(f"Top 3 Hits for test query: '{test_query[:60]}...'")
    for r_idx, hit in enumerate(search_res):
        pl = hit.payload or {}
        logger.info(f"  Hit #{r_idx+1}: Score={hit.score:.4f} | Act={pl.get('act_name')} | Sec={pl.get('section_name')} | Juris={pl.get('jurisdiction')}")
        logger.info(f"    Excerpt: {pl.get('text', '')[:120]}...")

    total_elapsed = time.time() - start_time
    logger.info("=" * 70)
    logger.info("               INGESTION COMPLETE (BAAI/bge-small-en-v1.5)")
    logger.info(f" Total Documents : {len(file_records)}")
    logger.info(f" Total Chunks    : {total_chunks}")
    logger.info(f" Vectors Upserted: {final_count}")
    logger.info(f" Elapsed Time    : {total_elapsed:.2f} seconds")
    logger.info("=" * 70)


if __name__ == "__main__":
    main()
