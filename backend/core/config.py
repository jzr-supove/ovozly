"""
Ovozly Backend - Configuration Management

This module handles application configuration using Pydantic settings.
Environment variables are loaded from a .env file and validated at startup.
"""

import sys
from pathlib import Path

from dotenv import load_dotenv
from loguru import logger
from pydantic import field_validator
from pydantic_settings import BaseSettings


__all__ = ["settings"]

# Load environment variables from .env file with override enabled
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path, override=True)


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    Attributes:
        DATABASE_URL: PostgreSQL connection string
        REDIS_URL: Redis connection string for Celery broker
        JWT_KEY: Secret key for JWT token signing
        DEBUG: Enable debug mode and verbose logging
        BUCKET_NAME: Google Cloud Storage bucket name
        PYANNOTEAI_TOKEN: API token for PyAnnote AI diarization
        OPENAI_API_KEY: OpenAI API key for conversation analysis
        AISHA_API_KEY: AISHA STT service API key
    """
    DATABASE_URL: str
    REDIS_URL: str
    JWT_KEY: str
    DEBUG: bool
    BUCKET_NAME: str = "ovozly_bucket"
    PYANNOTEAI_TOKEN: str
    OPENAI_API_KEY: str
    AISHA_API_KEY: str

    @field_validator("DEBUG", mode="before")
    def validate_debug(cls, value):
        truthy_values = {"1", "true", "yes", "y", "on"}
        if isinstance(value, str):
            return value.strip().lower() in truthy_values
        return bool(value)

    # Note: Pydantic's built-in env_file config doesn't detect .env updates on reload.
    # Using manual load_dotenv with override=True instead for hot-reload support.


settings = Settings()

# Remove the default logger and re-add it with the chosen level
logger.remove()
logger.add(
    sink=sys.stderr,
    level="DEBUG" if settings.DEBUG else "INFO",
    format="{time:YY-MM-DD HH:mm:ss} | {level} | {message}",
    colorize=True,
)
logger.debug("Logger has been configured")


if __name__ == "__main__":
    print(settings)
