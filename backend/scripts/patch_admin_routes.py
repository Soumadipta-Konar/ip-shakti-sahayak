from pathlib import Path
import re

routes_path = Path(r"c:\Users\gyanr\Desktop\Participation  stuff\SIH (Ishakti RAG Admin)\backend\app\api\routes.py")
content = routes_path.read_text(encoding="utf-8")

old_stats_func = """def get_system_stats():
    \"\"\"
    Returns verified system statistics:
    - Total registered documents in corpus_index.csv
    - Real points/chunks count in Qdrant collection
    - Ingestion status counts (Pending, Ingested, Failed)
    \"\"\"
    candidate_paths = [
        Path("corpus_index.csv"),
        Path("../corpus_index.csv"),
        Path("../../corpus_index.csv"),
    ]
    csv_path = next((p for p in candidate_paths if p.exists()), None)
    total_docs = 0
    status_counts = {"Pending": 0, "Ingested": 0, "Failed": 0}
    if csv_path:
        try:
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    total_docs += 1
                    st = (row.get("status") or "Pending").strip()
                    status_counts[st] = status_counts.get(st, 0) + 1
        except Exception:
            pass

    qdrant_chunks_count = 0
    qdrant_connected = False
    try:
        from qdrant_client import QdrantClient
        port = 443 if settings.QDRANT_URL.startswith("https://") else None
        client_kwargs = {"url": settings.QDRANT_URL, "timeout": 4.0}
        if port:
            client_kwargs["port"] = port
        if settings.QDRANT_API_KEY:
            client_kwargs["api_key"] = settings.QDRANT_API_KEY
        qc = QdrantClient(**client_kwargs)
        col_info = qc.get_collection(settings.QDRANT_COLLECTION_NAME)
        qdrant_chunks_count = col_info.points_count or 0
        qdrant_connected = True
    except Exception:
        qdrant_chunks_count = 0
        qdrant_connected = False

    return {
        "total_documents": total_docs,
        "total_chunks": qdrant_chunks_count,
        "status_breakdown": status_counts,
        "qdrant_connected": qdrant_connected,
        "collection_name": settings.QDRANT_COLLECTION_NAME,
    }"""

new_stats_func = """def get_system_stats():
    \"\"\"
    Returns verified system statistics:
    - Total registered documents in corpus_index.csv
    - Real points/chunks count in Qdrant collection
    - Ingestion status counts (Pending, Ingested, Failed)
    \"\"\"
    candidate_paths = [
        Path("corpus_index.csv"),
        Path("../corpus_index.csv"),
        Path("../../corpus_index.csv"),
        Path(r"c:\\Users\\gyanr\\Desktop\\Participation  stuff\\SIH (Ishakti RAG Admin)\\corpus_index.csv"),
    ]
    csv_path = next((p for p in candidate_paths if p.exists()), None)
    total_docs = 0
    status_counts = {"Pending": 0, "Ingested": 0, "Failed": 0}
    if csv_path:
        try:
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    total_docs += 1
                    st = (row.get("status") or "Pending").strip()
                    status_counts[st] = status_counts.get(st, 0) + 1
        except Exception:
            pass

    qdrant_chunks_count = 0
    qdrant_connected = False
    try:
        from qdrant_client import QdrantClient
        port = 443 if settings.QDRANT_URL.startswith("https://") else None
        client_kwargs = {"url": settings.QDRANT_URL, "timeout": 8.0}
        if port:
            client_kwargs["port"] = port
        if settings.QDRANT_API_KEY:
            client_kwargs["api_key"] = settings.QDRANT_API_KEY
        qc = QdrantClient(**client_kwargs)
        try:
            qdrant_chunks_count = qc.count(settings.QDRANT_COLLECTION_NAME).count
        except Exception:
            col_info = qc.get_collection(settings.QDRANT_COLLECTION_NAME)
            qdrant_chunks_count = col_info.points_count or 0
        qdrant_connected = True
    except Exception as qe:
        qdrant_chunks_count = 0
        qdrant_connected = False

    return {
        "total_documents": total_docs,
        "total_chunks": qdrant_chunks_count,
        "status_breakdown": status_counts,
        "qdrant_connected": qdrant_connected,
        "collection_name": settings.QDRANT_COLLECTION_NAME,
    }"""

if old_stats_func in content:
    content = content.replace(old_stats_func, new_stats_func, 1)
    routes_path.write_text(content, encoding="utf-8")
    print("Successfully updated get_system_stats in admin routes.py!")
else:
    print("Could not match old_stats_func directly, using regex replacement")
    pattern = r"def get_system_stats\(\):.*?return \{.*?\}"
    m = re.search(pattern, content, re.DOTALL)
    if m:
        content = content[:m.start()] + new_stats_func + content[m.end():]
        routes_path.write_text(content, encoding="utf-8")
        print("Successfully updated get_system_stats via regex in admin routes.py!")
    else:
        print("Regex match also failed!")
