from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance_paise: int
    balance_rupees: float
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TopUpRequest(BaseModel):
    amount_rupees: Optional[float] = None
    amount_paise: Optional[int] = None
    idempotency_key: str = Field(..., min_length=4, max_length=100)
