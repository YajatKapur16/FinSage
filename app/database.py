import os
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, DatabaseError
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
from app.core.config import DATABASE_URL, get_env_variable
import logging
import time
from typing import Generator

logger = logging.getLogger(__name__)

# Database configuration
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds
POOL_SIZE = int(get_env_variable("DB_POOL_SIZE", "5"))
MAX_OVERFLOW = int(get_env_variable("DB_MAX_OVERFLOW", "10"))
POOL_TIMEOUT = int(get_env_variable("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(get_env_variable("DB_POOL_RECYCLE", "3600"))

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_recycle=POOL_RECYCLE,
    pool_pre_ping=True  # Enable connection health checks
)

# Configure session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for SQLAlchemy models
Base = declarative_base()

@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """Context manager for database sessions with retry logic"""
    retries = 0
    last_error = None

    while retries < MAX_RETRIES:
        db = SessionLocal()
        try:
            yield db
            break
        except SQLAlchemyError as e:
            last_error = e
            retries += 1
            logger.warning(f"Database error (attempt {retries}/{MAX_RETRIES}): {str(e)}")
            if retries < MAX_RETRIES:
                time.sleep(RETRY_DELAY)
        finally:
            db.close()

    if retries == MAX_RETRIES:
        logger.error(f"Max database retries reached: {str(last_error)}")
        raise DatabaseError("Could not establish database connection")

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database sessions"""
    with get_db_context() as db:
        yield db

# Event listeners for connection pool
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    logger.info("New database connection established")

@event.listens_for(engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    logger.debug("Database connection checked out from pool")

@event.listens_for(engine, "checkin")
def checkin(dbapi_connection, connection_record):
    logger.debug("Database connection returned to pool")

def verify_database():
    """Verify database connection on startup"""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1")).fetchone()
        logger.info("Database connection verified successfully")
        return True
    except SQLAlchemyError as e:
        logger.error(f"Database connection verification failed: {str(e)}")
        return False