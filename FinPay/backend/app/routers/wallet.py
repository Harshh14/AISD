from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.wallet import WalletResponse, TopUpRequest
from app.schemas.payment import TransactionResponse
from app.services.wallet_service import get_student_wallet
from app.services.payment_service import process_topup
from app.utils.auth import require_role
from app.models.user import User

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])

@router.get("", response_model=WalletResponse)
def get_wallet(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    return get_student_wallet(db, current_user.id)

@router.post("/topup", response_model=TransactionResponse)
def topup_wallet(
    req: TopUpRequest,
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db)
):
    # Support both amount_paise and amount_rupees
    if req.amount_paise is not None:
        amount_paise = req.amount_paise
    elif req.amount_rupees is not None:
        amount_paise = int(round(req.amount_rupees * 100))
    else:
        raise HTTPException(status_code=400, detail="Must provide amount_rupees or amount_paise")

    tx = process_topup(
        db=db,
        user_id=current_user.id,
        amount_paise=amount_paise,
        idempotency_key=req.idempotency_key
    )

    return {
        "id": tx.id,
        "user_id": tx.user_id,
        "wallet_id": tx.wallet_id,
        "merchant_id": tx.merchant_id,
        "merchant_name": "Wallet Top-up",
        "merchant_category": "Top-up",
        "user_name": current_user.name,
        "transaction_type": tx.transaction_type,
        "amount_paise": tx.amount_paise,
        "amount_rupees": tx.amount_paise / 100.0,
        "cashback_paise": tx.cashback_paise,
        "cashback_rupees": tx.cashback_paise / 100.0,
        "idempotency_key": tx.idempotency_key,
        "status": tx.status,
        "created_at": tx.created_at
    }
