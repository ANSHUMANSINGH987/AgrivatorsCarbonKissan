import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Carbon-Kisan API"
    API_V1_STR: str = "/api"
    
    # Secrets
    GEMINI_API_KEY: str
    GEE_PROJECT_ID: str
    FIREBASE_CREDENTIALS_PATH: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()