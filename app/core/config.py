import logging
from logging.handlers import RotatingFileHandler
import os
from pathlib import Path

def setup_logging():
    """Configure application-wide logging"""
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(os.path.join(log_dir, "app.log")),
            logging.StreamHandler()
        ]
    )

    # Set specific log levels for different components
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("app.expense.ml_service").setLevel(logging.INFO)

# Environment variables
def get_env_variable(key: str, default: str = None) -> str:
    """Get environment variable with validation"""
    value = os.getenv(key, default)
    if value is None:
        raise ValueError(f"Environment variable {key} is not set")
    return value

# Database configuration
DATABASE_URL = get_env_variable(
    "DATABASE_URL",
    "postgresql://dev:devpass@postgres:5432/finsage"
)

# JWT configuration
SECRET_KEY = get_env_variable("SECRET_KEY", None)
ACCESS_TOKEN_EXPIRE_MINUTES = int(get_env_variable("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(get_env_variable("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# ML Model configuration
MODEL_PATH = get_env_variable("MODEL_PATH", "expense_model.pt")

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]