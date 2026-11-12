from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, List
from app.models.transaction import Transaction

class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, transaction_id: int) -> Optional[Transaction]:
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.merchant), joinedload(Transaction.user))
            .filter(Transaction.id == transaction_id)
            .first()
        )

    def get_by_idempotency_key(self, idempotency_key: str) -> Optional[Transaction]:
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.merchant), joinedload(Transaction.user))
            .filter(Transaction.idempotency_key == idempotency_key)
            .first()
        )

    def create(
        self,
        user_id: int,
        wallet_id: int,
        merchant_id: Optional[int],
        transaction_type: str,
        amount_paise: int,
        cashback_paise: int,
        idempotency_key: str,
        status: str = "SUCCESS"
    ) -> Transaction:
        tx = Transaction(
            user_id=user_id,
            wallet_id=wallet_id,
            merchant_id=merchant_id,
            transaction_type=transaction_type,
            amount_paise=amount_paise,
            cashback_paise=cashback_paise,
            idempotency_key=idempotency_key,
            status=status
        )
        self.db.add(tx)
        self.db.flush()
        return tx

    def list_by_user(self, user_id: int, limit: int = 100) -> List[Transaction]:
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.merchant))
            .filter(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_by_merchant(self, merchant_id: int, limit: int = 100) -> List[Transaction]:
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.user))
            .filter(Transaction.merchant_id == merchant_id, Transaction.transaction_type == "payment")
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .all()
        )

    def list_all(self, limit: int = 200) -> List[Transaction]:
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.merchant), joinedload(Transaction.user))
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .all()
        )

    def count_all(self) -> int:
        return self.db.query(Transaction).count()

    def sum_payment_amount(self) -> int:
        val = (
            self.db.query(func.sum(Transaction.amount_paise))
            .filter(Transaction.transaction_type == "payment", Transaction.status == "SUCCESS")
            .scalar()
        )
        return val or 0

    def sum_cashback_distributed(self) -> int:
        val = (
            self.db.query(func.sum(Transaction.cashback_paise))
            .filter(Transaction.status == "SUCCESS")
            .scalar()
        )
        return val or 0

    def sum_cashback_by_user(self, user_id: int) -> int:
        val = (
            self.db.query(func.sum(Transaction.cashback_paise))
            .filter(Transaction.user_id == user_id, Transaction.status == "SUCCESS")
            .scalar()
        )
        return val or 0
