from pydantic import BaseModel, Field
from typing import Dict, Any

class AdminDashboardResponse(BaseModel):
    total_students: int
    total_merchants: int
    total_transactions: int
    total_payment_amount_paise: int
    total_payment_amount_rupees: float
    total_cashback_distributed_paise: int
    total_cashback_distributed_rupees: float
    tier_distribution: Dict[str, int]

class UpdateTierRequest(BaseModel):
    membership_tier: str = Field(..., pattern="^(BASIC|PRIME|PREMIUM)$")
