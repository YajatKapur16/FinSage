from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone_number: Optional[str] = None
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "strongpass123",
            "phone_number": "+1234567890"
        }
    })

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "email": "user@example.com",
            "password": "strongpass123"
        }
    })

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }
    })

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer"
        }
    })

class UserDetail(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str]
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "current_password": "oldpass123",
            "new_password": "newpass456"
        }
    })