from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.merchant import MerchantResponse, MerchantCreate, MerchantUpdate
from app.repositories.merchant_repository import MerchantRepository
from app.utils.auth import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/api/merchants", tags=["Merchants"])

@router.get("", response_model=List[MerchantResponse])
def list_merchants(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = MerchantRepository(db)
    # Students see active merchants only; admins and merchants see all
    if current_user.role == "student":
        return repo.list_all(active_only=True)
    return repo.list_all(active_only=False)

@router.get("/{merchant_id}", response_model=MerchantResponse)
def get_merchant(
    merchant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = MerchantRepository(db)
    merchant = repo.get_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found.")
    return merchant

@router.post("", response_model=MerchantResponse, status_code=status.HTTP_201_CREATED)
def create_merchant(
    req: MerchantCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    repo = MerchantRepository(db)
    existing = repo.get_by_name(req.merchant_name)
    if existing:
        raise HTTPException(status_code=400, detail="Merchant name already exists.")

    merchant = repo.create(
        merchant_name=req.merchant_name,
        category=req.category,
        description=req.description,
        is_active=req.is_active
    )
    db.commit()
    db.refresh(merchant)
    return merchant

@router.put("/{merchant_id}", response_model=MerchantResponse)
def update_merchant(
    merchant_id: int,
    req: MerchantUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    repo = MerchantRepository(db)
    merchant = repo.get_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found.")

    updated = repo.update(merchant, **req.model_dump(exclude_unset=True))
    db.commit()
    db.refresh(updated)
    return updated

@router.delete("/{merchant_id}")
def delete_merchant(
    merchant_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    repo = MerchantRepository(db)
    merchant = repo.get_by_id(merchant_id)
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found.")

    repo.delete(merchant)
    db.commit()
    return {"message": "Merchant deleted successfully", "merchant_id": merchant_id}
