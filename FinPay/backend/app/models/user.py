from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="student")  # student, merchant, admin
    membership_tier = Column(String(20), nullable=False, default="BASIC")  # BASIC, PRIME, PREMIUM
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    monthly_usages = relationship("MonthlyCashbackUsage", back_populates="user", cascade="all, delete-orphan")
