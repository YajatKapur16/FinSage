from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, ExpiredSignatureError
from app.database import get_db, SessionLocal
from app.auth.models import User
from app.core.security import verify_access_token
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Use HTTPBearer for proper bearer token handling
security = HTTPBearer(
    auto_error=False,  # Don't automatically raise errors
    description="JWT Bearer token authentication"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user based on the JWT token.
    Raises appropriate HTTP exceptions for authentication/authorization failures.
    """
    if not credentials:
        logger.warning("Missing authentication credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        # Extract token from credentials
        token = credentials.credentials
        # Verify token and get payload
        payload = verify_access_token(token)
        if not payload:
            logger.warning("Invalid authentication token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Extract email (subject) from token
        email = payload.get("sub")
        if not email:
            logger.warning("Missing email in token payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Get user from database
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.warning(f"User not found: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )

        # Check if account is locked
        if user.is_locked:
            logger.warning(f"Access attempted on locked account: {email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is locked. Please contact support.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return user
    except HTTPException:
        # Re-raise HTTP exceptions as they already have proper status codes
        raise
    except ExpiredSignatureError:
        # Handle token expiration specifically
        logger.warning("JWT token has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except JWTError as jwt_error:
        # JWT-specific errors
        logger.error(f"JWT error: {str(jwt_error)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        # Unexpected errors
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify the current user has admin privileges.
    """
    if not current_user.is_admin:
        logger.warning(f"Admin access attempt by non-admin user: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
