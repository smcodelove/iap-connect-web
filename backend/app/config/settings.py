"""
Settings configuration for IAP Connect application.
Loads environment variables and application settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        database_url: PostgreSQL database connection string
        secret_key: Secret key for JWT token generation
        algorithm: JWT algorithm (default: HS256)
        access_token_expire_minutes: JWT token expiration time
        cors_origins: Allowed CORS origins for API access
    """
    
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_origins: str
    
    class Config:
        env_file = ".env"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()