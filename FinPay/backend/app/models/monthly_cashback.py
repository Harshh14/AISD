from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class MonthlyCashbackUsage(Base):
    __tablename__ = "monthly_cashback_usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    cashback_used_paise = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint("user_id", "category", "month", "year", name="uq_user_cat_month_year"),
    )

    user = relationship("User", back_populates="monthly_usages")
