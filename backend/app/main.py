from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import settings
from app.services.agent import get_qdrant_client, get_groq_client


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Multi-Agent LangGraph RAG Platform for Ayurvedic Intellectual Property Rights"
    )

    # Set up CORS for the Next.js frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router, prefix="/api/v1")

    @app.get("/health")
    @app.get("/api/v1/health")
    def health_check():
        # Check Qdrant Cloud
        qdrant_status = "disconnected"
        chunk_count = 0
        try:
            client = get_qdrant_client()
            if client:
                chunk_count = client.count(settings.QDRANT_COLLECTION_NAME).count
                qdrant_status = f"connected ({chunk_count} legal chunks)"
        except Exception as e:
            qdrant_status = f"error: {e}"

        groq_status = "available" if bool(settings.GROQ_API_KEY) else "unconfigured"

        return {
            "status": "ok",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "database_health": {
                "qdrant": qdrant_status,
                "groq": groq_status,
                "embedding_model": settings.EMBEDDING_MODEL_NAME,
            }
        }

    return app


app = create_app()
