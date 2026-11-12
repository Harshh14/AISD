from sqlalchemy.orm import Session
from typing import Optional
from app.models.wallet import Wallet

class WalletRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> Optional[Wallet]:
        return self.db.query(Wallet).filter(Wallet.user_id == user_id).first()

    def create(self, user_id: int, initial_balance_paise: int = 0) -> Wallet:
        wallet = Wallet(user_id=user_id, balance_paise=initial_balance_paise)
        self.db.add(wallet)
        self.db.flush()
        return wallet

    def update_balance(self, wallet: Wallet, delta_paise: int) -> Wallet:
        wallet.balance_paise += delta_paise
        self.db.flush()
        return wallet
