# FinPay – Campus Digital Wallet & Cashback Management System

FinPay is a full-stack campus digital wallet and cashback management web application developed using **Python FastAPI** and **SQLite** for college AI-Assisted Software Development laboratory demonstration.

It enables students to maintain a digital wallet balance, execute simulated top-ups, make instant payments to campus merchants (canteen, stationery, transport, hostel, online), track detailed transaction history, and receive automated cashback based on their **Membership Tier** and **Merchant Category**.

---

## 1. Key Features

- **Layered Architecture:** Strict separation of concerns (**Router &rarr; Service &rarr; Repository &rarr; Model/Database**).
- **Zero-Float Financial Math:** All internal balance, payment, and cashback calculations are performed in **integer paise** with integer floor division (`//`) to avoid floating-point rounding errors.
- **Three-Tier Membership System:**
  - **BASIC (1.0x):** Base rates and monthly caps.
  - **PRIME (1.5x):** 1.5x cashback rate and 1.5x monthly category cap.
  - **PREMIUM (2.0x):** 2.0x double cashback rate and 2.0x monthly category cap.
- **Category Monthly Caps:** Automatically tracked per student, per category, per calendar month.
- **Payment Idempotency:** Guarantees no duplicate charges if a request is resubmitted with the same idempotency key.
- **Persistent SQLite Database:** Fully normalized schema with primary keys, foreign keys, unique constraints, and relationships.
- **Role-Based JWT Authentication:** Three dedicated roles: **Student**, **Merchant**, and **Admin**.
- **Interactive Web Frontend:** Built with clean HTML5, CSS3, and JavaScript Fetch API without heavy framework dependencies.

---

## 2. Technology Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2
- **Security:** JWT (JSON Web Tokens via python-jose), Password Hashing (passlib bcrypt)
- **Database:** SQLite with SQLAlchemy ORM
- **Frontend:** HTML5, CSS3, Modern JavaScript (Fetch API, responsive layout)
- **Testing:** pytest, FastAPI TestClient (HTTPX)

---

## 3. Membership Tiers & Cashback Matrix

| Merchant Category | BASIC Rate | BASIC Cap | PRIME Rate (1.5x) | PRIME Cap (1.5x) | PREMIUM Rate (2x) | PREMIUM Cap (2x) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Canteen** | 2.0% | ₹50 | 3.0% | ₹75 | 4.0% | ₹100 |
| **Stationery** | 1.0% | ₹20 | 1.5% | ₹30 | 2.0% | ₹40 |
| **Transport** | 3.0% | ₹100 | 4.5% | ₹150 | 6.0% | ₹200 |
| **Hostel** | 0.5% | ₹200 | 0.75% | ₹300 | 1.0% | ₹400 |
| **Online** | 1.0% | ₹30 | 1.5% | ₹45 | 2.0% | ₹60 |
| **Top-up** | 0.0% | ₹0 | 0.0% | ₹0 | 0.0% | ₹0 |

---

## 4. Pre-Seeded Demo Login Credentials

On startup, FinPay automatically seeds demo accounts with realistic balances and transactions:

### A. Students
| Name | Email | Password | Tier | Initial Balance |
| :--- | :--- | :--- | :---: | :---: |
| **Aarav Sharma** | `aarav@student.edu` | `Student@2024` | BASIC | ₹2,500.00 |
| **Priya Nair** | `priya@student.edu` | `Student@2024` | PRIME | ₹5,000.00 |
| **Rohan Verma** | `rohan@student.edu` | `Student@2024` | PREMIUM | ₹10,000.00 |
| **Sneha Patel** | `sneha@student.edu` | `Student@2024` | BASIC | ₹1,500.00 |

### B. Campus Administration
| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **College Admin** | `admin@finpay.edu` | `Admin@2024` | Manage student tiers, merchants, audit ledger |

### C. Campus Merchants
| Store | Category | Email | Password |
| :--- | :--- | :--- | :--- |
| **Campus Canteen** | Canteen | `canteen@finpay.edu` | `Merchant@2024` |
| **College Stationery** | Stationery | `stationery@finpay.edu` | `Merchant@2024` |
| **Campus Transport** | Transport | `transport@finpay.edu` | `Merchant@2024` |
| **Hostel Services** | Hostel | `hostel@finpay.edu` | `Merchant@2024` |
| **Online Services** | Online | `online@finpay.edu` | `Merchant@2024` |

---

## 5. Project Directory Structure

```
FinPay/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Application Entry & Static Mounts
│   │   ├── database.py              # SQLite Engine & Session Configuration
│   │   ├── config.py                # JWT & Environment Settings
│   │   ├── models/                  # SQLAlchemy ORM Entities
│   │   │   ├── user.py
│   │   │   ├── wallet.py
│   │   │   ├── merchant.py
│   │   │   ├── cashback_rule.py
│   │   │   ├── transaction.py
│   │   │   └── monthly_cashback.py
│   │   ├── schemas/                 # Pydantic Validation Schemas
│   │   │   ├── auth.py
│   │   │   ├── wallet.py
│   │   │   ├── merchant.py
│   │   │   ├── payment.py
│   │   │   ├── cashback.py
│   │   │   └── admin.py
│   │   ├── repositories/            # Database Query Layer
│   │   │   ├── user_repository.py
│   │   │   ├── wallet_repository.py
│   │   │   ├── merchant_repository.py
│   │   │   ├── transaction_repository.py
│   │   │   └── cashback_repository.py
│   │   ├── services/                # Business Logic Layer
│   │   │   ├── auth_service.py
│   │   │   ├── wallet_service.py
│   │   │   ├── payment_service.py   # Atomic Payment & Idempotency
│   │   │   └── cashback_service.py  # Integer Paise Calculation Engine
│   │   ├── routers/                 # API Endpoints
│   │   │   ├── auth.py
│   │   │   ├── wallet.py
│   │   │   ├── merchants.py
│   │   │   ├── payments.py
│   │   │   ├── cashback.py
│   │   │   └── admin.py
│   │   └── utils/                   # Security, Hashing, & Seeder
│   │       ├── auth.py
│   │       └── seed_data.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/                        # Web Application (16 Pages)
│   ├── index.html                   # Landing Page
│   ├── login.html                   # Sign In
│   ├── register.html                # Student Registration
│   ├── student/
│   │   ├── dashboard.html           # Student Overview & Wallet Stats
│   │   ├── wallet.html              # Balance & Top-Up Simulation
│   │   ├── pay.html                 # Merchant Payment Interface
│   │   ├── transactions.html        # Ledger & Filtering
│   │   ├── cashback.html            # Tier Rules & Monthly Caps
│   │   └── profile.html             # Profile Details
│   ├── merchant/
│   │   ├── dashboard.html           # Merchant Overview & Totals
│   │   └── transactions.html        # Received Customer Payments
│   ├── admin/
│   │   ├── dashboard.html           # System Stats & Tier Distribution
│   │   ├── students.html            # Tier Assignment Portal
│   │   ├── merchants.html           # Store CRUD
│   │   ├── cashback_rules.html      # Policy Matrix
│   │   └── transactions.html        # Campus-wide Ledger
│   ├── css/
│   │   └── style.css                # Professional Light Theme (Navy/Teal)
│   └── js/
│       ├── api.js                   # Fetch API Client & Token Management
│       ├── auth.js                  # Login & Registration Handlers
│       └── utils.js                 # Formatters & UI Badges
├── database/                        # Persistent SQLite DB Storage
├── tests/
│   └── test_finpay.py               # 15 Comprehensive Pytest Unit Tests
└── README.md
```

---

## 6. Installation & Execution (Windows)

### Step 1: Open PowerShell
Navigate to the FinPay backend directory:
```powershell
cd /d "D:\AI Assisted\FinPay\backend"
```

### Step 2: Create & Activate Virtual Environment
```powershell
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Run the FastAPI Server
```powershell
uvicorn app.main:app --reload
```

---

## 7. Accessing the Application

- **Frontend Website:** Open [http://127.0.0.1:8000](http://127.0.0.1:8000) or open `frontend\index.html` directly in your browser.
- **FastAPI Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 8. Running the Automated Test Suite

To run all 15 automated test cases covering registration, login, wallet top-up, cashback calculations (BASIC, PRIME, PREMIUM), monthly caps, zero top-up cashback, duplicate idempotency, and RBAC:

```powershell
cd /d "D:\AI Assisted\FinPay"
pytest tests -v
```

All 15 tests run against an isolated SQLite test database and verify integer paise precision.
