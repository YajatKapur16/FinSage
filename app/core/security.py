from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt, ExpiredSignatureError
import os
from dotenv import load_dotenv
import logging
import secrets

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Constants for JWT
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Generate a secure random key if none is set
    SECRET_KEY = secrets.token_urlsafe(32)
    logger.warning("No SECRET_KEY set in environment. Generated random key.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    if not password:
        raise ValueError("Password cannot be empty")
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create a new JWT access token."""
    try:
        to_encode = data.copy()
        if not to_encode.get("sub"):
            raise ValueError("Token must include 'sub' claim")

        expire = datetime.now(timezone.utc) + (
            expires_delta if expires_delta
            else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access"
        })
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Token creation error: {str(e)}")
        raise

def create_refresh_token(data: dict) -> str:
    """Create a new JWT refresh token."""
    try:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh"
        })
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        logger.error(f"Refresh token creation error: {str(e)}")
        raise

def verify_access_token(token: str) -> dict:
    """Verify a JWT access token and return its payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            logger.warning("Invalid token type")
            return None
        
        # Verify token is not expired (JWT library checks this but we add extra logging)
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            logger.warning("Token has expired")
            return None
            
        return payload
    except ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except JWTError as e:
        logger.error(f"Token validation error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected token error: {str(e)}")
        return None

def verify_refresh_token(token: str) -> dict:
    """Verify a JWT refresh token and return its payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            logger.warning("Invalid refresh token type")
            return None
        return payload
    except ExpiredSignatureError:
        logger.warning("Refresh token has expired")
        return None
    except JWTError as e:
        logger.error(f"Refresh token validation error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected refresh token error: {str(e)}")
        return None