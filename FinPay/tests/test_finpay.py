import os
import sys
import tempfile
import uuid
from pathlib import Path

# Configure isolated test database in temp folder BEFORE importing FastAPI app
os.environ["TESTING"] = "1"
TEST_DB_PATH = os.path.join(tempfile.gettempdir(), "finpay_test_suite.db").replace("\\", "/")
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import pytest
from fastapi.testclient import TestClient
import app.models
from app.main import app as fastapi_app
from app.database import Base, engine, SessionLocal, get_db
from app.models.cashback_rule import CashbackRule
from app.models.merchant import Merchant
from app.models.user import User

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Seed standard cashback rules for tests
    rules = [
        CashbackRule(category="Canteen", base_cashback_rate_bps=200, base_monthly_cap_paise=5000),      # 2%, Rs 50
        CashbackRule(category="Stationery", base_cashback_rate_bps=100, base_monthly_cap_paise=2000),   # 1%, Rs 20
        CashbackRule(category="Transport", base_cashback_rate_bps=300, base_monthly_cap_paise=10000),   # 3%, Rs 100
        CashbackRule(category="Hostel", base_cashback_rate_bps=50, base_monthly_cap_paise=20000),       # 0.5%, Rs 200
        CashbackRule(category="Online", base_cashback_rate_bps=100, base_monthly_cap_paise=3000),       # 1%, Rs 30
        CashbackRule(category="Top-up", base_cashback_rate_bps=0, base_monthly_cap_paise=0),            # 0%, Rs 0
    ]
    db.add_all(rules)

    # Seed a standard merchant
    m = Merchant(merchant_name="Campus Canteen", category="Canteen", description="Cafeteria", is_active=True)
    db.add(m)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)

client = TestClient(fastapi_app)

def register_and_get_token(name, email, password="Password@123"):
    client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

# 1. Student Registration
def test_student_registration():
    res = client.post("/api/auth/register", json={
        "name": "Ananya Roy",
        "email": "ananya@student.edu",
        "password": "Password@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Ananya Roy"
    assert data["email"] == "ananya@student.edu"
    assert data["role"] == "student"
    assert data["membership_tier"] == "BASIC"

# 2. Login
def test_user_login():
    register_and_get_token("Vikram Singh", "vikram@student.edu")
    res = client.post("/api/auth/login", json={
        "email": "vikram@student.edu",
        "password": "Password@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "student"

# 3. Wallet Balance Retrieval
def test_wallet_balance_retrieval():
    token = register_and_get_token("Kavya Pillai", "kavya@student.edu")
    res = client.get("/api/wallet", headers=auth_header(token))
    assert res.status_code == 200
    assert res.json()["balance_paise"] == 0
    assert res.json()["balance_rupees"] == 0.0

# 4. Wallet Top-Up
def test_wallet_topup():
    token = register_and_get_token("Rahul Mehta", "rahul@student.edu")
    topup_res = client.post("/api/wallet/topup", json={
        "amount_paise": 50000,  # Rs 500
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert topup_res.status_code == 200
    assert topup_res.json()["amount_paise"] == 50000
    assert topup_res.json()["cashback_paise"] == 0

    bal_res = client.get("/api/wallet", headers=auth_header(token))
    assert bal_res.json()["balance_paise"] == 50000

# 5. Successful Merchant Payment
def test_successful_merchant_payment():
    token = register_and_get_token("Deepak Kumar", "deepak@student.edu")
    # Top-up Rs 1,000 (100,000 paise)
    client.post("/api/wallet/topup", json={
        "amount_paise": 100000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))

    # Pay Rs 200 (20,000 paise) at Canteen (Merchant ID 1)
    pay_res = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 20000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert pay_res.status_code == 200
    tx = pay_res.json()
    assert tx["status"] == "SUCCESS"
    assert tx["amount_paise"] == 20000
    # 2% of 20000 paise = 400 paise
    assert tx["cashback_paise"] == 400

    # Wallet: 100,000 - 20,000 + 400 = 80,400 paise
    bal_res = client.get("/api/wallet", headers=auth_header(token))
    assert bal_res.json()["balance_paise"] == 80400

# 6. Insufficient Wallet Balance
def test_insufficient_wallet_balance():
    token = register_and_get_token("Broke Student", "broke@student.edu")
    # Balance is 0, attempting to pay Rs 100
    pay_res = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 10000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert pay_res.status_code == 400
    assert "Insufficient wallet balance" in pay_res.json()["detail"]

# 7. Zero or Negative Payment Amount
def test_zero_or_negative_payment_amount():
    token = register_and_get_token("Zero Pay", "zero@student.edu")
    # Top up first
    client.post("/api/wallet/topup", json={
        "amount_paise": 50000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))

    # Pay 0
    res_zero = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 0,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res_zero.status_code == 400

    # Pay negative
    res_neg = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": -500,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res_neg.status_code == 400

# 8. BASIC Cashback Calculation
def test_basic_cashback_calculation():
    # BASIC: Canteen rate is 2% = 200 bps
    # Payment of Rs 500 (50,000 paise) -> 50,000 * 200 // 10000 = 1,000 paise (Rs 10)
    token = register_and_get_token("Basic Student", "basic_test@student.edu")
    client.post("/api/wallet/topup", json={"amount_paise": 100000, "idempotency_key": str(uuid.uuid4())}, headers=auth_header(token))

    res = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 50000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res.json()["cashback_paise"] == 1000

# 9. PRIME Cashback Calculation (1.5x)
def test_prime_cashback_calculation():
    # PRIME: Canteen rate is 2% * 1.5 = 3% = 300 bps
    # Payment of Rs 500 (50,000 paise) -> 50,000 * 300 // 10000 = 1,500 paise (Rs 15)
    token = register_and_get_token("Prime Student", "prime_test@student.edu")
    # Update tier in DB to PRIME
    db = SessionLocal()
    user = db.query(User).filter_by(email="prime_test@student.edu").first()
    user.membership_tier = "PRIME"
    db.commit()
    db.close()

    client.post("/api/wallet/topup", json={"amount_paise": 100000, "idempotency_key": str(uuid.uuid4())}, headers=auth_header(token))
    res = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 50000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res.json()["cashback_paise"] == 1500

# 10. PREMIUM Cashback Calculation (2.0x)
def test_premium_cashback_calculation():
    # PREMIUM: Canteen rate is 2% * 2 = 4% = 400 bps
    # Payment of Rs 500 (50,000 paise) -> 50,000 * 400 // 10000 = 2,000 paise (Rs 20)
    token = register_and_get_token("Premium Student", "premium_test@student.edu")
    db = SessionLocal()
    user = db.query(User).filter_by(email="premium_test@student.edu").first()
    user.membership_tier = "PREMIUM"
    db.commit()
    db.close()

    client.post("/api/wallet/topup", json={"amount_paise": 100000, "idempotency_key": str(uuid.uuid4())}, headers=auth_header(token))
    res = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 50000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res.json()["cashback_paise"] == 2000

# 11. Monthly Cashback Cap Enforcement
def test_monthly_cashback_cap_enforcement():
    # BASIC Canteen cap is Rs 50 = 5000 paise.
    # At 2%, a payment of Rs 2,500 (250,000 paise) yields 5,000 paise cashback (exhausts cap).
    # Next payment should yield exactly 0 cashback!
    token = register_and_get_token("Capped Student", "capped@student.edu")
    client.post("/api/wallet/topup", json={"amount_paise": 500000, "idempotency_key": str(uuid.uuid4())}, headers=auth_header(token))

    res1 = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 250000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res1.json()["cashback_paise"] == 5000

    # Second payment after cap reached
    res2 = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 50000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res2.json()["cashback_paise"] == 0

# 12. Top-Up Receives Zero Cashback
def test_topup_receives_zero_cashback():
    token = register_and_get_token("Topup Zero", "topup_zero@student.edu")
    res = client.post("/api/wallet/topup", json={
        "amount_paise": 200000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res.json()["cashback_paise"] == 0

# 13. Duplicate Idempotency Request
def test_duplicate_idempotency_request():
    token = register_and_get_token("Idemp Student", "idemp@student.edu")
    client.post("/api/wallet/topup", json={"amount_paise": 100000, "idempotency_key": str(uuid.uuid4())}, headers=auth_header(token))

    same_key = "idemp-key-constant-12345"
    # First payment
    res1 = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 20000,
        "idempotency_key": same_key
    }, headers=auth_header(token))
    assert res1.status_code == 200
    tx1_id = res1.json()["id"]

    # Re-submitting with the EXACT same key
    res2 = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 20000,
        "idempotency_key": same_key
    }, headers=auth_header(token))
    assert res2.status_code == 200
    assert res2.json()["id"] == tx1_id  # Returns original transaction without charging twice

    # Balance check: should only have been deducted ONCE
    bal = client.get("/api/wallet", headers=auth_header(token)).json()["balance_paise"]
    # 100,000 - 20,000 + 400 = 80,400 paise
    assert bal == 80400

# 14. Failed Payment Does Not Change Wallet Balance
def test_failed_payment_does_not_change_balance():
    token = register_and_get_token("Fail Check", "fail_check@student.edu")
    client.post("/api/wallet/topup", json={"amount_paise": 5000, "idempotency_key": str(uuid.uuid4())}, headers=auth_header(token))

    # Try to pay 10,000 (fails due to insufficient funds)
    res = client.post("/api/payments", json={
        "merchant_id": 1,
        "amount_paise": 10000,
        "idempotency_key": str(uuid.uuid4())
    }, headers=auth_header(token))
    assert res.status_code == 400

    bal = client.get("/api/wallet", headers=auth_header(token)).json()["balance_paise"]
    assert bal == 5000  # Untouched

# 15. Role-Based Authorization
def test_role_based_authorization():
    # Student should be forbidden from accessing admin endpoints
    student_token = register_and_get_token("Normal Student", "normal@student.edu")
    res = client.get("/api/admin/dashboard", headers=auth_header(student_token))
    assert res.status_code == 403
