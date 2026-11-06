"""Application Configuration Module."""
import os
import secrets
from pathlib import Path
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Global configuration settings for Ask Your Data backend."""

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "Ask Your Data"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    # 32-byte Fernet key base64 urlsafe encoded
    ENCRYPTION_KEY: str = "dGhpcy1pcy1hLTMyLWJ5dGUtZmVybmV0LWtleS0xMjM0NTY="
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    COOKIE_SECURE: bool = False  # Set to True in production (HTTPS)
    COOKIE_SAMESITE: str = "lax"
    AUTH_REQUIRED: bool = False  # Set to True to enforce mandatory login gate

    # Metadata Database (PostgreSQL)
    METADATA_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/askyourdata"
    METADATA_DATABASE_SYNC_URL: str = "postgresql://postgres:postgres@localhost:5432/askyourdata"

    # Redis Cache & Broker
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # DuckDB Internal Columnar Storage
    DUCKDB_DATABASE_PATH: str = "/data/askyourdata.duckdb"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("DUCKDB_DATABASE_PATH", mode="after")
    @classmethod
    def resolve_duckdb_path(cls, v: str) -> str:
        if v.startswith("."):
            return str((BACKEND_DIR / v).resolve())
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    # Initial Admin Seed
    ADMIN_EMAIL: str = "admin@askyourdata.local"
    ADMIN_PASSWORD: str = "admin123456"

    # Limits and Guardrails
    MAX_UPLOAD_SIZE_MB: int = 200
    STATEMENT_TIMEOUT_SECONDS: int = 30
    DEFAULT_ROW_LIMIT: int = 10000

    # AI Configuration (Disabled by default)
    AI_ENABLED: bool = False
    LLM_PROVIDER: str = "anthropic"
    LLM_MODEL: str = "claude-3-5-sonnet-20241022"
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    SEND_SAMPLE_ROWS_TO_LLM: bool = False


settings = Settings()

