from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str
    membership_tier: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    membership_tier: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
