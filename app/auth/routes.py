from fastapi import APIRouter, Depends, HTTPException, status, Body, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import schemas
from app.auth.middleware import get_current_user, get_admin_user
from app.auth.models import User
from app.core.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, verify_refresh_token
)
import re
from typing import List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=schemas.UserResponse, 
             status_code=status.HTTP_201_CREATED)
async def register(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        # Validate email format
        email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_pattern, user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        # Check existing user
        if db.query(User).filter(User.email == user_create.email).first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Check password strength
        if len(user_create.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )

        # Create new user
        new_user = User(
            email=user_create.email,
            first_name=user_create.first_name,
            last_name=user_create.last_name,
            phone_number=user_create.phone_number,
            hashed_password=hash_password(user_create.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return schemas.UserResponse.model_validate(new_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user account"
        )

@router.post("/login", response_model=schemas.TokenPair)
async def login(
    login_request: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    """Login to get access and refresh tokens"""
    try:
        user = db.query(User).filter(User.email == login_request.email).first()
        
        # Check if account exists
        if not user:
            logger.warning(f"Login attempt with non-existent email: {login_request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check account status first
        if user.is_locked:
            logger.warning(f"Login attempt on locked account: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,  # Ensure correct status code for locked accounts
                detail="Account is locked. Please contact support."
            )
        
        # Validate password
        if not verify_password(login_request.password, user.hashed_password):
            # Increment failed login attempts
            user.failed_login_attempts += 1
            
            # Lock account if threshold reached
            if user.failed_login_attempts >= 3:
                user.is_locked = True
                logger.warning(f"Account locked for user: {user.email} after {user.failed_login_attempts} failed attempts")
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account locked due to multiple failed login attempts. Please contact support."
                )
                
            db.commit()
            logger.warning(f"Failed login for user: {user.email} (attempt {user.failed_login_attempts})")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Reset failed attempts and generate tokens
        user.failed_login_attempts = 0
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create both access and refresh tokens
        token_data = {"sub": user.email}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f"Successful login for user: {user.email}")
        return schemas.TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login process failed"
        )

@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    """Get a new access token using a refresh token"""
    try:
        payload = verify_refresh_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        user = db.query(User).filter(User.email == payload.get("sub")).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        if user.is_locked:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is locked"
            )

        access_token = create_access_token({"sub": user.email})
        return schemas.Token(access_token=access_token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not refresh token"
        )

@router.post("/admin/register", status_code=status.HTTP_201_CREATED,
             summary="Register a new admin user",
             description="Creates a new admin account with elevated privileges")
async def register_admin(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new admin user with full system access.
    """
    # Check if email is in a valid format
    email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_pattern, user_create.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create new admin user
    hashed_password = hash_password(user_create.password)
    new_user = User(
        email=user_create.email,
        first_name=user_create.first_name,
        last_name=user_create.last_name,
        phone_number=user_create.phone_number,
        hashed_password=hashed_password,
        is_admin=True  # Set as admin
    )
    db.add(new_user)
    db.commit()

    return {"message": "Admin registered successfully"}

@router.get("/users/me", response_model=schemas.UserDetail,
            summary="Get current user details",
            description="Returns information about the currently authenticated user")
async def get_user_me(current_user: User = Depends(get_current_user)):
    """
    Get details about the currently authenticated user.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone_number": current_user.phone_number,
        "is_admin": current_user.is_admin
    }

@router.get("/users", response_model=List[schemas.UserDetail],
            summary="List all users (Admin only)",
            description="Returns a list of all users in the system")
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Get a list of all registered users (admin access required).
    """
    users = db.query(User).all()
    return users