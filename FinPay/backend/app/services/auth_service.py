from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.repositories.wallet_repository import WalletRepository
from app.utils.auth import hash_password, verify_password, create_access_token

def register_user(db: Session, name: str, email: str, password: str, role: str = "student", membership_tier: str = "BASIC"):
    repo = UserRepository(db)
    existing = repo.get_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    try:
        user = repo.create(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            membership_tier=membership_tier
        )
        if role == "student":
            wallet_repo = WalletRepository(db)
            wallet_repo.create(user_id=user.id, initial_balance_paise=0)

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

def authenticate_user(db: Session, email: str, password: str):
    repo = UserRepository(db)
    user = repo.get_by_email(email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.name
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name,
        "email": user.email,
        "membership_tier": user.membership_tier
    }
