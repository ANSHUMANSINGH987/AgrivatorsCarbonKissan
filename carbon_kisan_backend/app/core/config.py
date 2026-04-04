import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the directory where this file is located
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon-Kisan API"
    API_V1_STR: str = "/api"
    
    # Secrets - Loaded from .env file
    GEMINI_API_KEY: str
    GEE_PROJECT_ID: str
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-adminsdk.json"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True
    )

settings = Settings()