from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchants.id", ondelete="SET NULL"), nullable=True)
    transaction_type = Column(String(20), nullable=False)  # payment, topup
    amount_paise = Column(Integer, nullable=False)
    cashback_paise = Column(Integer, nullable=False, default=0)
    idempotency_key = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(20), nullable=False, default="SUCCESS")  # SUCCESS, FAILED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="transactions")
    wallet = relationship("Wallet", back_populates="transactions")
    merchant = relationship("Merchant", back_populates="transactions")
