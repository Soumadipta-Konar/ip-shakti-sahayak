from pathlib import Path

admin_test = Path(r"c:\Users\gyanr\Desktop\Participation  stuff\SIH (Ishakti RAG Admin)\backend\tests\test_admin_api.py")
code = admin_test.read_text(encoding="utf-8")

old_code = """def test_corpus_clear_endpoint():
    # Test that /api/corpus/clear resets the index successfully
    response = client.post("/api/corpus/clear")"""

new_code = """def test_corpus_clear_endpoint():
    # Test that /api/corpus/clear resets the index successfully
    from unittest.mock import patch
    with patch("app.services.etl.etl_ingestion_pipeline.ETLIngestionPipeline.reset_databases", return_value={"qdrant_reset": True, "neo4j_reset": True}):
        response = client.post("/api/corpus/clear")"""

if old_code in code:
    code = code.replace(old_code, new_code, 1)
    admin_test.write_text(code, encoding="utf-8")
    print("Successfully patched test_admin_api.py to mock reset_databases!")
else:
    print("Pattern not found, check test_admin_api.py content")
