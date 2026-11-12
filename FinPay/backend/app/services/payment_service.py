from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.transaction import Transaction
from app.repositories.user_repository import UserRepository
from app.repositories.wallet_repository import WalletRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.cashback_repository import CashbackRepository
from app.services.cashback_service import calculate_cashback

def process_payment(
    db: Session,
    user_id: int,
    merchant_id: int,
    amount_paise: int,
    idempotency_key: str
) -> Transaction:
    """
    Process merchant payment atomically:
    1. Validate payment (amount > 0, merchant active).
    2. Check idempotency: if key exists, return existing transaction.
    3. Check wallet balance.
    4. Call calculate_cashback().
    5. Deduct payment amount.
    6. Credit eligible cashback to wallet.
    7. Update monthly cashback usage.
    8. Create transaction record.
    9. Commit all changes safely.
    """
    if amount_paise <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount must be greater than zero."
        )

    tx_repo = TransactionRepository(db)
    existing_tx = tx_repo.get_by_idempotency_key(idempotency_key)
    if existing_tx:
        # Idempotent response: return previously processed transaction without re-executing
        return existing_tx

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    merchant_repo = MerchantRepository(db)
    merchant = merchant_repo.get_by_id(merchant_id)
    if not merchant or not merchant.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant not found or inactive."
        )

    wallet_repo = WalletRepository(db)
    wallet = wallet_repo.get_by_user_id(user_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found.")

    if wallet.balance_paise < amount_paise:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient wallet balance. Current: ₹{wallet.balance_paise/100:.2f}, Required: ₹{amount_paise/100:.2f}"
        )

    cashback_repo = CashbackRepository(db)
    rule = cashback_repo.get_rule_by_category(merchant.category)
    now = datetime.now(timezone.utc)

    cashback_paise = 0
    if rule and rule.base_cashback_rate_bps > 0:
        usage = cashback_repo.get_monthly_usage(user_id, merchant.category, now.month, now.year)
        used_paise = usage.cashback_used_paise if usage else 0

        cashback_paise = calculate_cashback(
            amount_paise=amount_paise,
            category=merchant.category,
            membership_tier=user.membership_tier or "BASIC",
            base_rate_bps=rule.base_cashback_rate_bps,
            base_cap_paise=rule.base_monthly_cap_paise,
            current_month_used_paise=used_paise
        )

    try:
        # Atomic deduction and cashback credit
        wallet_repo.update_balance(wallet, -amount_paise)
        if cashback_paise > 0:
            wallet_repo.update_balance(wallet, cashback_paise)
            cashback_repo.upsert_usage(user_id, merchant.category, now.month, now.year, cashback_paise)

        tx = tx_repo.create(
            user_id=user_id,
            wallet_id=wallet.id,
            merchant_id=merchant.id,
            transaction_type="payment",
            amount_paise=amount_paise,
            cashback_paise=cashback_paise,
            idempotency_key=idempotency_key,
            status="SUCCESS"
        )
        db.commit()
        db.refresh(tx)
        return tx
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing failed: {str(e)}"
        )

def process_topup(
    db: Session,
    user_id: int,
    amount_paise: int,
    idempotency_key: str
) -> Transaction:
    if amount_paise <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Top-up amount must be greater than zero."
        )

    tx_repo = TransactionRepository(db)
    existing_tx = tx_repo.get_by_idempotency_key(idempotency_key)
    if existing_tx:
        return existing_tx

    wallet_repo = WalletRepository(db)
    wallet = wallet_repo.get_by_user_id(user_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found.")

    try:
        wallet_repo.update_balance(wallet, amount_paise)
        tx = tx_repo.create(
            user_id=user_id,
            wallet_id=wallet.id,
            merchant_id=None,
            transaction_type="topup",
            amount_paise=amount_paise,
            cashback_paise=0,  # Top-ups never receive cashback
            idempotency_key=idempotency_key,
            status="SUCCESS"
        )
        db.commit()
        db.refresh(tx)
        return tx
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Top-up processing failed: {str(e)}"
        )
