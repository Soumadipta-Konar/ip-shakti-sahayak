from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "IP-SAKTI Sahayak"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # AI & LLM Services
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_FAST_MODEL: str = "qwen/qwen3.8-27b"
    OPENAI_API_KEY: str = ""
    BHASHINI_API_KEY: str = ""

    @field_validator("GROQ_MODEL", mode="before")
    @classmethod
    def normalize_groq_model(cls, v: str) -> str:
        if not v:
            return "openai/gpt-oss-120b"
        v = v.strip()
        if v in ("gpt-oss-120b", "openai-gpt-oss-120b"):
            return "openai/gpt-oss-120b"
        if v in ("gpt-oss-20b", "openai-gpt-oss-20b"):
            return "openai/gpt-oss-20b"
        return v

    @field_validator("GROQ_FAST_MODEL", mode="before")
    @classmethod
    def normalize_groq_fast_model(cls, v: str) -> str:
        if not v:
            return "qwen/qwen3.8-27b"
        v = v.strip()
        if v in ("qwen3.8-27b", "qwen-3.8-27b", "qwen_3.8_27b"):
            return "qwen/qwen3.8-27b"
        return v

    # Embedding and Vector Ingestion Alignment
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIMENSION: int = 384
    EMBEDDING_METRIC: str = "Cosine"
    QDRANT_COLLECTION_NAME: str = "legal_chunks"

    # Vector Database (Qdrant Cloud / Local fallback)
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    LOCAL_QDRANT_PATH: str = ""

    # Knowledge Graph (Neo4j)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASS: str = "ipsakti_secret_password"

    # Celery and Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Data Sources
    RAW_DATA_DRIVE_URL: str = ""

    # Server & Deployment
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env", "../.env", "../../.env"),
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
