from pydantic import BaseModel
from typing import List, Optional

class CashbackRuleResponse(BaseModel):
    id: int
    category: str
    base_cashback_rate_bps: int
    base_cashback_rate_pct: float
    base_monthly_cap_paise: int
    base_monthly_cap_rupees: float

    prime_cashback_rate_pct: float
    prime_monthly_cap_rupees: float
    premium_cashback_rate_pct: float
    premium_monthly_cap_rupees: float

    class Config:
        from_attributes = True

class MonthlyCashbackItem(BaseModel):
    category: str
    month: int
    year: int
    cashback_used_paise: int
    cashback_used_rupees: float
    cap_paise: int
    cap_rupees: float
    remaining_paise: int
    remaining_rupees: float

class CashbackSummaryResponse(BaseModel):
    membership_tier: str
    rate_multiplier: float
    cap_multiplier: float
    total_lifetime_cashback_paise: int
    total_lifetime_cashback_rupees: float
    current_month: int
    current_year: int
    current_month_total_cashback_paise: int
    current_month_total_cashback_rupees: float
    category_usages: List[MonthlyCashbackItem]
