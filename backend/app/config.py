import os
from pathlib import Path

# Load .env file if present (graceful — no error if missing)
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass  # python-dotenv not installed; rely on system environment variables


class Settings:
    PROJECT_NAME: str = "SentinelAI – AI-Powered Cyber Threat Correlation & Autonomous Fraud Prevention"
    VERSION: str = "1.0.0"

    # Database — defaults to a local SQLite file; override via DATABASE_URL env var
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{Path(__file__).resolve().parents[1] / 'sentinel.db'}"
    )

    # JWT authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sentinel-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "600"))

    # Google Gemini AI — optional; falls back to mock AI explanations if absent
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)

    # CORS — allow Vite dev server by default
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]


settings = Settings()
