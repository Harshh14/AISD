from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.wallet_repository import WalletRepository

def get_student_wallet(db: Session, user_id: int):
    repo = WalletRepository(db)
    wallet = repo.get_by_user_id(user_id)
    if not wallet:
        wallet = repo.create(user_id=user_id, initial_balance_paise=0)
        db.commit()
        db.refresh(wallet)
    return {
        "id": wallet.id,
        "user_id": wallet.user_id,
        "balance_paise": wallet.balance_paise,
        "balance_rupees": wallet.balance_paise / 100.0,
        "updated_at": wallet.updated_at
    }
