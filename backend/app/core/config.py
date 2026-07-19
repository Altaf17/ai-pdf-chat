from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "DocMind AI"
    API_VERSION: str = "v1"

    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.0-flash-lite"
    EMBED_MODEL: str = "gemini-embedding-001"

    UPLOAD_FOLDER: str = "uploads"
    VECTOR_STORE_DIR: str = "vector_store"
    MAX_UPLOAD_MB: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()