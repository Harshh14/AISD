from sqlalchemy import Column, Integer, String
from app.database import Base

class CashbackRule(Base):
    __tablename__ = "cashback_rules"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), unique=True, nullable=False)
    base_cashback_rate_bps = Column(Integer, nullable=False)  # e.g. 200 bps = 2%
    base_monthly_cap_paise = Column(Integer, nullable=False)  # e.g. 5000 paise = Rs 50
