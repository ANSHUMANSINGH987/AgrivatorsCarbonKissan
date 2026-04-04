import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon-Kisan API"
    API_V1_STR: str = "/api"
    
    # Secrets - Loaded from .env file or environment variables
    # Made optional with empty string defaults for development mode
    GEMINI_API_KEY: str = ""
    GEE_PROJECT_ID: str = ""
    # NOTE: FIREBASE_CREDENTIALS_PATH is NOT read from .env, it's computed at runtime
    # This ensures it always finds the file regardless of working directory or .env settings

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

    @property
    def FIREBASE_CREDENTIALS_PATH(self) -> str:
        """Returns the absolute path to Firebase credentials, computed at runtime."""
        return str(BASE_DIR / "firebase-adminsdk.json")

settings = Settings()