from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str | None = None
    password: constr(min_length=8)  # Ensures password is at least 8 characters

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone_number: str | None

    class Config:
        from_attributes = True  # Allows ORM conversion
