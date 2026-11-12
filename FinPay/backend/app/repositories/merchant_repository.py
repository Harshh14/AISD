from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.merchant import Merchant

class MerchantRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, merchant_id: int) -> Optional[Merchant]:
        return self.db.query(Merchant).filter(Merchant.id == merchant_id).first()

    def get_by_name(self, name: str) -> Optional[Merchant]:
        return self.db.query(Merchant).filter(Merchant.merchant_name == name).first()

    def list_all(self, active_only: bool = False) -> List[Merchant]:
        q = self.db.query(Merchant)
        if active_only:
            q = q.filter(Merchant.is_active.is_(True))
        return q.order_by(Merchant.id.asc()).all()

    def count(self) -> int:
        return self.db.query(Merchant).count()

    def create(self, merchant_name: str, category: str, description: Optional[str] = None, is_active: bool = True) -> Merchant:
        merchant = Merchant(
            merchant_name=merchant_name.strip(),
            category=category.strip(),
            description=description,
            is_active=is_active
        )
        self.db.add(merchant)
        self.db.flush()
        return merchant

    def update(self, merchant: Merchant, **fields) -> Merchant:
        for k, v in fields.items():
            if v is not None:
                setattr(merchant, k, v)
        self.db.flush()
        return merchant

    def delete(self, merchant: Merchant):
        self.db.delete(merchant)
        self.db.flush()
