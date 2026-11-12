from pydantic import BaseModel, Field
from typing import Optional

class MerchantResponse(BaseModel):
    id: int
    merchant_name: str
    category: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class MerchantCreate(BaseModel):
    merchant_name: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    is_active: bool = True

class MerchantUpdate(BaseModel):
    merchant_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
