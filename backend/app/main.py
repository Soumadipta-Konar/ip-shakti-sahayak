from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.config import settings
from app.services.agent import get_qdrant_client


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Multi-Agent LangGraph RAG Platform for Ayurvedic Intellectual Property Rights"
    )

    # Dynamic CORS Configuration for Vercel, Local, & Custom Domains
    cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    if not cors_origins or "*" in cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["*"],
        )
    else:
        dev_origins = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
        for o in dev_origins:
            if o not in cors_origins:
                cors_origins.append(o)

        app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["*"],
        )

    app.include_router(router, prefix="/api/v1")

    @app.get("/")
    @app.get("/health")
    @app.get("/api/v1/health")
    def health_check():
        # Check Qdrant Cloud
        qdrant_status = "disconnected"
        try:
            client = get_qdrant_client()
            if client:
                qdrant_status = "connected (Statutory Legal Library Active)"
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

if __name__ == "__main__":
    import os
    import uvicorn
    # Dynamically bind to PORT assigned by Render, Cloud Run, or fallback to config
    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
