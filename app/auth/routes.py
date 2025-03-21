from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.core.security import hash_password, verify_password, create_access_token

from app.auth.models import User
from app.auth.schemas import UserCreate, UserResponse, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user_data.password)

    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        hashed_password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=TokenResponse)
def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Increase failed attempts
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 3:
                user.is_locked = True
            db.commit()

        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.is_locked:
        raise HTTPException(status_code=403, detail="Account locked due to multiple failed login attempts")

    # Reset failed attempts after successful login
    user.failed_login_attempts = 0
    db.commit()

    # Generate JWT token
    access_token = create_access_token({"sub": user.email}, timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}