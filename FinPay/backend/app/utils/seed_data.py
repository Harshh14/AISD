from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.repositories.wallet_repository import WalletRepository
from app.repositories.merchant_repository import MerchantRepository
from app.repositories.cashback_repository import CashbackRepository
from app.repositories.transaction_repository import TransactionRepository
from app.utils.auth import hash_password
from datetime import datetime, timezone
import uuid

def seed_initial_data(db: Session):
    user_repo = UserRepository(db)
    wallet_repo = WalletRepository(db)
    merchant_repo = MerchantRepository(db)
    cashback_repo = CashbackRepository(db)
    tx_repo = TransactionRepository(db)

    # 1. Cashback Rules (BASIC tier)
    # Canteen: 2% (200 bps), Rs 50 (5000 paise)
    # Stationery: 1% (100 bps), Rs 20 (2000 paise)
    # Transport: 3% (300 bps), Rs 100 (10000 paise)
    # Hostel: 0.5% (50 bps), Rs 200 (20000 paise)
    # Online: 1% (100 bps), Rs 30 (3000 paise)
    # Top-up: 0%, Rs 0
    rules_data = [
        ("Canteen", 200, 5000),
        ("Stationery", 100, 2000),
        ("Transport", 300, 10000),
        ("Hostel", 50, 20000),
        ("Online", 100, 3000),
        ("Top-up", 0, 0),
    ]
    for cat, rate_bps, cap_paise in rules_data:
        if not cashback_repo.get_rule_by_category(cat):
            cashback_repo.create_rule(cat, rate_bps, cap_paise)
    db.commit()

    # 2. Merchants
    merchants_data = [
        ("Campus Canteen", "Canteen", "Main student cafeteria, food court, and snacks counter", True),
        ("College Stationery", "Stationery", "Textbooks, notebooks, lab records, and stationery items", True),
        ("Campus Transport", "Transport", "College shuttle, bus passes, and student campus transit", True),
        ("Hostel Services", "Hostel", "Hostel laundry, amenities, maintenance, and dining fees", True),
        ("Online Services", "Online", "Campus digital library, print quota, and software licenses", True),
    ]
    merchant_map = {}
    for name, cat, desc, active in merchants_data:
        m = merchant_repo.get_by_name(name)
        if not m:
            m = merchant_repo.create(name, cat, desc, active)
        merchant_map[cat] = m
    db.commit()

    # 3. Admin Account
    admin_email = "admin@finpay.edu"
    if not user_repo.get_by_email(admin_email):
        user_repo.create(
            name="College Admin",
            email=admin_email,
            password_hash=hash_password("Admin@2024"),
            role="admin",
            membership_tier="PREMIUM"
        )
    db.commit()

    # 4. Merchant Accounts (1 login per merchant)
    merchant_users = [
        ("Canteen Manager", "canteen@finpay.edu", "Merchant@2024"),
        ("Stationery Store", "stationery@finpay.edu", "Merchant@2024"),
        ("Transport Desk", "transport@finpay.edu", "Merchant@2024"),
        ("Hostel Warden", "hostel@finpay.edu", "Merchant@2024"),
        ("IT Admin", "online@finpay.edu", "Merchant@2024"),
    ]
    for mname, memail, mpwd in merchant_users:
        if not user_repo.get_by_email(memail):
            user_repo.create(
                name=mname,
                email=memail,
                password_hash=hash_password(mpwd),
                role="merchant",
                membership_tier="BASIC"
            )
    db.commit()

    # 5. Demo Students (BASIC, PRIME, PREMIUM)
    demo_students = [
        ("Aarav Sharma", "aarav@student.edu", "Student@2024", "BASIC", 250000),      # Rs 2,500
        ("Priya Nair", "priya@student.edu", "Student@2024", "PRIME", 500000),        # Rs 5,000
        ("Rohan Verma", "rohan@student.edu", "Student@2024", "PREMIUM", 1000000),    # Rs 10,000
        ("Sneha Patel", "sneha@student.edu", "Student@2024", "BASIC", 150000),       # Rs 1,500
    ]
    student_map = {}
    for sname, semail, spwd, tier, init_bal in demo_students:
        s = user_repo.get_by_email(semail)
        if not s:
            s = user_repo.create(
                name=sname,
                email=semail,
                password_hash=hash_password(spwd),
                role="student",
                membership_tier=tier
            )
            w = wallet_repo.create(s.id, init_bal)
            db.commit()
            student_map[semail] = (s, w)
        else:
            w = wallet_repo.get_by_user_id(s.id)
            student_map[semail] = (s, w)

    # 6. Sample Initial Transactions if table is empty
    if tx_repo.count_all() == 0:
        now = datetime.now(timezone.utc)
        # Sample topup for Aarav
        s_aarav, w_aarav = student_map.get("aarav@student.edu", (None, None))
        if s_aarav and w_aarav:
            tx_repo.create(
                user_id=s_aarav.id,
                wallet_id=w_aarav.id,
                merchant_id=None,
                transaction_type="topup",
                amount_paise=100000,
                cashback_paise=0,
                idempotency_key=f"seed-topup-{uuid.uuid4().hex[:8]}",
                status="SUCCESS"
            )
            # Sample payment at canteen (Rs 500 = 50000 paise). BASIC = 2% = 1000 paise (Rs 10)
            m_canteen = merchant_map.get("Canteen")
            if m_canteen:
                tx_repo.create(
                    user_id=s_aarav.id,
                    wallet_id=w_aarav.id,
                    merchant_id=m_canteen.id,
                    transaction_type="payment",
                    amount_paise=50000,
                    cashback_paise=1000,
                    idempotency_key=f"seed-pay-{uuid.uuid4().hex[:8]}",
                    status="SUCCESS"
                )
                cashback_repo.upsert_usage(s_aarav.id, "Canteen", now.month, now.year, 1000)

        # Sample payment for Priya (PRIME) at Transport (Rs 300 = 30000 paise).
        # Transport base: 3% = 300 bps. PRIME = 1.5x = 450 bps = 4.5%.
        # 30000 * 450 // 10000 = 1350 paise (Rs 13.50)
        s_priya, w_priya = student_map.get("priya@student.edu", (None, None))
        m_trans = merchant_map.get("Transport")
        if s_priya and w_priya and m_trans:
            tx_repo.create(
                user_id=s_priya.id,
                wallet_id=w_priya.id,
                merchant_id=m_trans.id,
                transaction_type="payment",
                amount_paise=30000,
                cashback_paise=1350,
                idempotency_key=f"seed-pay-{uuid.uuid4().hex[:8]}",
                status="SUCCESS"
            )
            cashback_repo.upsert_usage(s_priya.id, "Transport", now.month, now.year, 1350)

        # Sample payment for Rohan (PREMIUM) at Online (Rs 1000 = 100000 paise).
        # Online base: 1% = 100 bps. PREMIUM = 2x = 200 bps = 2%.
        # 100000 * 200 // 10000 = 2000 paise (Rs 20)
        s_rohan, w_rohan = student_map.get("rohan@student.edu", (None, None))
        m_online = merchant_map.get("Online")
        if s_rohan and w_rohan and m_online:
            tx_repo.create(
                user_id=s_rohan.id,
                wallet_id=w_rohan.id,
                merchant_id=m_online.id,
                transaction_type="payment",
                amount_paise=100000,
                cashback_paise=2000,
                idempotency_key=f"seed-pay-{uuid.uuid4().hex[:8]}",
                status="SUCCESS"
            )
            cashback_repo.upsert_usage(s_rohan.id, "Online", now.month, now.year, 2000)

        db.commit()
    print("Seed complete.")
