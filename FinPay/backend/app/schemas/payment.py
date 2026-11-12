from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PaymentRequest(BaseModel):
    merchant_id: int
    amount_rupees: Optional[float] = None
    amount_paise: Optional[int] = None
    idempotency_key: str = Field(..., min_length=4, max_length=100)

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    wallet_id: int
    merchant_id: Optional[int] = None
    merchant_name: Optional[str] = None
    merchant_category: Optional[str] = None
    user_name: Optional[str] = None
    transaction_type: str
    amount_paise: int
    amount_rupees: float
    cashback_paise: int
    cashback_rupees: float
    idempotency_key: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
