from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.admin import AdminDashboardResponse, UpdateTierRequest
from app.schemas.auth import UserResponse
from app.schemas.payment import TransactionResponse
from app.schemas.merchant import MerchantResponse
from app.repositories.user_repository import UserRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.transaction_repository import TransactionRepository
from app.utils.auth import require_role
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    merchant_repo = MerchantRepository(db)
    tx_repo = TransactionRepository(db)

    students = user_repo.list_all_students()
    tier_counts = {"BASIC": 0, "PRIME": 0, "PREMIUM": 0}
    for s in students:
        tier = s.membership_tier or "BASIC"
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

    total_pmt_paise = tx_repo.sum_payment_amount()
    total_cb_paise = tx_repo.sum_cashback_distributed()

    return {
        "total_students": user_repo.count_students(),
        "total_merchants": merchant_repo.count(),
        "total_transactions": tx_repo.count_all(),
        "total_payment_amount_paise": total_pmt_paise,
        "total_payment_amount_rupees": total_pmt_paise / 100.0,
        "total_cashback_distributed_paise": total_cb_paise,
        "total_cashback_distributed_rupees": total_cb_paise / 100.0,
        "tier_distribution": tier_counts
    }

@router.get("/students", response_model=List[UserResponse])
def get_students(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    return repo.list_all_students()

@router.put("/students/{student_id}/tier")
def update_student_tier(
    student_id: int,
    req: UpdateTierRequest,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    user = repo.get_by_id(student_id)
    if not user or user.role != "student":
        raise HTTPException(status_code=404, detail="Student not found.")

    repo.update_tier(student_id, req.membership_tier)
    db.commit()
    db.refresh(user)

    return {
        "message": f"Student membership tier updated to {req.membership_tier}",
        "student_id": user.id,
        "name": user.name,
        "new_tier": user.membership_tier
    }

@router.get("/transactions")
def get_all_transactions(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    tx_repo = TransactionRepository(db)
    txs = tx_repo.list_all(limit=200)
    return [
        {
            "id": t.id,
            "user_name": t.user.name if t.user else "Unknown",
            "user_email": t.user.email if t.user else "",
            "merchant_name": t.merchant.merchant_name if t.merchant else ("Wallet Top-up" if t.transaction_type == "topup" else "Unknown"),
            "merchant_category": t.merchant.category if t.merchant else "Top-up",
            "transaction_type": t.transaction_type,
            "amount_rupees": t.amount_paise / 100.0,
            "cashback_rupees": t.cashback_paise / 100.0,
            "idempotency_key": t.idempotency_key,
            "status": t.status,
            "created_at": t.created_at
        }
        for t in txs
    ]

@router.get("/merchants", response_model=List[MerchantResponse])
def get_admin_merchants(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    repo = MerchantRepository(db)
    return repo.list_all(active_only=False)
