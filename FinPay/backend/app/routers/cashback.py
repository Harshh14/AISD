from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List
from app.database import get_db
from app.schemas.cashback import CashbackRuleResponse, CashbackSummaryResponse, MonthlyCashbackItem
from app.repositories.cashback_repository import CashbackRepository
from app.repositories.transaction_repository import TransactionRepository
from app.services.cashback_service import TIER_MULTIPLIERS
from app.utils.auth import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/cashback", tags=["Cashback"])

@router.get("/rules", response_model=List[CashbackRuleResponse])
def get_cashback_rules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = CashbackRepository(db)
    rules = repo.list_rules()
    result = []
    for r in rules:
        base_pct = r.base_cashback_rate_bps / 100.0
        base_cap = r.base_monthly_cap_paise / 100.0

        prime_pct = (r.base_cashback_rate_bps * 150 // 100) / 100.0
        prime_cap = (r.base_monthly_cap_paise * 150 // 100) / 100.0

        premium_pct = (r.base_cashback_rate_bps * 200 // 100) / 100.0
        premium_cap = (r.base_monthly_cap_paise * 200 // 100) / 100.0

        result.append({
            "id": r.id,
            "category": r.category,
            "base_cashback_rate_bps": r.base_cashback_rate_bps,
            "base_cashback_rate_pct": base_pct,
            "base_monthly_cap_paise": r.base_monthly_cap_paise,
            "base_monthly_cap_rupees": base_cap,
            "prime_cashback_rate_pct": prime_pct,
            "prime_monthly_cap_rupees": prime_cap,
            "premium_cashback_rate_pct": premium_pct,
            "premium_monthly_cap_rupees": premium_cap
        })
    return result

@router.get("/summary", response_model=CashbackSummaryResponse)
def get_cashback_summary(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    cb_repo = CashbackRepository(db)
    tx_repo = TransactionRepository(db)

    now = datetime.now(timezone.utc)
    tier = current_user.membership_tier or "BASIC"
    mult = TIER_MULTIPLIERS.get(tier, TIER_MULTIPLIERS["BASIC"])

    lifetime_paise = tx_repo.sum_cashback_by_user(current_user.id)
    rules = cb_repo.list_rules()
    usages = cb_repo.list_monthly_usages_by_user(current_user.id, now.month, now.year)
    usage_map = {u.category: u.cashback_used_paise for u in usages}

    items = []
    month_total_paise = 0
    for r in rules:
        used_paise = usage_map.get(r.category, 0)
        month_total_paise += used_paise
        eff_cap_paise = (r.base_monthly_cap_paise * mult["cap"]) // 100
        rem_paise = max(0, eff_cap_paise - used_paise)

        items.append({
            "category": r.category,
            "month": now.month,
            "year": now.year,
            "cashback_used_paise": used_paise,
            "cashback_used_rupees": used_paise / 100.0,
            "cap_paise": eff_cap_paise,
            "cap_rupees": eff_cap_paise / 100.0,
            "remaining_paise": rem_paise,
            "remaining_rupees": rem_paise / 100.0
        })

    return {
        "membership_tier": tier,
        "rate_multiplier": mult["rate"] / 100.0,
        "cap_multiplier": mult["cap"] / 100.0,
        "total_lifetime_cashback_paise": lifetime_paise,
        "total_lifetime_cashback_rupees": lifetime_paise / 100.0,
        "current_month": now.month,
        "current_year": now.year,
        "current_month_total_cashback_paise": month_total_paise,
        "current_month_total_cashback_rupees": month_total_paise / 100.0,
        "category_usages": items
    }

@router.get("/history")
def get_cashback_history(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    tx_repo = TransactionRepository(db)
    txs = tx_repo.list_by_user(current_user.id)
    # Filter transactions that earned cashback
    cb_txs = [t for t in txs if t.cashback_paise > 0]
    return [
        {
            "id": t.id,
            "merchant_name": t.merchant.merchant_name if t.merchant else "Campus Merchant",
            "category": t.merchant.category if t.merchant else "General",
            "amount_rupees": t.amount_paise / 100.0,
            "cashback_rupees": t.cashback_paise / 100.0,
            "created_at": t.created_at
        }
        for t in cb_txs
    ]
