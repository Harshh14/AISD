from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.cashback_repository import CashbackRepository

TIER_MULTIPLIERS = {
    "BASIC": {"rate": 100, "cap": 100},
    "PRIME": {"rate": 150, "cap": 150},
    "PREMIUM": {"rate": 200, "cap": 200},
}

def calculate_cashback(
    amount_paise: int,
    category: str,
    membership_tier: str,
    base_rate_bps: int,
    base_cap_paise: int,
    current_month_used_paise: int
) -> int:
    """
    Pure calculation function.
    1. Receive payment amount in paise.
    2. Receive merchant category.
    3. Receive student's membership tier.
    4. Calculate rate using tier multiplier.
    5. Calculate raw cashback with integer floor division.
    6. Check remaining monthly cashback cap.
    7. Return final cashback in paise.
    
    Does NOT modify the database.
    """
    if amount_paise <= 0 or base_rate_bps <= 0 or base_cap_paise <= 0:
        return 0

    tier = membership_tier.upper() if membership_tier else "BASIC"
    mult = TIER_MULTIPLIERS.get(tier, TIER_MULTIPLIERS["BASIC"])

    # Effective rate in basis points (1% = 100 bps, 100% = 10000 bps)
    # Using integer arithmetic: (base_bps * multiplier) // 100
    effective_rate_bps = (base_rate_bps * mult["rate"]) // 100

    # Raw cashback in paise: (amount_paise * effective_rate_bps) // 10000 (floor division)
    raw_cashback_paise = (amount_paise * effective_rate_bps) // 10000

    # Effective monthly cap in paise: (base_cap_paise * multiplier) // 100
    effective_cap_paise = (base_cap_paise * mult["cap"]) // 100

    # Remaining cap in paise
    remaining_cap_paise = effective_cap_paise - current_month_used_paise
    if remaining_cap_paise <= 0:
        return 0

    return min(raw_cashback_paise, remaining_cap_paise)

def get_applicable_cashback(
    db: Session,
    user_id: int,
    membership_tier: str,
    category: str,
    amount_paise: int,
    dt: Optional[datetime] = None
) -> int:
    repo = CashbackRepository(db)
    rule = repo.get_rule_by_category(category)
    if not rule or rule.base_cashback_rate_bps <= 0:
        return 0

    now = dt or datetime.now(timezone.utc)
    usage = repo.get_monthly_usage(user_id, category, now.month, now.year)
    used_paise = usage.cashback_used_paise if usage else 0

    return calculate_cashback(
        amount_paise=amount_paise,
        category=category,
        membership_tier=membership_tier,
        base_rate_bps=rule.base_cashback_rate_bps,
        base_cap_paise=rule.base_monthly_cap_paise,
        current_month_used_paise=used_paise
    )
