from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    merchant_name = Column(String(100), unique=True, nullable=False)
    category = Column(String(50), nullable=False)  # Canteen, Stationery, Transport, Hostel, Online
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    transactions = relationship("Transaction", back_populates="merchant")
