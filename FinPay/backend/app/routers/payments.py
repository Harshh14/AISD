from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.payment import PaymentRequest, TransactionResponse
from app.services.payment_service import process_payment
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.merchant_repository import MerchantRepository
from app.utils.auth import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/payments", tags=["Payments"])

def _format_tx(tx) -> dict:
    merchant_name = tx.merchant.merchant_name if tx.merchant else ("Wallet Top-up" if tx.transaction_type == "topup" else "Unknown")
    merchant_category = tx.merchant.category if tx.merchant else ("Top-up" if tx.transaction_type == "topup" else "General")
    user_name = tx.user.name if tx.user else "Unknown"
    return {
        "id": tx.id,
        "user_id": tx.user_id,
        "wallet_id": tx.wallet_id,
        "merchant_id": tx.merchant_id,
        "merchant_name": merchant_name,
        "merchant_category": merchant_category,
        "user_name": user_name,
        "transaction_type": tx.transaction_type,
        "amount_paise": tx.amount_paise,
        "amount_rupees": tx.amount_paise / 100.0,
        "cashback_paise": tx.cashback_paise,
        "cashback_rupees": tx.cashback_paise / 100.0,
        "idempotency_key": tx.idempotency_key,
        "status": tx.status,
        "created_at": tx.created_at
    }

@router.post("", response_model=TransactionResponse)
def make_payment(
    req: PaymentRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    if req.amount_paise is not None:
        amount_paise = req.amount_paise
    elif req.amount_rupees is not None:
        amount_paise = int(round(req.amount_rupees * 100))
    else:
        raise HTTPException(status_code=400, detail="Must provide amount_rupees or amount_paise")

    tx = process_payment(
        db=db,
        user_id=current_user.id,
        merchant_id=req.merchant_id,
        amount_paise=amount_paise,
        idempotency_key=req.idempotency_key
    )
    return _format_tx(tx)

@router.get("/me", response_model=List[TransactionResponse])
def get_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx_repo = TransactionRepository(db)
    if current_user.role == "merchant":
        # Match merchant user to their merchant store by name/category
        merchants = MerchantRepository(db).list_all()
        merchant_match = None
        user_lower = current_user.name.lower().replace(" ", "")
        email_prefix = current_user.email.split("@")[0].lower()
        for m in merchants:
            m_lower = m.merchant_name.lower().replace(" ", "")
            cat_lower = m.category.lower()
            if m_lower in user_lower or user_lower in m_lower or cat_lower in email_prefix:
                merchant_match = m
                break
        if merchant_match:
            txs = tx_repo.list_by_merchant(merchant_match.id)
        else:
            txs = []
        return [_format_tx(t) for t in txs]

    txs = tx_repo.list_by_user(current_user.id)
    return [_format_tx(t) for t in txs]

@router.get("/merchant/{merchant_id}", response_model=List[TransactionResponse])
def get_merchant_transactions(
    merchant_id: int,
    current_user: User = Depends(require_role("merchant", "admin")),
    db: Session = Depends(get_db)
):
    tx_repo = TransactionRepository(db)
    txs = tx_repo.list_by_merchant(merchant_id)
    return [_format_tx(t) for t in txs]

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx_repo = TransactionRepository(db)
    tx = tx_repo.get_by_id(transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    if current_user.role == "student" and tx.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return _format_tx(tx)
